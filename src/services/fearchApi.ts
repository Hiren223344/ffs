/**
 * Fearch API Service
 * 
 * Integrates with the Fearch backend API (search.frenix.sh)
 * for key management, usage tracking, and billing.
 */

const FEARCH_BASE_URL = 'https://search.frenix.sh/v1';

// Types
export interface FearchKey {
  id: string;
  key_prefix: string;
  name: string;
  user_id: string | null;
  status: string;
  created_at: string;
  last_used_at: string | null;
  total_requests: number;
}

export interface UserUsage {
  user_id: string;
  summary: {
    total_keys: string;
    active_keys: string;
    total_requests: string;
    last_used_at: string | null;
    member_since: string;
  };
  keys: FearchKey[];
}

export interface BillingInfo {
  user_id: string;
  tier: string;
  max_requests: number;
  billing_period_start: string | null;
  billing_period_end: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateKeyRequest {
  name: string;
  user_id?: string;
}

export interface CreateKeyResponse {
  success: boolean;
  key: string;
  prefix: string;
  name: string | null;
  user_id: string | null;
}

export interface UpdateBillingRequest {
  user_id: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  max_requests?: number;
  billing_period_start?: string;
  billing_period_end?: string;
}

// API Functions

/**
 * Create a new API key (admin only)
 */
export async function createApiKey(
  adminSecret: string,
  request: CreateKeyRequest
): Promise<CreateKeyResponse> {
  const response = await fetch(`${FEARCH_BASE_URL}/keys/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create API key');
  }

  return response.json();
}

/**
 * List all API keys (admin only)
 */
export async function listApiKeys(adminSecret: string): Promise<{ success: boolean; keys: FearchKey[] }> {
  const response = await fetch(`${FEARCH_BASE_URL}/keys`, {
    headers: {
      'x-admin-secret': adminSecret
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list API keys');
  }

  return response.json();
}

/**
 * Get user usage by user ID
 */
export async function getUserUsage(userId: string): Promise<{ success: boolean; data: UserUsage }> {
  const response = await fetch(`${FEARCH_BASE_URL}/user/usage?id=${encodeURIComponent(userId)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user usage');
  }

  return response.json();
}

/**
 * Get billing info for a user
 */
export async function getBilling(userId: string): Promise<{ success: boolean; data: BillingInfo }> {
  const response = await fetch(`${FEARCH_BASE_URL}/billing?id=${encodeURIComponent(userId)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch billing info');
  }

  return response.json();
}

/**
 * Update user billing tier (admin only)
 */
export async function updateBilling(
  adminSecret: string,
  request: UpdateBillingRequest
): Promise<{ success: boolean; data: BillingInfo }> {
  const response = await fetch(`${FEARCH_BASE_URL}/billing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update billing');
  }

  return response.json();
}

/**
 * Search using Fearch API
 */
export async function searchFearch(
  query: string,
  limit: number = 5,
  apiKey?: string
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${FEARCH_BASE_URL}/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, limit })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Search failed');
  }

  return response.json();
}

/**
 * Scrape a URL using Fearch API
 */
export async function scrapeFearch(
  url: string,
  apiKey?: string
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${FEARCH_BASE_URL}/scrape`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Scrape failed');
  }

  return response.json();
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: string): string {
  const names: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    enterprise: 'Enterprise'
  };
  return names[tier] || tier;
}

/**
 * Get tier max requests display
 */
export function getTierMaxRequestsDisplay(maxRequests: number): string {
  if (maxRequests === -1) return 'Unlimited';
  return maxRequests.toLocaleString();
}

/**
 * Check if user has exceeded their limit
 */
export function hasExceededLimit(usage: number, maxRequests: number): boolean {
  if (maxRequests === -1) return false; // Unlimited
  return usage >= maxRequests;
}
