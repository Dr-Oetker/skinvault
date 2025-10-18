/**
 * Direct Supabase REST API wrapper
 * Bypasses the Supabase JS client to avoid state/lock issues
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Get auth token from localStorage
function getAuthToken(): string | null {
  try {
    const authData = localStorage.getItem('skinvault-auth-token');
    if (!authData) return null;
    
    const parsed = JSON.parse(authData);
    return parsed?.access_token || null;
  } catch (e) {
    console.error('Error getting auth token:', e);
    return null;
  }
}

// Create headers for API requests
function createHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// Generic fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// SELECT query
export async function selectFrom<T = any>(
  table: string,
  options: {
    select?: string;
    eq?: Record<string, any>;
    in?: Record<string, any[]>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  } = {}
): Promise<{ data: T | null; error: any }> {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    const params = new URLSearchParams();

    // Select columns
    params.append('select', options.select || '*');

    // Filters - eq
    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        params.append(key, `eq.${value}`);
      });
    }

    // Filters - in
    if (options.in) {
      Object.entries(options.in).forEach(([key, values]) => {
        params.append(key, `in.(${values.join(',')})`);
      });
    }

    // Order
    if (options.order) {
      const direction = options.order.ascending === false ? '.desc' : '.asc';
      params.append('order', `${options.order.column}${direction}`);
    }

    // Limit
    if (options.limit) {
      params.append('limit', String(options.limit));
    }

    url += '?' + params.toString();

    const headers: any = createHeaders();
    
    // Single row
    if (options.single) {
      headers['Accept'] = 'application/vnd.pgrst.object+json';
    }

    console.log('📡 SELECT:', table, options);
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ SELECT error:', error);
      return { data: null, error };
    }

    const data = await response.json();
    console.log('✅ SELECT success:', Array.isArray(data) ? `${data.length} items` : 'single item');
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ SELECT failed:', error);
    return { data: null, error: { message: error.message } };
  }
}

// INSERT
export async function insertInto<T = any>(
  table: string,
  data: any,
  options: { select?: boolean } = {}
): Promise<{ data: T | null; error: any }> {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    const headers: any = createHeaders();
    if (options.select) {
      headers['Prefer'] = 'return=representation';
    }

    console.log('📡 INSERT:', table, data);
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ INSERT error:', error);
      return { data: null, error };
    }

    const result = options.select ? await response.json() : null;
    console.log('✅ INSERT success');
    return { data: result, error: null };
  } catch (error: any) {
    console.error('❌ INSERT failed:', error);
    return { data: null, error: { message: error.message } };
  }
}

// UPDATE
export async function updateTable<T = any>(
  table: string,
  data: any,
  filters: { eq?: Record<string, any> }
): Promise<{ data: T | null; error: any }> {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    const params = new URLSearchParams();

    // Filters
    if (filters.eq) {
      Object.entries(filters.eq).forEach(([key, value]) => {
        params.append(key, `eq.${value}`);
      });
    }

    url += '?' + params.toString();

    console.log('📡 UPDATE:', table, data, filters);
    const response = await fetchWithTimeout(url, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ UPDATE error:', error);
      return { data: null, error };
    }

    console.log('✅ UPDATE success');
    return { data: null, error: null };
  } catch (error: any) {
    console.error('❌ UPDATE failed:', error);
    return { data: null, error: { message: error.message } };
  }
}

// DELETE
export async function deleteFrom(
  table: string,
  filters: { eq?: Record<string, any> }
): Promise<{ error: any }> {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    const params = new URLSearchParams();

    // Filters
    if (filters.eq) {
      Object.entries(filters.eq).forEach(([key, value]) => {
        params.append(key, `eq.${value}`);
      });
    }

    url += '?' + params.toString();

    console.log('📡 DELETE:', table, filters);
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ DELETE error:', error);
      return { error };
    }

    console.log('✅ DELETE success');
    return { error: null };
  } catch (error: any) {
    console.error('❌ DELETE failed:', error);
    return { error: { message: error.message } };
  }
}

