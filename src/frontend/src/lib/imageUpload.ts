import { ExternalBlob } from '../backend';

export async function convertImageToBlob(
  file: File | Blob,
  onProgress?: (percentage: number) => void
): Promise<ExternalBlob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    };

    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        let blob = ExternalBlob.fromBytes(uint8Array);
        
        if (onProgress) {
          blob = blob.withUploadProgress(onProgress);
        }
        
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}
