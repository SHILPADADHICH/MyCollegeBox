// Configuration values for the app
// Provides proper fallback values for development

// Supabase credentials - using hardcoded fallbacks for development
// In production, these should be set as environment variables
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fgvvuvxnlurnainkmnjc.supabase.co';
export const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndnZ1dnhubHVybmFpbmttbmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA4NzExODQsImV4cCI6MjAwNjQ0NzE4NH0.qKbO5KENgFgKLUWRBRXQ9puE9s-CxrKqILkFQvrFnfI';

// Network configuration
export const NETWORK_TIMEOUT = 30000; // 30 seconds
export const MAX_UPLOAD_RETRIES = 3;

// Check if Supabase credentials are properly configured
const isMissingCredentials = 
  !SUPABASE_URL || 
  !SUPABASE_KEY;

// Log warning if credentials are not properly configured  
if (isMissingCredentials) {
  console.warn(
    '⚠️ Missing Supabase credentials. Make sure to set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in your environment variables.'
  );
} else {
  console.log('✅ Supabase credentials configured successfully');
} 