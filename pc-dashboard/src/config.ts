export const config = {
  vllmBaseUrl: import.meta.env.VITE_VLLM_URL || 'http://localhost:8000',
  proxyPort: import.meta.env.VITE_PROXY_PORT || '9001',
  dashboardPort: import.meta.env.VITE_DASHBOARD_PORT || '9000',
  supabaseUrl: 'https://dyzrtlwdpvodagwsksfc.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5enJ0bHdkcHZvZGFnd3Nrc2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTQ0NTIsImV4cCI6MjA5MTE3MDQ1Mn0.tr_xDZRvI09mRmbdXoa8x4-MD7JeYDh_ClHaCG4FOwE',
};

export const defaultModels = ['google/gemma-4-12b', 'google/gemma-4-27b'];
