import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  r2Key: string;
  url: string;
}

export interface UploadProgress {
  file: string;
  percent: number;
}

// ─── Get auth token ───────────────────────────────────────────────────────────

const getAuthToken = async (): Promise<string> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  return session.access_token;
};

// ─── Request presigned URL ────────────────────────────────────────────────────

const requestPresignedUrl = async (
  token: string,
  file: File,
  folder: string,
): Promise<{ uploadUrl: string; publicUrl: string; r2Key: string }> => {
  const response = await fetch("/api/r2-presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to get upload URL");
  }

  return response.json();
};

// ─── Upload single file to R2 ─────────────────────────────────────────────────

const uploadFileToR2 = async (
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
};

// ─── Upload multiple files ────────────────────────────────────────────────────

export const uploadFiles = async (
  files: File[],
  folder: string,
  onProgress?: (progress: UploadProgress[]) => void,
): Promise<UploadedFile[]> => {
  const token = await getAuthToken();
  const progress = files.map((f) => ({ file: f.name, percent: 0 }));
  const results: UploadedFile[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const { uploadUrl, publicUrl, r2Key } = await requestPresignedUrl(token, file, folder);

    await uploadFileToR2(uploadUrl, file, (percent) => {
      progress[i] = { file: file.name, percent };
      onProgress?.([...progress]);
    });

    progress[i] = { file: file.name, percent: 100 };
    onProgress?.([...progress]);

    results.push({
      name: file.name,
      size: file.size,
      type: file.type,
      r2Key,
      url: publicUrl,
    });
  }

  return results;
};
