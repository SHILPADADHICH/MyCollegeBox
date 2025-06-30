import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

// Debug environment variables
console.log("Supabase environment check:", {
  hasUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.EXPO_PUBLIC_SUPABASE_KEY,
  urlLength: process.env.EXPO_PUBLIC_SUPABASE_URL?.length || 0,
  keyLength: process.env.EXPO_PUBLIC_SUPABASE_KEY?.length || 0,
});

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  }
);

console.log("Supabase client created successfully");
