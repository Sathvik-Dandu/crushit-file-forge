
import { checkSupabaseConfig, checkUserAuthentication } from './auth';
import { ensureCompressedFilesBucketExists } from './bucketManagement';
import { supabase } from './auth';

// Function to upload file to Supabase storage
export async function uploadCompressedFile(
  file: File, 
  userId: string
): Promise<{ path: string; publicUrl: string }> {
  checkSupabaseConfig();
  
  // Verify authentication before continuing
  const session = await checkUserAuthentication();
  
  // Check if bucket is accessible before attempting upload
  console.log('Checking bucket access before upload');
  await ensureCompressedFilesBucketExists();
  
  const fileName = `compressed_${Date.now()}_${file.name}`;
  const filePath = `user_files/${userId}/${fileName}`;
  
  console.log(`Uploading file to path: ${filePath}`);
  
  const { data, error } = await supabase!.storage
    .from('compressed-files')
    .upload(filePath, file, {
      cacheControl: '300',
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
