
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with fallback values if env vars are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase URL is available
if (!supabaseUrl) {
  console.error('Supabase URL is not set. Please set VITE_SUPABASE_URL environment variable.');
}

// Create client only if URL is available
export const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Function to check if Supabase is properly configured
function checkSupabaseConfig() {
  if (!supabase) {
    throw new Error('Supabase configuration is missing. Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }
}

// Function to upload file to Supabase storage
export async function uploadCompressedFile(
  file: File, 
  userId: string
): Promise<{ path: string; publicUrl: string }> {
  checkSupabaseConfig();
  
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
  setTimeout(async () => {
    try {
      await deleteFileFromStorage(filePath);
      console.log(`File ${filePath} has been automatically deleted after ${expirationMinutes} minutes`);
    } catch (error) {
      console.error(`Failed to delete expired file ${filePath}:`, error);
    }
  }, expirationMinutes * 60 * 1000);
}
