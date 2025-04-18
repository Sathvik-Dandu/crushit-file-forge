import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Mock compression function (in a real app, this would be handled by a backend service)
export async function mockCompressFile(
  file: File, 
  targetSize: number, 
  compressionLevel: number
): Promise<{ blob: Blob; size: number }> {
  return new Promise((resolve) => {
    // Calculate a realistic compressed size based on the original size and compression level
    let calculatedSize: number;
    
    // For demonstration purposes, we'll simulate different compression results
    // based on file type and compression level
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      // Images typically compress well, but have diminishing returns at high levels
      calculatedSize = Math.max(
        targetSize,
        Math.floor(file.size * (1 - (compressionLevel * 0.8 / 100)))
      );
    } else if (['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(fileExtension)) {
      // Documents have moderate compression
      calculatedSize = Math.max(
        targetSize,
        Math.floor(file.size * (1 - (compressionLevel * 0.6 / 100)))
      );
    } else {
      // Other files generally compress less effectively
      calculatedSize = Math.max(
        targetSize,
        Math.floor(file.size * (1 - (compressionLevel * 0.4 / 100)))
      );
    }
    
    // Ensure we don't compress to less than 1% of the original size
    // (as this would be unrealistic in most cases)
    calculatedSize = Math.max(calculatedSize, Math.floor(file.size * 0.01));
    
    // For demo purposes, we'll just use the original file as the "compressed" result
    // In a real app, we'd actually compress the file and return the result
    setTimeout(() => {
      resolve({
        blob: file,
        size: calculatedSize
      });
    }, 1500); // Simulate processing time
  });
}

// Generate a mock user history
export function generateMockHistory(count: number = 5): any[] {
  const fileTypes = [
    'image/jpeg', 
    'image/png', 
    'application/pdf', 
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const fileNames = [
    'vacation_photos.jpg',
    'project_presentation.pptx',
    'financial_report.pdf',
    'resume_updated.docx',
    'product_screenshot.png',
    'meeting_notes.pdf',
    'contract_draft.docx',
    'family_photo.jpg',
    'technical_specs.pdf',
    'proposal_final.docx'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const originalSize = Math.floor(Math.random() * 10000000) + 1000000; // 1-11MB
    const compressedSize = Math.floor(originalSize * (Math.random() * 0.5 + 0.3)); // 30-80% of original
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];
    
    return {
      id: `hist-${i}-${Date.now()}`,
      fileName,
      originalSize,
      compressedSize,
      date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      fileType
    };
  });
}
