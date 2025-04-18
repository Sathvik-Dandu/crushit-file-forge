
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

// Function to upload file to Supabase storage
export async function uploadCompressedFile(
  file: File, 
  userId: string
): Promise<{ path: string; publicUrl: string }> {
  checkSupabaseConfig();
  
  // Create bucket if it doesn't exist (this will fail silently if bucket already exists)
  try {
    await supabase!.storage.createBucket('compressed-files', {
      public: true,
      allowedMimeTypes: ['*/*'],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    });
  } catch (error) {
    console.log('Bucket already exists or could not be created:', error);
  }
  
  const fileName = `compressed_${Date.now()}_${file.name}`;
  const filePath = `user_files/${userId}/${fileName}`;
  
  const { data, error } = await supabase!.storage
    .from('compressed-files')
    .upload(filePath, file, {
      cacheControl: '300', // 5 minutes
      upsert: false
    });
  
  if (error) throw error;
  
  const { data: urlData } = supabase!.storage
    .from('compressed-files')
    .getPublicUrl(filePath);
  
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
  
  return data.publicUrl;
}

// Function to delete a file from storage
export async function deleteFileFromStorage(filePath: string): Promise<void> {
  checkSupabaseConfig();
  
  const { error } = await supabase!.storage
    .from('compressed-files')
    .remove([filePath]);
  
  if (error) throw error;
}

// Set up automatic file deletion after expiration
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
