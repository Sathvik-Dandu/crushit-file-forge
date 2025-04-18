
import { createClient } from '@supabase/supabase-js';
import { supabase as globalSupabase } from "@/integrations/supabase/client";

// Initialize Supabase client with fallback values if env vars are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Use the global supabase client if available, or create a new one
export const supabase = globalSupabase || (supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null);

// Function to check if Supabase is properly configured
function checkSupabaseConfig() {
  if (!supabase) {
    throw new Error('Supabase configuration is missing. Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables or ensure the global client is initialized.');
  }
}

// Ensure the compressed-files bucket exists
export async function ensureCompressedFilesBucketExists() {
  checkSupabaseConfig();
  
  try {
    // First try to list files in the bucket to check if it exists and we have access
    const { data: bucketList, error: listError } = await supabase!.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw new Error(`Cannot access storage: ${listError.message}`);
    }
    
    // Check if bucket exists in the list
    const bucketExists = bucketList.some(bucket => bucket.name === 'compressed-files');
    
    if (bucketExists) {
      console.log('The compressed-files bucket already exists');
      return true;
    }
    
    // If bucket doesn't exist, create it
    console.log('Bucket not found, attempting to create');
    const { data: newBucket, error: createError } = await supabase!.storage.createBucket('compressed-files', {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    });
    
    if (createError) {
      console.error('Failed to create bucket:', createError);
      
      // Provide more specific error messages
      if (createError.message.includes('row-level security')) {
        throw new Error('Permission denied: You need to be logged in to create storage buckets');
      }
      
      throw new Error(`Failed to create storage bucket: ${createError.message}`);
    }
    
    console.log('Bucket created successfully', newBucket);
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Storage access error: ${errorMessage}`);
  }
}

// Function to upload file to Supabase storage
export async function uploadCompressedFile(
  file: File, 
  userId: string
): Promise<{ path: string; publicUrl: string }> {
  checkSupabaseConfig();
  
  // Check if bucket is accessible before attempting upload
  console.log('Checking bucket access before upload');
  await ensureCompressedFilesBucketExists();
  
  const fileName = `compressed_${Date.now()}_${file.name}`;
  const filePath = `user_files/${userId}/${fileName}`;
  
  console.log(`Uploading file to path: ${filePath}`);
  
  const { data, error } = await supabase!.storage
    .from('compressed-files')
    .upload(filePath, file, {
      cacheControl: '300', // 5 minutes
      upsert: false
    });
  
  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  
  console.log('File uploaded successfully, path:', data?.path);
  
  const { data: urlData } = supabase!.storage
    .from('compressed-files')
    .getPublicUrl(filePath);
  
  if (!urlData || !urlData.publicUrl) {
    throw new Error('Failed to get public URL for the uploaded file');
  }
  
  console.log('Generated public URL:', urlData.publicUrl);
  
  return {
    path: filePath,
    publicUrl: urlData.publicUrl
  };
}

// Function to get download URL
export async function getFileDownloadUrl(
  filePath: string
): Promise<string> {
  checkSupabaseConfig();
  
  const { data } = supabase!.storage
    .from('compressed-files')
    .getPublicUrl(filePath);
  
  if (!data || !data.publicUrl) {
    throw new Error('Failed to get public URL for the file');
  }
  
  return data.publicUrl;
}

// Function to delete a file from storage
export async function deleteFileFromStorage(filePath: string): Promise<void> {
  checkSupabaseConfig();
  
  console.log(`Deleting file: ${filePath}`);
  
  const { error } = await supabase!.storage
    .from('compressed-files')
    .remove([filePath]);
  
  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
  
  console.log(`File ${filePath} deleted successfully`);
}

// Set up automatic file expiration after expiration
export async function setupFileExpiration(filePath: string, expirationMinutes: number = 5): Promise<void> {
  // This is a simple implementation - in a production app, you might want to use a more robust solution
  console.log(`Setting up expiration for ${filePath} in ${expirationMinutes} minutes`);
  setTimeout(async () => {
    try {
      await deleteFileFromStorage(filePath);
      console.log(`File ${filePath} has been automatically deleted after ${expirationMinutes} minutes`);
    } catch (error) {
      console.error(`Failed to delete expired file ${filePath}:`, error);
    }
  }, expirationMinutes * 60 * 1000);
}
