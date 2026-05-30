import { useState, useCallback } from 'react';
import {
  createApiKey,
  listApiKeys,
  getUserUsage,
  getBilling,
  updateBilling,
  searchFearch,
  scrapeFearch,
  type FearchKey,
  type UserUsage,
  type BillingInfo,
  type CreateKeyRequest,
  type UpdateBillingRequest,
  getTierDisplayName,
  getTierMaxRequestsDisplay,
  hasExceededLimit
} from '../services/fearchApi';

interface UseFearchOptions {
  adminSecret?: string;
  userId?: string;
}

export function useFearch(options: UseFearchOptions = {}) {
  const { adminSecret, userId } = options;

  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [apiKeys, setApiKeys] = useState<FearchKey[]>([]);
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [scrapeResult, setScrapeResult] = useState<any>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Create a new API key
   */
  const createKey = useCallback(async (name: string, targetUserId?: string) => {
    if (!adminSecret) {
      setError('Admin secret required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createApiKey(adminSecret, {
        name,
        user_id: targetUserId || userId
      });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create key');
      return null;
    } finally {
      setLoading(false);
    }
  }, [adminSecret, userId]);

  /**
   * Fetch all API keys
   */
  const fetchKeys = useCallback(async () => {
    if (!adminSecret) {
      setError('Admin secret required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await listApiKeys(adminSecret);
      setApiKeys(result.keys);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch keys');
    } finally {
      setLoading(false);
    }
  }, [adminSecret]);

  /**
   * Fetch user usage
   */
  const fetchUsage = useCallback(async (targetUserId?: string) => {
    const id = targetUserId || userId;
    if (!id) {
      setError('User ID required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getUserUsage(id);
      setUserUsage(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch usage');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Fetch billing info
   */
  const fetchBilling = useCallback(async (targetUserId?: string) => {
    const id = targetUserId || userId;
    if (!id) {
      setError('User ID required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getBilling(id);
      setBilling(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch billing');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Update user billing tier
   */
  const updateUserBilling = useCallback(async (request: UpdateBillingRequest) => {
    if (!adminSecret) {
      setError('Admin secret required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateBilling(adminSecret, request);
      setBilling(result.data);
      return result.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update billing');
      return null;
    } finally {
      setLoading(false);
    }
  }, [adminSecret]);

  /**
   * Perform a search
   */
  const search = useCallback(async (query: string, limit: number = 5, apiKey?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await searchFearch(query, limit, apiKey);
      setSearchResult(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Search failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Scrape a URL
   */
  const scrape = useCallback(async (url: string, apiKey?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await scrapeFearch(url, apiKey);
      setScrapeResult(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Scrape failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get usage percentage
   */
  const getUsagePercentage = useCallback(() => {
    if (!userUsage || !billing) return 0;
    if (billing.max_requests === -1) return 0; // Unlimited
    const total = parseInt(userUsage.summary.total_requests) || 0;
    const max = billing.max_requests;
    return Math.min((total / max) * 100, 100);
  }, [userUsage, billing]);

  /**
   * Check if user has exceeded limit
   */
  const isLimitExceeded = useCallback(() => {
    if (!userUsage || !billing) return false;
    const total = parseInt(userUsage.summary.total_requests) || 0;
    return hasExceededLimit(total, billing.max_requests);
  }, [userUsage, billing]);

  return {
    // State
    loading,
    error,
    apiKeys,
    userUsage,
    billing,
    searchResult,
    scrapeResult,

    // Actions
    clearError,
    createKey,
    fetchKeys,
    fetchUsage,
    fetchBilling,
    updateUserBilling,
    search,
    scrape,

    // Helpers
    getUsagePercentage,
    isLimitExceeded,
    getTierDisplayName,
    getTierMaxRequestsDisplay
  };
}
