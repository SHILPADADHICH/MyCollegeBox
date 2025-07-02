import { supabase } from "./supabase";
import { notesService } from "./notesService";
import { storageService } from "./storageService";

// Function to test authentication status
export const testAuthentication = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    console.log('Session data:', data);
    
    if (error) {
      console.error('Authentication error:', error);
      return { success: false, message: `Auth error: ${error.message}` };
    }
    
    if (!data.session) {
      return { success: false, message: 'No active session found. Please login first.' };
    }
    
    return { 
      success: true, 
      message: `Authenticated as ${data.session.user.email}`,
      user: data.session.user 
    };
  } catch (err) {
    console.error('Test authentication error:', err);
    return { success: false, message: `Error: ${err.message}` };
  }
};

// Function to test database connection
export const testDatabaseConnection = async () => {
  try {
    // Try to query a simple table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return { success: false, message: `Database error: ${error.message}` };
    }
    
    return { success: true, message: 'Database connection successful' };
  } catch (err) {
    console.error('Test database error:', err);
    return { success: false, message: `Error: ${err.message}` };
  }
};

// Function to test storage access
export const testStorageAccess = async () => {
  try {
    // Try to list buckets or files
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Storage access error:', error);
      return { success: false, message: `Storage error: ${error.message}` };
    }
    
    return { 
      success: true, 
      message: `Storage access successful. Found ${data.length} buckets.`,
      buckets: data 
    };
  } catch (err) {
    console.error('Test storage error:', err);
    return { success: false, message: `Error: ${err.message}` };
  }
};

// Function to test creating a dummy file
export const testCreateDummyFile = async () => {
  try {
    // Create a simple text file blob
    const content = "This is a test file for upload";
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], 'test.txt', { type: 'text/plain' });
    
    return { 
      success: true, 
      message: 'Test file created successfully',
      file
    };
  } catch (err) {
    console.error('Test file creation error:', err);
    return { success: false, message: `Error: ${err.message}` };
  }
};

// Main test function that runs all tests
export const runUploadTests = async () => {
  console.log('======= STARTING UPLOAD TESTS =======');
  
  // Test 1: Authentication
  console.log('\n1. Testing authentication...');
  const authTest = await testAuthentication();
  console.log('Authentication test result:', authTest);
  
  if (!authTest.success) {
    console.error('❌ Authentication test failed. Stopping tests.');
    return { success: false, results: { authentication: authTest } };
  }
  
  // Test 2: Database Connection
  console.log('\n2. Testing database connection...');
  const dbTest = await testDatabaseConnection();
  console.log('Database test result:', dbTest);
  
  if (!dbTest.success) {
    console.error('❌ Database test failed. Stopping tests.');
    return { 
      success: false, 
      results: { 
        authentication: authTest,
        database: dbTest 
      } 
    };
  }
  
  // Test 3: Storage Access
  console.log('\n3. Testing storage access...');
  const storageTest = await testStorageAccess();
  console.log('Storage test result:', storageTest);
  
  if (!storageTest.success) {
    console.error('❌ Storage test failed. Stopping tests.');
    return { 
      success: false, 
      results: { 
        authentication: authTest,
        database: dbTest,
        storage: storageTest 
      } 
    };
  }
  
  // Test 4: File Creation
  console.log('\n4. Testing file creation...');
  const fileTest = await testCreateDummyFile();
  console.log('File creation test result:', fileTest);
  
  if (!fileTest.success) {
    console.error('❌ File creation test failed. Stopping tests.');
    return { 
      success: false, 
      results: { 
        authentication: authTest,
        database: dbTest,
        storage: storageTest,
        fileCreation: fileTest 
      } 
    };
  }
  
  return {
    success: true,
    results: {
      authentication: authTest,
      database: dbTest,
      storage: storageTest,
      fileCreation: fileTest
    },
    user: authTest.user
  };
}; 