
import { User } from "@supabase/supabase-js";
import { uploadCompressedFile, setupFileExpiration, saveCompressionHistory } from "@/services/supabase/fileOperations";
import { ensureCompressedFilesBucketExists } from "@/services/supabase/bucketManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface GenerateDownloadUrlParams {
  compressedFile: Blob;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  user: User;
}

export const generateDownloadUrl = async ({
  compressedFile,
  fileName,
  originalSize,
  compressedSize,
  user
}: GenerateDownloadUrlParams): Promise<string> => {
  console.log("Starting file upload process");
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Your session has expired. Please log in again.");
  }
  
  console.log("Checking if storage bucket exists");
  const bucketCreated = await ensureCompressedFilesBucketExists();
  if (!bucketCreated) {
    throw new Error("Could not access storage bucket");
  }
  
  const compressedFileAsFile = new File([compressedFile], fileName, {
    type: compressedFile.type || 'application/octet-stream'
  });
  
  console.log("Uploading file to Supabase");
  const { path, publicUrl } = await uploadCompressedFile(compressedFileAsFile, user.id);
  console.log("File uploaded successfully, path:", path);
  
  // Save to history - ensure the field names match our CompressionHistoryItem interface
  const historyItem = {
    userId: user.id,
    fileName,
    originalSize,
    compressedSize,
    date: new Date().toISOString(),
    fileType: compressedFile.type || 'application/octet-stream',
    cloudFilePath: path
  };
  
  await saveCompressionHistory(historyItem);
  
  if (!publicUrl) {
    throw new Error("Failed to get public URL for the file");
  }
  
  // Set expiration
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 5);
  await setupFileExpiration(path, 5);
  
  const downloadUrl = new URL(window.location.origin);
  downloadUrl.pathname = '/download-helper.html';
  downloadUrl.hash = `${encodeURIComponent(publicUrl)},${encodeURIComponent(fileName)},${encodeURIComponent(expirationTime.getTime().toString())}`;
  
  return downloadUrl.toString();
};
