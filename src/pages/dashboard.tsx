// ...existing code...
import Sidebar from "../components/dashboard-components/Sidebar";
import Header from "../components/dashboard-components/Header";
// import SalesChart from "../components/dashboard-components/SalesChart";
import DashboardLayout from "../components/dashboard-components/DashboardLayout";
import ToggleSidebarButton from "../components/dashboard-components/ToggleSidebarButton";


import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../utils/axios";
import FileUploadOverlay from "../components/dashboard-components/FileUploadOverlay";
import ProcessingModal from "../components/dashboard-components/ProcessingModal";
import UpgradeModal from "../components/dashboard-components/UpgradeModal";
import { useNavigate } from "react-router-dom";

import { FileInsights } from "../types/file.types";
import pythonApi from "../utils/pythonApi";
import InsightsPanel from "../components/dashboard-components/InsightsPanel";
import InsightsMarquee from "../components/dashboard-components/InsightsMarquee";
import { fetchInsights } from "../api/fettchInsights";
import { canUploadFile, canProcessRows, PricingTier, PRICING_TIERS } from "../utils/pricingTiers";
import DataTableModal from "../components/dashboard-components/DataTableModal";
import ChatAssistant from "../components/dashboard-components/ChatAssistant";
import OnboardingTutorial from "../components/dashboard-components/OnboardingTutorial";
import { ShareInsightsModal } from "../components/dashboard-components/ShareInsightsModal";
import { DatabaseLinkingModal } from "../components/dashboard-components/DatabaseLinkingModal";
import { ScheduledExportsPanel } from "../components/dashboard-components/ScheduledExportsPanel";
import { ToastContainer, useToast } from "../components/common/Toast";
import { toast as globalToast } from "../utils/toast";
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from "../hooks/useKeyboardShortcuts";
import { KeyboardShortcutsModal } from "../components/common/KeyboardShortcutsModal";
import { useAnalytics } from "../utils/analytics";
import { apiCache } from "../utils/apiCache";
import { AdvancedFilter, FilterOptions } from "../components/dashboard-components/AdvancedFilter";
import { DataVersioningPanel } from "../components/dashboard-components/DataVersioningPanel";
import { DataArchivingPanel } from "../components/dashboard-components/DataArchivingPanel";
import { DataQualityPanel } from "../components/dashboard-components/DataQualityPanel";
import { CustomIntegrationsBuilder } from "../components/dashboard-components/CustomIntegrationsBuilder";
import MaintenanceModal from "../components/common/MaintenanceModal";
import { useMaintenanceCheck } from "../hooks/useMaintenanceCheck";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalType, setUpgradeModalType] = useState<'files' | 'rows' | 'export'>('files');
  const [exportType, setExportType] = useState<'csv' | 'excel' | 'pdf' | 'sql' | undefined>(undefined);
  const [isPaymentFailureModal, setIsPaymentFailureModal] = useState(false); // Non-dismissible modal for payment failure
  const [user, setUser] = useState<any | null>(null);
  const [filesRefreshKey, setFilesRefreshKey] = useState(0);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [fileData, setFileData] = useState<FileInsights | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showScheduledExportsModal, setShowScheduledExportsModal] = useState(false);
  const [scheduledExportsFileId, setScheduledExportsFileId] = useState<number | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [showVersioningPanel, setShowVersioningPanel] = useState(false);
  const [showArchivingPanel, setShowArchivingPanel] = useState(false);
  const [showQualityPanel, setShowQualityPanel] = useState(false);
  const [showIntegrationsBuilder, setShowIntegrationsBuilder] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const toast = useToast();
  const analytics = useAnalytics();
  const { maintenanceStatus } = useMaintenanceCheck();

  // Check if screen is mobile (less than 768px - tablet breakpoint)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Trigger warmup for all files when user logs in
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';
    if (!justLoggedIn) return;

    const triggerWarmupForAllFiles = async () => {
      try {
        console.log('[Dashboard] User just logged in, triggering warmup for all files...');
        
        // Fetch all user files
        const res = await api.get('/files', {
          params: { _t: Date.now() },
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (res.data?.status === 'success' && res.data?.files) {
          const files = res.data.files || [];
          console.log(`[Dashboard] Found ${files.length} files, triggering warmup for each...`);

          // Trigger warmup for each file (fire-and-forget, don't wait)
          files.forEach((file: any) => {
            if (file.id && file.status !== 'archived') {
              pythonApi.post(`/data/${file.id}/warmup`)
                .then(() => console.log(`[Dashboard] Warmup triggered for fileId=${file.id}`))
                .catch((err) => console.error(`[Dashboard] Warmup failed for fileId=${file.id}:`, err));
            }
          });

          console.log(`[Dashboard] Warmup requests sent for ${files.length} files`);
        }

        // Clear the justLoggedIn flag after triggering warmup
        sessionStorage.removeItem('justLoggedIn');
      } catch (err) {
        console.error('[Dashboard] Failed to trigger warmup on login:', err);
        // Clear flag even on error to prevent retry loops
        sessionStorage.removeItem('justLoggedIn');
      }
    };

    // Trigger warmup after a short delay to ensure session is ready
    const timeoutId = setTimeout(() => {
      triggerWarmupForAllFiles();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);
  // Check tier limits before upload
  const checkTierLimits = useCallback(async (file: File): Promise<{ canUpload: boolean; limitType?: 'files' | 'rows' }> => {
    if (!user?.pricingTier) return { canUpload: false, limitType: 'files' };

    const tier = (user.pricingTier as PricingTier) || 'free';

    // Check file count limit
    const filesRes = await fetch("/api/v1/files", { credentials: "include" });
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
        
        // Use api client to ensure CSRF token is included
        const res = await api.post("/files/upload", form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = res.data;
        if (!data || data.status === "error") {
          throw new Error(data?.message || "Upload failed");
        }

        const fileId = data.file_id || data.fileId || data.file?.id;
        if (!fileId) {
          console.error('[Dashboard] Upload response:', data);
          throw new Error("File ID not returned from server");
        }

        console.log('[Dashboard] File uploaded successfully, fileId:', fileId);
        
        // Clear all API caches to ensure fresh data
        console.log('[Dashboard] Clearing API cache after file upload');
        apiCache.clear();
        
        // Also clear service worker cache for /files endpoint
        if ('caches' in window) {
          caches.keys().then((cacheNames) => {
            cacheNames.forEach((cacheName) => {
              caches.open(cacheName).then((cache) => {
                cache.keys().then((keys) => {
                  keys.forEach((request) => {
                    const url = new URL(request.url);
                    if (url.pathname.startsWith('/files')) {
                      cache.delete(request);
                      console.log('[Dashboard] Cleared service worker cache for:', url.pathname);
                    }
                  });
                });
              });
            });
          });
        }
        
        // Clear API cache for /files endpoint specifically
        console.log('[Dashboard] Clearing API cache for /files endpoint');
        const deletedCount = apiCache.deleteByPattern('/files');
        console.log(`[Dashboard] Cleared ${deletedCount} cache entries for /files endpoint`);
        
        setShowUploadOverlay(false);
        
        // Wait a bit for transaction to commit before refreshing sidebar
        // This ensures the file is visible in the database query
        setTimeout(() => {
          console.log('[Dashboard] Refreshing sidebar (refreshKey increment)');
          setFilesRefreshKey((k) => {
            const newKey = k + 1;
            console.log('[Dashboard] New refreshKey:', newKey);
            return newKey;
          });
        }, 1000); // Increased to 1000ms to ensure transaction is committed

        // Select the uploaded file immediately
        setSelectedFileId(fileId);
        setInsightsLoading(true);
        
        // File is already enqueued by the backend during upload
        // Python service needs time to process the file, so we'll poll for data
        console.log('[Dashboard] Starting data fetch with retry logic for fileId:', fileId);
        
        let pollCount = 0;
        const maxPolls = 40; // Reduced from 60 - should be faster now
        const initialDelay = 1000; // Start after 1 second (reduced from 2)
        const retryDelay = 2000; // Retry every 2 seconds (reduced from 3)
        
        const fetchDataWithRetry = async (): Promise<void> => {
          try {
            console.log(`[Dashboard] Attempting to fetch data for fileId: ${fileId} (attempt ${pollCount + 1})`);
            const dataRes = await pythonApi.get(`/data/${fileId}`, {
              timeout: 300000, // 300 seconds (5 minutes) timeout for large dataset processing
            });
            
            // Log the actual response structure for debugging
            console.log('[Dashboard] Data fetched successfully, response keys:', Object.keys(dataRes.data || {}));
            console.log('[Dashboard] Response has insights?', !!dataRes.data?.insights);
            console.log('[Dashboard] Response has caption?', !!dataRes.data?.caption);
            console.log('[Dashboard] Response has preview?', !!dataRes.data?.preview);
            console.log('[Dashboard] Response status:', dataRes.data?.status);
            
            // Check if we have any data at all
            if (dataRes.data) {
              const responseData = dataRes.data;
              
              // Check if processing is complete by looking at status
              const status = responseData.status;
              if (status === 'processing' || status === 'warming' || status === 'pending') {
                console.log(`[Dashboard] File status is "${status}", still processing...`);
                pollCount++;
                if (pollCount < maxPolls) {
                  setTimeout(fetchDataWithRetry, retryDelay);
                } else {
                  console.error('[Dashboard] Max polling attempts reached, giving up');
                  setInsightsLoading(false);
                  setFilesRefreshKey((k) => k + 1);
                }
                return;
              }
              
              // Check if we have insights, caption, or preview
              const hasInsights = responseData.insights && Object.keys(responseData.insights).length > 0;
              const hasCaption = responseData.caption;
              const hasPreview = responseData.preview && (Array.isArray(responseData.preview) ? responseData.preview.length > 0 : true);
              
              // If we have any useful data, accept it and stop polling
              if (hasInsights || hasCaption || hasPreview) {
                console.log('[Dashboard] Data is complete, setting fileData');
                setFileData(responseData);
                setInsightsLoading(false);
                // Refresh sidebar after data is loaded
                setFilesRefreshKey((k) => {
                  const newKey = k + 1;
                  console.log('[Dashboard] Data loaded, refreshing sidebar, new refreshKey:', newKey);
                  return newKey;
                });
                return; // Success, stop polling
              } else {
                // No useful data yet, but no error - might still be processing
                console.log('[Dashboard] Data received but no insights/caption/preview yet, will retry...');
                pollCount++;
                if (pollCount < maxPolls) {
                  setTimeout(fetchDataWithRetry, retryDelay);
                } else {
                  console.warn('[Dashboard] Max polls reached, accepting partial data');
                  // Accept whatever we have
                  setFileData(responseData);
                  setInsightsLoading(false);
                  setFilesRefreshKey((k) => k + 1);
                }
                return;
              }
            } else {
              // No data in response
              throw new Error('No data in response');
            }
          } catch (dataErr: any) {
            pollCount++;
            
            // Check if it's a timeout or server error (processing still ongoing)
            const isProcessing = 
              dataErr?.code === 'ECONNABORTED' || 
              dataErr?.response?.status === 500 ||
              dataErr?.response?.status === 503 ||
              (dataErr?.message && (
                dataErr.message.includes('timeout') || 
                dataErr.message.includes('Network Error')
              ));
            
            if (isProcessing && pollCount < maxPolls) {
              console.log(`[Dashboard] File still processing (attempt ${pollCount}), retrying in ${retryDelay/1000} seconds...`);
              setTimeout(fetchDataWithRetry, retryDelay);
            } else if (pollCount >= maxPolls) {
              console.error('[Dashboard] Max polling attempts reached, giving up');
              setInsightsLoading(false);
              // Still try to refresh sidebar to show the file
              setFilesRefreshKey((k) => k + 1);
            } else {
              // Other error (404, etc.) - file might not exist yet
              console.warn(`[Dashboard] Data fetch failed (attempt ${pollCount}):`, dataErr?.message || dataErr);
              if (pollCount < maxPolls) {
                setTimeout(fetchDataWithRetry, retryDelay);
              } else {
                setInsightsLoading(false);
                setFilesRefreshKey((k) => k + 1);
              }
            }
          }
        };
        
        // Start fetching immediately (reduced delay)
        setTimeout(() => {
          fetchDataWithRetry();
        }, initialDelay);
      } catch (err: any) {
        console.error("File upload failed", err);
        setShowUploadOverlay(false);
        setInsightsLoading(false);
        
        // Extract error message from response
        // NestJS BadRequestException format: { statusCode: 400, message: "...", error: "Bad Request" }
        let errorMessage = "File upload failed. Please try again.";
        
        if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.response?.data?.error && typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err?.response?.data?.error?.message) {
          errorMessage = err.response.data.error.message;
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        // Show error toast to user with the actual error message
        console.log('[Dashboard] Showing error toast:', errorMessage);
        globalToast.error(errorMessage);
      }
    };
    upload();
  }, [checkTierLimits]);

  // Fetch current user on mount and check for payment failure
  useEffect(() => {
    // CRITICAL: Check if admin is logged in - redirect to admin dashboard
    // This prevents admins from accessing the regular user dashboard
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    const superAdminLoggedIn = sessionStorage.getItem('superAdminLoggedIn') === 'true';
    if (adminLoggedIn || superAdminLoggedIn) {
      console.log('[Dashboard] Admin session detected, redirecting to /admin');
      navigate('/admin', { replace: true });
      return;
    }

    const fetchMe = async () => {
      // Always fetch fresh data directly from database
      try {
        const res = await api.get("/auth/me");
        if (res.data?.status === "success") {
          const userData = res.data.user;
          console.log('[Dashboard] Fresh user data fetched from DB:', { 
            id: userData.id, 
            email: userData.email, 
            pricingTier: userData.pricingTier, 
            subscriptionStatus: userData.subscriptionStatus,
            accountBalance: userData.accountBalance,
            subscriptionExpiresAt: userData.subscriptionExpiresAt
          });
          setUser(userData);
          
          // Update sessionStorage with fresh data
          sessionStorage.setItem('userData', JSON.stringify(userData));
          
          // Check if user has files that exceed their current tier limits (payment failure scenario)
          const checkPaymentFailure = async () => {
            try {
              const filesRes = await fetch("/api/v1/files", { credentials: "include" });
              if (!filesRes.ok) return;
              
              const filesData = await filesRes.json();
              const files = filesData.files || [];
              
              if (files.length === 0) return;
              
              const tier = (userData.pricingTier || 'free') as PricingTier;
              const tierLimits = PRICING_TIERS[tier];
              const maxRows = tierLimits.maxRowsPerFile;
              
              // Check each file's row count (with error handling and timeout)
              let hasExceedingFiles = false;
              let errorCount = 0;
              const MAX_ERRORS = 3; // Stop checking after 3 consecutive errors
              
              for (const file of files) {
                let timeoutId: NodeJS.Timeout | null = null;
                try {
                  // Skip archived files - they don't count towards limits
                  if (file.status === 'archived') {
                    continue;
                  }
                  
                  const controller = new AbortController();
                  timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                  
                  // Use a silent fetch wrapper that catches all errors
                  let rowCountRes: Response | null = null;
                  let rowData: any = null;
                  
                  try {
                    // Add cache-busting query parameter to force fresh request (fixes Chrome/Edge caching)
                    const cacheBuster = `_t=${Date.now()}`;
                    rowCountRes = await fetch(`http://localhost:8000/files/${file.id}/row-count?${cacheBuster}`, {
                      credentials: 'include',
                      signal: controller.signal,
                      cache: 'no-store',
                      headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                      },
                    });
                    
                    if (timeoutId) {
                      clearTimeout(timeoutId);
                      timeoutId = null;
                    }
                    
                    // Try to parse JSON, but handle any errors gracefully
                    if (rowCountRes) {
                      try {
                        rowData = await rowCountRes.json();
                      } catch (parseErr) {
                          // JSON parsing failed - treat as error
                        rowData = { error: 'Parse error', row_count: 0, file_id: file.id };
                      }
                    }
                  } catch (fetchError: any) {
                    // Any fetch error (network, timeout, etc.) - treat as non-critical
                    if (timeoutId) {
                      clearTimeout(timeoutId);
                      timeoutId = null;
                    }
                    rowData = { error: 'Network error', row_count: 0, file_id: file.id };
                  }
                  
                  // Process the result if we have data
                  if (rowData) {
                    // Reset error count on success
                    if (rowCountRes?.ok && !rowData.error) {
                      errorCount = 0;
                      
                      // Check if row count exceeds limit
                      if (maxRows !== Infinity && rowData.row_count > maxRows) {
                        hasExceedingFiles = true;
                        break;
                      }
                    } else if (rowData.error) {
                      // Had an error, but continue checking other files
                      errorCount++;
                      if (errorCount >= MAX_ERRORS) {
                        console.warn(`[Payment Check] Stopping row count checks after ${MAX_ERRORS} errors`);
                        break;
                      }
                    }
                  } else {
                    // No data received - increment error count
                    errorCount++;
                    if (errorCount >= MAX_ERRORS) {
                      console.warn(`[Payment Check] Stopping row count checks after ${MAX_ERRORS} errors`);
                      break;
                    }
                  }
                } catch (e: any) {
                  // Catch-all for any unexpected errors - treat as non-critical
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                  }
                  errorCount++;
                  if (errorCount >= MAX_ERRORS) {
                    console.warn(`[Payment Check] Stopping row count checks after ${MAX_ERRORS} errors`);
                    break;
                  }
                  // Silently continue to next file - don't log individual errors
                }
              }
              
              if (hasExceedingFiles) {
                setIsPaymentFailureModal(true);
                setUpgradeModalType('rows');
                setShowUpgradeModal(true);
              }
            } catch (err) {
              console.error("Error checking payment failure:", err);
            }
          };
          
          // Check for payment failure after a short delay to ensure files are loaded
          setTimeout(checkPaymentFailure, 1000);
          return;
        } else {
          // API call succeeded but no user data - check stored data as fallback
          const storedUserData = sessionStorage.getItem('userData');
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              console.log('[Dashboard] Using stored user data as fallback:', { id: userData.id, email: userData.email, pricingTier: userData.pricingTier });
              setUser(userData);
              return;
            } catch (err) {
              console.error('[Dashboard] Failed to parse stored user data:', err);
              sessionStorage.removeItem('userData');
            }
          }
          navigate("/login");
        }
      } catch (err) {
        console.warn("Auth check failed, trying stored data:", err);
        // API call failed - use stored data as fallback
        const storedUserData = sessionStorage.getItem('userData');
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log('[Dashboard] Using stored user data (API failed):', { id: userData.id, email: userData.email, pricingTier: userData.pricingTier });
            setUser(userData);
            
            // Try to verify in background
            setTimeout(async () => {
              try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const res = await api.get("/auth/me");
                if (res.data?.status === "success" && res.data?.user) {
                  console.log('[Dashboard] Background verification succeeded, updating user data');
                  setUser(res.data.user);
                  sessionStorage.setItem('userData', JSON.stringify(res.data.user));
                  sessionStorage.setItem('justLoggedIn', 'true');
                }
              } catch (err) {
                console.warn('[Dashboard] Background verification failed, but using stored data');
              }
            }, 2000);
            return;
          } catch (parseErr) {
            console.error('[Dashboard] Failed to parse stored user data:', parseErr);
            sessionStorage.removeItem('userData');
          }
        }
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
      // Fire-and-forget warmup to pre-cache (runs in background)
      // Don't wait for it - fetch data immediately
      try {
        console.log(`[Dashboard] Triggering warmup (background) for fileId=${fileId}`);
        pythonApi.post(`/data/${fileId}/warmup`)
          .then(() => console.log(`[Dashboard] Warmup request sent for fileId=${fileId}`))
          .catch((err) => console.error(`[Dashboard] Warmup failed for fileId=${fileId}:`, err));
      } catch (err) {
        console.error(`[Dashboard] Warmup error:`, err);
      }
      
      // Try to fetch data immediately first (use cache if available)
      console.log(`[Dashboard] Fetching data immediately for fileId=${fileId}`);
      let immediateData = null;
      try {
        immediateData = await fetchInsights(fileId, true); // Use cache if available
        if (immediateData && (immediateData.insights || immediateData.caption || immediateData.preview)) {
          console.log('[Dashboard] Data received immediately, rendering...');
          setFileData(immediateData);
          setInsightsLoading(false);
          return; // Success - rendered immediately
        }
        // If we got data but it's empty, fall through to polling
        console.log('[Dashboard] Data received but empty, starting polling...');
      } catch (immediateErr: any) {
        // If immediate fetch fails, start polling
        console.log('[Dashboard] Immediate fetch failed, starting polling:', immediateErr?.message);
      }
      
      // If immediate fetch didn't work, use polling mechanism
      let pollCount = 0;
      const maxPolls = 40;
      const initialDelay = 1000;
      const retryDelay = 2000;
      
      const fetchDataWithRetry = async (): Promise<void> => {
        try {
          console.log(`[Dashboard] Polling attempt ${pollCount + 1} for fileId: ${fileId}`);
          let dataRes;
          try {
            dataRes = await pythonApi.get(`/data/${fileId}`, {
              timeout: 300000,
            });
          } catch (fetchErr: any) {
            // Handle axios errors
            console.error('[Dashboard] Fetch error:', fetchErr);
            if (fetchErr.response) {
              // Server responded with error status
              const status = fetchErr.response.status;
              const errorData = fetchErr.response.data || {};
              console.error(`[Dashboard] Server error ${status}:`, errorData);
              
              // Check for 403 Forbidden (tier limit exceeded)
              if (status === 403) {
                setUpgradeModalType('rows');
                setShowUpgradeModal(true);
                setSelectedFileId(null);
                setInsightsLoading(false);
                return;
              }
              
              // For 500 errors, continue polling (might be processing)
              if (status === 500 || status === 503) {
                pollCount++;
                if (pollCount < maxPolls) {
                  console.log(`[Dashboard] Server error ${status}, retrying...`);
                  setTimeout(fetchDataWithRetry, retryDelay);
                } else {
                  setInsightsLoading(false);
                  globalToast.error(`Server error: ${errorData.error || errorData.message || 'Unknown error'}`);
                }
                return;
              }
              
              throw new Error(errorData.error || errorData.message || `Server error: ${status}`);
            }
            throw fetchErr;
          }
          
          console.log('[Dashboard] HTTP Status:', dataRes.status);
          console.log('[Dashboard] Response data:', dataRes.data);
          console.log('[Dashboard] Data fetched, response keys:', Object.keys(dataRes.data || {}));
          console.log('[Dashboard] Response has insights?', !!dataRes.data?.insights);
          console.log('[Dashboard] Response has caption?', !!dataRes.data?.caption);
          console.log('[Dashboard] Response has preview?', !!dataRes.data?.preview);
          console.log('[Dashboard] Response status:', dataRes.data?.status);
          
          // Check if response is actually empty (no keys) or has error
          const responseKeys = Object.keys(dataRes.data || {});
          if (responseKeys.length === 0) {
            console.warn('[Dashboard] Empty response object received, treating as no data');
            pollCount++;
            if (pollCount < maxPolls) {
              setTimeout(fetchDataWithRetry, retryDelay);
            } else {
              setInsightsLoading(false);
              globalToast.error('Server returned empty response. Please try again later.');
            }
            return;
          }
          
          // Check for error in response
          if (dataRes.data?.error) {
            console.error('[Dashboard] Error in response:', dataRes.data.error);
            // If it's an error response but has some structure, we might still want to show it
            // But if it's a critical error, throw
            if (dataRes.data.error_type && dataRes.data.error_type !== 'ValueError') {
              throw new Error(dataRes.data.error || 'Error processing file');
            }
          }
          
          if (dataRes.data) {
            const responseData = dataRes.data;
            
            // Check if processing is complete
            const status = responseData.status;
            if (status === 'processing' || status === 'warming' || status === 'pending') {
              console.log(`[Dashboard] File status is "${status}", still processing...`);
              pollCount++;
              if (pollCount < maxPolls) {
                setTimeout(fetchDataWithRetry, retryDelay);
              } else {
                console.error('[Dashboard] Max polling attempts reached, giving up');
                setInsightsLoading(false);
                globalToast.warning("File processing is taking longer than expected. Please try again later.");
              }
              return;
            }
            
            // Check if we have insights, caption, or preview
            const hasInsights = responseData.insights && Object.keys(responseData.insights).length > 0;
            const hasCaption = responseData.caption;
            const hasPreview = responseData.preview && (Array.isArray(responseData.preview) ? responseData.preview.length > 0 : true);
            
            // If we have any useful data, accept it and stop polling
            if (hasInsights || hasCaption || hasPreview) {
              console.log('[Dashboard] Data is complete, setting fileData');
              setFileData(responseData);
              setInsightsLoading(false);
              return; // Success, stop polling
            } else {
              // No useful data yet, but no error - might still be processing
              console.log('[Dashboard] Data received but no insights/caption/preview yet, will retry...');
              pollCount++;
              if (pollCount < maxPolls) {
                setTimeout(fetchDataWithRetry, retryDelay);
              } else {
                console.warn('[Dashboard] Max polls reached, accepting partial data');
                setFileData(responseData);
                setInsightsLoading(false);
              }
              return;
            }
          } else {
            // No data in response or empty object
            console.warn('[Dashboard] No data in response or empty object');
            throw new Error('No data in response');
          }
        } catch (dataErr: any) {
          pollCount++;
          
          // Check for 403 Forbidden (tier limit exceeded)
          if (dataErr?.response?.status === 403 || dataErr?.message?.includes("exceeds row limit") || dataErr?.message?.includes("exceeds the maximum rows")) {
            setUpgradeModalType('rows');
            setShowUpgradeModal(true);
            setSelectedFileId(null);
            setInsightsLoading(false);
            return;
          }
          
          // Check if it's a timeout or server error (processing still ongoing)
          const isProcessing = 
            dataErr?.code === 'ECONNABORTED' || 
            dataErr?.response?.status === 500 ||
            dataErr?.response?.status === 503 ||
            (dataErr?.message && (
              dataErr.message.includes('timeout') || 
              dataErr.message.includes('Network Error')
            ));
          
          if (isProcessing && pollCount < maxPolls) {
            console.log(`[Dashboard] File still processing (attempt ${pollCount}), retrying in ${retryDelay/1000} seconds...`);
            setTimeout(fetchDataWithRetry, retryDelay);
          } else if (pollCount >= maxPolls) {
            console.error('[Dashboard] Max polling attempts reached, giving up');
            setInsightsLoading(false);
            alert("File processing is taking longer than expected. Please try again later.");
          } else {
            // Other error (404, etc.) - file might not exist yet
            console.warn(`[Dashboard] Data fetch failed (attempt ${pollCount}):`, dataErr?.message || dataErr);
            if (pollCount < maxPolls) {
              setTimeout(fetchDataWithRetry, retryDelay);
            } else {
              setInsightsLoading(false);
              let errorMessage = "Failed to load file data. Please try again.";
              if (dataErr?.message?.includes("429") || dataErr?.message?.includes("Too many requests")) {
                errorMessage = "Too many requests. Please wait a moment and try again.";
              } else if (dataErr?.response?.status === 404) {
                errorMessage = "This file is no longer available.";
              } else if (dataErr?.message) {
                errorMessage = dataErr.message;
              }
              globalToast.error(errorMessage);
            }
          }
        }
      };
      
      // Start polling after initial delay
      setTimeout(() => {
        fetchDataWithRetry();
      }, initialDelay);
      
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
      globalToast.error(errorMessage);
    } finally {
      // Don't set loading to false here - let polling handle it
    }
  }, [setUpgradeModalType, setShowUpgradeModal]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/v1/files", { credentials: "include" });
        if (res.status === 403) {
          const data = await res.json();
          if (data.code === 'EMAIL_NOT_VERIFIED' || data.requiresVerification) {
            // Email not verified - redirect to verification
            sessionStorage.setItem('pendingVerificationRedirect', '/dashboard');
            window.location.href = '/verify-email';
            return;
          }
        }
        if (!res.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await res.json();
        setHasFiles(Array.isArray(data.files) && data.files.length > 0);
      } catch (e: any) {
        if (e.response?.status === 403 && (e.response?.data?.code === 'EMAIL_NOT_VERIFIED' || e.response?.data?.requiresVerification)) {
          sessionStorage.setItem('pendingVerificationRedirect', '/dashboard');
          window.location.href = '/verify-email';
          return;
        }
        setHasFiles(false);
      }
    };
    fetchFiles();
  }, [filesRefreshKey]);

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      window.location.replace('/login');
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
      // Enterprise-Level Insights
      executive_summary: fileData.insights.executive_summary,
      predictive_forecast_with_ci: fileData.insights.predictive_forecast_with_ci,
      scenario_planning: fileData.insights.scenario_planning,
      price_elasticity_analysis: fileData.insights.price_elasticity_analysis,
      cash_flow_forecast: fileData.insights.cash_flow_forecast,
      revenue_attribution: fileData.insights.revenue_attribution,
      market_opportunity_scoring: fileData.insights.market_opportunity_scoring,
      predictive_churn_analysis: fileData.insights.predictive_churn_analysis,
      inventory_optimization: fileData.insights.inventory_optimization,
      break_even_analysis: fileData.insights.break_even_analysis,
      customer_journey_mapping: fileData.insights.customer_journey_mapping,
      next_best_actions: fileData.insights.next_best_actions,
      advanced_anomaly_detection: fileData.insights.advanced_anomaly_detection,
      competitive_positioning: fileData.insights.competitive_positioning,
      profit_margin_optimization: fileData.insights.profit_margin_optimization,
    };
  }, [fileData?.insights]);

  // Memoize charts data
  const memoizedCharts = useMemo(() => fileData?.charts, [fileData?.charts]);

  // Mobile: Auto-close sidebar on mount, make it overlay
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
      setIsSidebarCollapsed(false);
    }
  }, [isMobile]);

  // Onboarding tutorial - show on first visit
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    if (!onboardingCompleted && user) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      ...COMMON_SHORTCUTS.UPLOAD,
      action: () => {
        setShowUploadOverlay(true);
        analytics.featureUsed('upload', 'keyboard-shortcut');
      },
    },
    {
      ...COMMON_SHORTCUTS.SEARCH,
      action: () => {
        // Focus search if available, or show search modal
        analytics.featureUsed('search', 'keyboard-shortcut');
      },
    },
    {
      ...COMMON_SHORTCUTS.NEW_CHAT,
      action: () => {
        if (user?.pricingTier === 'business' || user?.pricingTier === 'enterprise') {
          setIsChatOpen(true);
          analytics.featureUsed('chat', 'keyboard-shortcut');
        }
      },
    },
    {
      ...COMMON_SHORTCUTS.CLOSE_MODAL,
      action: () => {
        setShowUploadOverlay(false);
        setShowUpgradeModal(false);
        setIsChatOpen(false);
      },
    },
    {
      ...COMMON_SHORTCUTS.HELP,
      action: () => {
        setShowShortcutsModal(true);
      },
    },
  ]);

  // Track page view
  useEffect(() => {
    if (user) {
      analytics.pageView('/dashboard');
    }
  }, [user, analytics]);

  return (
    <>
      {maintenanceStatus.maintenanceMode && <MaintenanceModal message={maintenanceStatus.message} />}
      <div style={{ 
        filter: maintenanceStatus.maintenanceMode ? 'blur(10px)' : 'none',
        pointerEvents: maintenanceStatus.maintenanceMode ? 'none' : 'auto',
      }}>
    <DashboardLayout>
      <Sidebar
        filterOptions={filterOptions}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onUploadClick={() => setShowUploadOverlay(true)}
        refreshKey={filesRefreshKey}
        onFileSelect={handleFileSelect}
        selectedFileId={selectedFileId ?? undefined}
        user={user}
        onLinkDatabaseClick={() => setShowDatabaseModal(true)}
        onScheduleExports={(fileId) => {
          setScheduledExportsFileId(fileId);
          setShowScheduledExportsModal(true);
        }}
      />
      <div
        className={`flex-1 flex flex-col relative transition-all duration-300 ${
          isMobile ? "ml-0" : isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-blue-500 text-white shadow-lg"
            aria-label="Open sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
        {!isMobile && (
          <ToggleSidebarButton onClick={() => setIsSidebarOpen(true)} />
        )}
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
          onShareInsights={() => setShowShareModal(true)}
          selectedFileId={selectedFileId}
          selectedFileName={fileData?.caption || `File ${selectedFileId}`}
        />
        <div
          className={`mt-20 md:mt-16 space-y-2 ${
            isMobile ? "px-2" : "px-2 md:px-3"
          } py-2`}
          style={{ backgroundColor: "transparent" }}
        >
          {/* Advanced Filter and Action Buttons */}
          {hasFiles && (
            <div className="mb-2 flex flex-col sm:flex-row gap-3 pt-2 items-start sm:items-center">
              <div className="flex-1 w-full sm:w-auto">
                <AdvancedFilter
                  onFilterChange={(filters) => {
                    setFilterOptions(filters);
                    // Apply filters to file list (would need to be implemented in Sidebar)
                    console.log("Filters applied:", filters);
                  }}
                  initialFilters={filterOptions}
                  onModalStateChange={setIsFilterModalOpen}
                />
              </div>

              {/* Action Buttons for Data Management - Same line as filter */}
              {(user?.pricingTier === "business" ||
                user?.pricingTier === "enterprise") && (
                <div className="flex flex-wrap gap-2 ">
                  {selectedFileId && (
                    <>
                      <button
                        onClick={() =>
                          setShowVersioningPanel(!showVersioningPanel)
                        }
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-icons text-sm">
                            history
                          </span>
                          Version History
                        </span>
                      </button>
                      <button
                        onClick={() => setShowQualityPanel(!showQualityPanel)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-icons text-sm">
                            trending_up
                          </span>
                          Data Quality
                        </span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowArchivingPanel(!showArchivingPanel)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-icons text-sm">archive</span>
                      Archived Files
                    </span>
                  </button>
                  {user?.pricingTier === "enterprise" && (
                    <button
                      onClick={() =>
                        setShowIntegrationsBuilder(!showIntegrationsBuilder)
                      }
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-icons text-sm">settings</span>
                        Custom Integrations
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Data Management Panels */}
          {showVersioningPanel && selectedFileId && (
            <div className="mb-2">
              <DataVersioningPanel
                fileId={selectedFileId}
                onClose={() => setShowVersioningPanel(false)}
              />
            </div>
          )}
          {showArchivingPanel && (
            <div className="mb-2">
              <DataArchivingPanel
                onClose={() => setShowArchivingPanel(false)}
                onFileRestored={() => {
                  // Refresh sidebar when file is restored
                  setFilesRefreshKey((k) => k + 1);
                }}
              />
            </div>
          )}
          {showQualityPanel && (
            <div className="mb-2">
              <DataQualityPanel
                fileId={selectedFileId ?? undefined}
                onClose={() => setShowQualityPanel(false)}
              />
            </div>
          )}
          {showIntegrationsBuilder && (
            <div className="mb-2">
              <CustomIntegrationsBuilder
                onClose={() => setShowIntegrationsBuilder(false)}
                onModalStateChange={setIsIntegrationsModalOpen}
              />
            </div>
          )}

          <div className="w-full mt-2">
            {hasFiles ? (
              <div
                data-tutorial="insights-panel"
                style={{
                  // Only blur for integrations modal, not for filter (users need to see sidebar results)
                  filter: isIntegrationsModalOpen ? "blur(8px)" : "none",
                  transition: "filter 0.3s ease",
                  pointerEvents: isIntegrationsModalOpen ? "none" : "auto",
                }}
              >
                <InsightsPanel
                  userTier={(user?.pricingTier as PricingTier) || "free"}
                  caption={fileData?.caption}
                  fileId={selectedFileId ?? undefined}
                  insights={memoizedInsights}
                  charts={memoizedCharts}
                  loading={insightsLoading}
                />
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
        {/* Fixed Marquee at Bottom of Viewport - outside insights panel */}
        {hasFiles && (
          <div
            className="fixed bottom-0 z-50 px-2 md:px-3"
            style={{
              left: isMobile ? "0" : isSidebarCollapsed ? "80px" : "256px",
              right: "0",
              transition: "left 0.3s ease",
            }}
          >
            <InsightsMarquee
              alerts={memoizedInsights?.alerts}
              aiRecommendations={memoizedInsights?.ai_recommendations}
              text={memoizedInsights?.text}
            />
          </div>
        )}

        {/* Chat Assistant Floating + Overlay */}
        <ChatAssistant
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onOpen={() => setIsChatOpen(true)}
          userId={user?.id}
          userTier={(user?.pricingTier as PricingTier) || "free"}
          fileId={selectedFileId ?? undefined}
          fileName={
            selectedFileId && fileData?.caption ? fileData.caption : undefined
          }
          fileInsights={memoizedInsights as any}
          hasOpenFile={!!selectedFileId && !!memoizedInsights}
        />
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
      {showShareModal && selectedFileId && (
        <ShareInsightsModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          fileId={selectedFileId}
          fileName={fileData?.caption || `File ${selectedFileId}`}
        />
      )}
      {showDatabaseModal && user?.pricingTier === "enterprise" && (
        <DatabaseLinkingModal
          isOpen={showDatabaseModal}
          onClose={() => setShowDatabaseModal(false)}
        />
      )}
      {showScheduledExportsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowScheduledExportsModal(false);
                setScheduledExportsFileId(null);
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <span className="text-xl">×</span>
            </button>
            <ScheduledExportsPanel
              fileId={scheduledExportsFileId ?? undefined}
            />
          </div>
        </div>
      )}
      <ProcessingModal isOpen={insightsLoading} />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          if (!isPaymentFailureModal) {
            setShowUpgradeModal(false);
            setExportType(undefined);
          }
        }}
        limitType={upgradeModalType}
        currentTier={user?.pricingTier || "free"}
        exportType={exportType}
        nonDismissible={isPaymentFailureModal}
      />

      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <OnboardingTutorial
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <KeyboardShortcutsModal
          isOpen={showShortcutsModal}
          onClose={() => setShowShortcutsModal(false)}
        />
      )}
    </DashboardLayout>
      </div>
    </>
  );
};

export default Dashboard;
