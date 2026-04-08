import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dyzrtlwdpvodagwsksfc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5enJ0bHdkcHZvZGFnd3Nrc2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTQ0NTIsImV4cCI6MjA5MTE3MDQ1Mn0.tr_xDZRvI09mRmbdXoa8x4-MD7JeYDh_ClHaCG4FOwE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
