
import { checkSupabaseConfig, checkUserAuthentication } from './auth';
import { supabase } from './auth';

// Ensure the compressed-files bucket exists or create it
export async function ensureCompressedFilesBucketExists(): Promise<boolean> {
  checkSupabaseConfig();
  
  try {
    // First verify authentication
    const session = await checkUserAuthentication();
    console.log('User authenticated:', session.user.email);
    
    // Try to list buckets to check permissions
    const { data: bucketList, error: listError } = await supabase!.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      
      // Handle different error cases
      if (listError.message.includes('JWT') || listError.message.includes('token') || listError.message.includes('auth')) {
        throw new Error('Authentication required: Please log in to access storage');
      } else if (listError.message.includes('permission') || listError.message.includes('not authorized')) {
        throw new Error('Permission denied: Your account does not have access to storage. Please contact support.');
      }
      
      throw new Error(`Cannot access storage: ${listError.message}`);
    }
    
    // Check if bucket exists in the list
    const bucketExists = bucketList.some(bucket => bucket.name === 'compressed-files');
    
    if (bucketExists) {
      console.log('The compressed-files bucket already exists');
      return true;
    }
    
    // If bucket doesn't exist, try to use it without creating (for non-admin users)
    try {
      // Try to list files in the bucket to see if it exists but wasn't in our list
      const { data: filesList, error: filesError } = await supabase!.storage
        .from('compressed-files')
        .list();
        
      if (!filesError) {
        console.log('Successfully accessed the compressed-files bucket');
        return true;
      }
    } catch (accessError) {
      console.log('Access check failed, will try to create bucket', accessError);
    }
    
    // Last attempt: try to create the bucket
    console.log('Attempting to create bucket');
    const { data: newBucket, error: createError } = await supabase!.storage.createBucket('compressed-files', {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    });
    
    if (createError) {
      console.error('Failed to create bucket:', createError);
      
      if (createError.message.includes('row-level security') || createError.message.includes('permission')) {
        throw new Error('Permission denied: Your account does not have permission to create storage buckets. This is likely because you are not an administrator. Please contact support.');
      } else if (createError.message.includes('already exists')) {
        console.log('Bucket already exists but was not detected in the list');
        return true;
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
