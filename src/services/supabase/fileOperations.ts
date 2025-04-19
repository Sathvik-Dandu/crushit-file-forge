
import { checkSupabaseConfig, checkUserAuthentication } from './auth';
import { ensureCompressedFilesBucketExists } from './bucketManagement';
import { supabase } from './auth';
import { CompressionHistoryItem } from '@/components/UserHistory';

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
    if (error.message.includes('Bucket not found')) {
      throw new Error('Storage bucket not found. Please log into the Supabase dashboard and create a "compressed-files" bucket manually.');
    }
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

// Function to save compression history item
export async function saveCompressionHistory(
  historyItem: Omit<CompressionHistoryItem, 'id'>
): Promise<CompressionHistoryItem | null> {
  checkSupabaseConfig();
  
  try {
    console.log('Saving compression history item:', historyItem);
    
    // Transform our frontend object to match database column names
    const dbItem = {
      userid: historyItem.userId,
      filename: historyItem.fileName,
      originalsize: historyItem.originalSize,
      compressedsize: historyItem.compressedSize,
      date: historyItem.date,
      filetype: historyItem.fileType,
      cloudfilepath: historyItem.cloudFilePath
    };
    
    const { data, error } = await supabase!
      .from('compression_history')
      .insert(dbItem)
      .select()
      .single();
    
    if (error) {
      console.error('Failed to save compression history:', error);
      return null;
    }
    
    // Convert database format to CompressionHistoryItem format
    const result: CompressionHistoryItem = {
      id: data.id,
      userId: data.userid,
      fileName: data.filename,
      originalSize: data.originalsize,
      compressedSize: data.compressedsize,
      date: data.date,
      fileType: data.filetype,
      cloudFilePath: data.cloudfilepath
    };
    
    console.log('Compression history saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving compression history:', error);
    return null;
  }
}

// Function to get compression history for a user
export async function getCompressionHistory(
  userId: string
): Promise<CompressionHistoryItem[]> {
  checkSupabaseConfig();
  
  try {
    console.log('Getting compression history for user:', userId);
    
    const { data, error } = await supabase!
      .from('compression_history')
      .select('*')
      .eq('userid', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Failed to get compression history:', error);
      return [];
    }
    
    // Convert database format to CompressionHistoryItem format
    const result = data.map(item => ({
      id: item.id,
      userId: item.userid,
      fileName: item.filename,
      originalSize: item.originalsize,
      compressedSize: item.compressedsize,
      date: item.date,
      fileType: item.filetype,
      cloudFilePath: item.cloudfilepath
    }));
    
    console.log('Retrieved compression history:', result);
    return result;
  } catch (error) {
    console.error('Error getting compression history:', error);
    return [];
  }
}

// Function to delete compression history item
export async function deleteCompressionHistoryItem(
  id: string
): Promise<boolean> {
  checkSupabaseConfig();
  
  try {
    console.log('Deleting compression history item:', id);
    
    const { error } = await supabase!
      .from('compression_history')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Failed to delete compression history:', error);
      return false;
    }
    
    console.log('Compression history item deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting compression history:', error);
    return false;
  }
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
