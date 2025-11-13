// ...existing code...
import Sidebar from "../components/dashboard-components/Sidebar";
import Header from "../components/dashboard-components/Header";
// import SalesChart from "../components/dashboard-components/SalesChart";
import DashboardLayout from "../components/dashboard-components/DashboardLayout";
import ToggleSidebarButton from "../components/dashboard-components/ToggleSidebarButton";


import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import FileUploadOverlay from "../components/dashboard-components/FileUploadOverlay";
import ProcessingModal from "../components/dashboard-components/ProcessingModal";
import UpgradeModal from "../components/dashboard-components/UpgradeModal";
import { useNavigate } from "react-router-dom";

import { FileInsights } from "../types/file.types";
import pythonApi from "../utils/pythonApi";
import InsightsPanel from "../components/dashboard-components/InsightsPanel";
import { fetchInsights } from "../api/fettchInsights";
import { canUploadFile, canProcessRows, PricingTier } from "../utils/pricingTiers";
import DataTableModal from "../components/dashboard-components/DataTableModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalType, setUpgradeModalType] = useState<'files' | 'rows' | 'export'>('files');
  const [exportType, setExportType] = useState<'csv' | 'excel' | 'pdf' | 'sql' | undefined>(undefined);
  const [user, setUser] = useState<any | null>(null);
  const [filesRefreshKey, setFilesRefreshKey] = useState(0);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [fileData, setFileData] = useState<FileInsights | null>(null);
  // Check tier limits before upload
  const checkTierLimits = useCallback(async (file: File): Promise<{ canUpload: boolean; limitType?: 'files' | 'rows' }> => {
    if (!user?.pricingTier) return { canUpload: false, limitType: 'files' };

    const tier = (user.pricingTier as PricingTier) || 'free';

    // Check file count limit
    const filesRes = await fetch("/files", { credentials: "include" });
    const filesData = await filesRes.json();
    const currentMonthFiles = filesData.files?.length || 0;

    if (!canUploadFile(tier, currentMonthFiles)) {
      return { canUpload: false, limitType: 'files' };
    }

    // Check row count limit (read file to count rows)
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const rowCount = lines.length - 1; // Subtract header

      if (!canProcessRows(tier, rowCount)) {
        return { canUpload: false, limitType: 'rows' };
      }
    } catch (e) {
      console.error("Error reading file for row count:", e);
    }

    return { canUpload: true };
  }, [user]);

  // Handle file upload with tier checking
  const handleFileUploaded = useCallback((file: File) => {
    const upload = async () => {
      try {
        // Check tier limits
        const limitCheck = await checkTierLimits(file);
        if (!limitCheck.canUpload) {
          setShowUploadOverlay(false);
          setUpgradeModalType(limitCheck.limitType || 'files');
          setShowUpgradeModal(true);
          return;
        }

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

        const fileId = data.file_id || data.fileId;
        if (!fileId) throw new Error("File ID not returned from server");

        setShowUploadOverlay(false);
        setFilesRefreshKey((k) => k + 1);

        setInsightsLoading(true);
        await fetch(`/files/${fileId}/enqueue`, {
          method: "POST",
          credentials: "include",
        });

        const poll = async () => {
          try {
            const sres = await fetch(`/files/${fileId}/status`, {
              credentials: "include",
            });
            const sdata = await sres.json();
            if (sdata?.status === "done") {
              setInsightsLoading(false);
              setFilesRefreshKey((k) => k + 1);

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
  }, [checkTierLimits]);

  // Fetch current user on mount
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
  const [showDataTableModal, setShowDataTableModal] = useState(false);
  const handleFileSelect = useCallback(async (fileId: number) => {
    setSelectedFileId(fileId);
    setInsightsLoading(true);
    setFileData(null); // Clear previous data

    try {
      const filesRes = await fetch("/files", { credentials: "include" });
      if (!filesRes.ok) {
        if (filesRes.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        }
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
      
      // Check for 403 Forbidden (tier limit exceeded)
      if (err.response?.status === 403 || err.message?.includes("exceeds row limit") || err.message?.includes("exceeds the maximum rows")) {
        setUpgradeModalType('rows');
        setShowUpgradeModal(true);
        setSelectedFileId(null);
        setInsightsLoading(false);
        return;
      }
      
      let errorMessage = "Failed to load file data. Please try again.";
      if (err.message?.includes("429") || err.message?.includes("Too many requests")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (err.response?.status === 404) {
        errorMessage = "This file is no longer available.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setSelectedFileId(null);
      alert(errorMessage);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

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

  const handleLogout = useCallback(async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      setUser(null);
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, []);

  // Memoize insights data transformation
  const memoizedInsights = useMemo(() => {
    if (!fileData?.insights) return undefined;
    return {
      total_sales:
        fileData.insights.total ??
        fileData.insights.total_sales ??
        0,
      total_orders:
        fileData.insights.weekly_estimate ??
        fileData.insights.total_orders ??
        0,
      total_profit:
        fileData.insights.total_profit ?? 0,
      top_product:
        fileData.insights.top_3?.[0]?.product_name ||
        fileData.insights.top_product ||
        "N/A",
      least_sold_product: fileData.insights.least_sold_product || "N/A",
      avg_order_value: fileData.insights.avg_order_value ?? 0,
      profit_margin_pct: fileData.insights.profit_margin_pct ?? 0,
      avg_profit_per_order: fileData.insights.avg_profit_per_order ?? 0,
      revenue_per_customer: fileData.insights.revenue_per_customer ?? 0,
      most_profitable_product: fileData.insights.most_profitable_product || "N/A",
      least_profitable_product: fileData.insights.least_profitable_product || "N/A",
      product_margin_analysis: fileData.insights.product_margin_analysis ?? [],
      top_customer: fileData.insights.top_customer || "N/A",
      top_customer_revenue: fileData.insights.top_customer_revenue ?? 0,
      repeat_customer_rate: fileData.insights.repeat_customer_rate ?? 0,
      unique_customers: fileData.insights.unique_customers ?? 0,
      top_region: fileData.insights.top_region || "N/A",
      regional_performance: fileData.insights.regional_performance ?? [],
      peak_sales_day: fileData.insights.peak_sales_day || "N/A",
      day_of_week_performance: fileData.insights.day_of_week_performance ?? [],
      revenue_concentration_pct: fileData.insights.revenue_concentration_pct ?? 0,
      products_to_discontinue: fileData.insights.products_to_discontinue ?? [],
      unique_products_count: fileData.insights.unique_products_count ?? 0,
      avg_sales_per_product: fileData.insights.avg_sales_per_product ?? 0,
      sales_velocity: fileData.insights.sales_velocity ?? 0,
      sales_growth:
        fileData.insights.growth_rate ??
        fileData.insights.sales_growth ??
        0,
      sales_trend: fileData.insights.sales_trend ?? [],
      daily_profit_trend: fileData.insights.profit_trend ?? fileData.insights.daily_profit_trend ?? [],
      forecast_trend: fileData.insights.forecast_trend ?? [],
      forecast: fileData.insights.forecast ?? {},
      text: fileData.insights.text ?? "",
      alerts: fileData.insights.alerts ?? [],
      ai_recommendations: fileData.insights.ai_recommendations ?? [],
      ai_opportunities: fileData.insights.ai_opportunities ?? [],
      ai_risks: fileData.insights.ai_risks ?? [],
      ai_anomalies: fileData.insights.ai_anomalies ?? [],
      // Enterprise Insights
      avg_clv: fileData.insights.avg_clv ?? 0,
      basket_size: fileData.insights.basket_size ?? 0,
      inventory_turnover: fileData.insights.inventory_turnover ?? 0,
      days_of_inventory: fileData.insights.days_of_inventory ?? 0,
      avg_roi: fileData.insights.avg_roi ?? 0,
      rfm_segments: fileData.insights.rfm_segments ?? {},
      // New Insights
      monthly_trends: fileData.insights.monthly_trends ?? [],
      top_customers_list: fileData.insights.top_customers_list ?? [],
      payment_method_analysis: fileData.insights.payment_method_analysis ?? [],
      top_products_by_volume: fileData.insights.top_products_by_volume ?? [],
      product_performance_matrix: fileData.insights.product_performance_matrix ?? [],
      price_range_analysis: fileData.insights.price_range_analysis ?? [],
      price_distribution: fileData.insights.price_distribution ?? [],
      customer_acquisition_trends: fileData.insights.customer_acquisition_trends ?? [],
      product_lifecycle: fileData.insights.product_lifecycle ?? [],
      regional_profit_comparison: fileData.insights.regional_profit_comparison ?? [],
      quantity_vs_revenue: fileData.insights.quantity_vs_revenue ?? [],
      hourly_sales_patterns: fileData.insights.hourly_sales_patterns ?? [],
      market_basket: fileData.insights.market_basket ?? [],
      // New Advanced Insights
      discount_analysis: fileData.insights.discount_analysis,
      coupon_analysis: fileData.insights.coupon_analysis ?? [],
      returns_analysis: fileData.insights.returns_analysis,
      shipping_analysis: fileData.insights.shipping_analysis,
      tax_analysis: fileData.insights.tax_analysis,
      order_analysis: fileData.insights.order_analysis,
      sku_analysis: fileData.insights.sku_analysis ?? [],
      warehouse_analysis: fileData.insights.warehouse_analysis ?? [],
      financial_health: fileData.insights.financial_health,
      // Additional Advanced Insights
      customer_purchase_frequency: fileData.insights.customer_purchase_frequency,
      product_velocity: fileData.insights.product_velocity ?? [],
      cross_sell_opportunities: fileData.insights.cross_sell_opportunities ?? [],
      upsell_opportunities: fileData.insights.upsell_opportunities ?? [],
      customer_value_segments: fileData.insights.customer_value_segments,
      discount_roi_analysis: fileData.insights.discount_roi_analysis,
      churn_analysis: fileData.insights.churn_analysis,
      seasonal_patterns: fileData.insights.seasonal_patterns,
      clv_by_cohort: fileData.insights.clv_by_cohort ?? [],
      payment_impact_analysis: fileData.insights.payment_impact_analysis,
    };
  }, [fileData?.insights]);

  // Memoize charts data
  const memoizedCharts = useMemo(() => fileData?.charts, [fileData?.charts]);

  return (
    <DashboardLayout>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onUploadClick={() => setShowUploadOverlay(true)}
        refreshKey={filesRefreshKey}
        onFileSelect={handleFileSelect}
        selectedFileId={selectedFileId ?? undefined}
        user={user}
        onLinkDatabaseClick={() => {
          // TODO: Implement database linking functionality
          console.log("Link Database clicked");
        }}
      />
      <div className={`flex-1 flex flex-col relative transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <ToggleSidebarButton onClick={() => setIsSidebarOpen(true)} />
        <Header 
          onLogout={handleLogout} 
          user={user} 
          onViewDataTable={() => setShowDataTableModal(true)}
          hasData={!!fileData?.preview && fileData.preview.length > 0}
          onShowUpgradeModal={(limitType, exportType) => {
            setUpgradeModalType(limitType);
            setExportType(exportType);
            setShowUpgradeModal(true);
          }}
        />
        <div className="mt-20 md:mt-16 space-y-6 p-4 md:p-6" style={{ backgroundColor: 'transparent' }}>
          <div className="w-full">
            {hasFiles ? (
              <InsightsPanel
                userTier={(user?.pricingTier as PricingTier) || 'free'}
                  caption={fileData?.caption}
                  insights={memoizedInsights}
                  charts={memoizedCharts}
                  loading={insightsLoading}
                />
              ) : (
                <div />
              )}
          </div>
        </div>
      </div>

      {/* Data Table Modal */}
      {showDataTableModal && (
        <DataTableModal
          data={fileData?.preview}
          loading={insightsLoading}
          onClose={() => setShowDataTableModal(false)}
        />
      )}

      {/* Modals */}
      {showUploadOverlay && (
        <FileUploadOverlay
          onFileUploaded={handleFileUploaded}
          onClose={() => setShowUploadOverlay(false)}
        />
      )}
      <ProcessingModal isOpen={insightsLoading} />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setExportType(undefined);
        }}
        limitType={upgradeModalType}
        currentTier={user?.pricingTier || 'free'}
        exportType={exportType}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
