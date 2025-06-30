import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from './config'

// Create the Supabase client with the configured URLs
// If the credentials are missing, this will use the placeholders from config.ts
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  })

console.log('Supabase client initialized with URL:', SUPABASE_URL.substring(0, 20) + '...');
        