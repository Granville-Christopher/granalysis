// ...existing code...
import Sidebar from "../components/dashboard-components/Sidebar";
import Header from "../components/dashboard-components/Header";
import TablePreview from "../components/dashboard-components/TablePreview";
// import SalesChart from "../components/dashboard-components/SalesChart";
import DashboardLayout from "../components/dashboard-components/DashboardLayout";
import ToggleSidebarButton from "../components/dashboard-components/ToggleSidebarButton";


import React, { useState, useEffect } from "react";
import axios from "axios";
import FileUploadOverlay from "../components/dashboard-components/FileUploadOverlay";
import { useNavigate } from "react-router-dom";

import { FileInsights } from "../types/file.types";
import pythonApi from "../utils/pythonApi";
import InsightsPanel from "../components/dashboard-components/InsightsPanel";
import { fetchInsights } from "../api/fettchInsights";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [filesRefreshKey, setFilesRefreshKey] = useState(0);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [fileData, setFileData] = useState<FileInsights | null>(null);

  // Optionally handle uploaded file here
  const handleFileUploaded = (file: File) => {
    const upload = async () => {
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/files/upload", {
          method: "POST",
          body: form,
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Upload failed");
        }

        const data = await res.json();
        if (!data || data.status === "error") {
          throw new Error(data?.message || "Upload failed");
        }

        // ✅ FIXED: Ensure the correct ID from backend is used (data.file_id or data.fileId)
        const fileId = data.file_id || data.fileId;
        if (!fileId) throw new Error("File ID not returned from server");

        // close overlay and trigger refresh
        setShowUploadOverlay(false);
        setFilesRefreshKey((k) => k + 1);

        // ✅ enqueue processing and show loading overlay
        setInsightsLoading(true);
        await fetch(`/files/${fileId}/enqueue`, {
          method: "POST",
          credentials: "include",
        });

        // ✅ Poll Python backend for data using correct fileId
        const poll = async () => {
          try {
            const sres = await fetch(`/files/${fileId}/status`, {
              credentials: "include",
            });
            const sdata = await sres.json();
            if (sdata?.status === "done") {
              setInsightsLoading(false);
              setFilesRefreshKey((k) => k + 1);

              // ✅ Fetch processed data from Python backend
              const dataRes = await pythonApi.get(`/data/${fileId}`);
              setFileData(dataRes.data);
              return;
            }
          } catch (e) {
            // ignore and retry
          }
          setTimeout(poll, 2000);
        };
        setTimeout(poll, 2000);
      } catch (err) {
        console.error("File upload failed", err);
        setShowUploadOverlay(false);
        setInsightsLoading(false);
      }
    };
    upload();
  };

  // fetch current user on mount
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        if (res.data?.status === "success") {
          setUser(res.data.user);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/login");
      }
    };
    fetchMe();
  }, [navigate]);

  // track whether the user has uploaded files (to show insights loading state)
  const [hasFiles, setHasFiles] = useState(false);
  const handleFileSelect = async (fileId: number) => {
    setSelectedFileId(fileId);
    setInsightsLoading(true);
    setFileData(null); // Clear previous data

    try {
      const filesRes = await fetch("/files", { credentials: "include" });
      if (!filesRes.ok) {
        throw new Error("Failed to verify file existence");
      }

      const filesData = await filesRes.json();
      const fileExists = filesData.files?.some((f: any) => f.id === fileId);
      if (!fileExists) {
        throw new Error("File no longer exists in the database");
      }

      const data = await fetchInsights(fileId);
      if (data) {
        setFileData(data);
      } else {
        throw new Error("No data returned from server");
      }
    } catch (err: any) {
      console.error("Failed to fetch file data:", err);
      let errorMessage = "Failed to load file data. Please try again.";
      if (err.response?.status === 404) {
        errorMessage = "This file is no longer available.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setSelectedFileId(null);
      alert(errorMessage);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/files", { credentials: "include" });
        const data = await res.json();
        setHasFiles(Array.isArray(data.files) && data.files.length > 0);
      } catch (e) {
        setHasFiles(false);
      }
    };
    fetchFiles();
  }, [filesRefreshKey]);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      setUser(null);
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onUploadClick={() => setShowUploadOverlay(true)}
          refreshKey={filesRefreshKey}
          onFileSelect={handleFileSelect}
          selectedFileId={selectedFileId ?? undefined}
        />
      </div>
      <div className="flex-1 flex flex-col relative">
        <div
          className={
            insightsLoading ? "pointer-events-none filter blur-sm" : ""
          }
        >
          <ToggleSidebarButton onClick={() => setIsSidebarOpen(true)} />
          <Header onLogout={handleLogout} user={user} />
          <div className="mt-28 space-y-6 md:mt-16 md:ml-64">
            <div className="grid grid-cols-1 lg:grid-cols-2 flex-grow">
              <TablePreview
                data={fileData?.preview}
                loading={insightsLoading}
              />
              <div className="space-y-6 flex flex-col md:mt-3 p-4">
                {/* <SalesChart /> */}
                {hasFiles ? (
                  <InsightsPanel
                    caption={fileData?.caption}
                    insights={
                      fileData?.insights
                        ? {
                            total_sales:
                              fileData.insights.total ??
                              fileData.insights.total_sales ??
                              0,
                            total_orders:
                              fileData.insights.weekly_estimate ??
                              fileData.insights.total_orders ??
                              0,
                            top_product:
                              fileData.insights.top_3?.[0]?.product_name ||
                              fileData.insights.top_product ||
                              "N/A",
                            sales_growth:
                              fileData.insights.growth_rate ??
                              fileData.insights.sales_growth ??
                              0,
                            text: fileData.insights.text ?? "",
                            alerts: fileData.insights.alerts ?? [],
                            ai_recommendations:
                              fileData.insights.ai_recommendations ?? [],
                          }
                        : undefined
                    }
                    charts={fileData?.charts}
                    loading={insightsLoading}
                  />
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        </div>
        {showUploadOverlay && (
          <FileUploadOverlay
            onFileUploaded={handleFileUploaded}
            onClose={() => setShowUploadOverlay(false)}
          />
        )}
        {insightsLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-30" />
            <div className="relative z-10 bg-white dark:bg-gray-800 p-8 rounded shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Processing file</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Loading insights... This may take a minute.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
