import { useRef, useState } from "react";
import { Icon } from "@iconify/react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (type: string): string => {
  if (type.startsWith("image/")) return "solar:gallery-bold";
  if (type.startsWith("video/")) return "solar:video-library-bold";
  if (type === "application/pdf") return "solar:file-text-bold";
  return "solar:file-bold";
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface FileUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  progress?: Record<string, number>; // filename → percent
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FileUploader({
  files,
  onChange,
  progress = {},
  disabled,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    onChange([...files, ...Array.from(list)]);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-[#e8e2dd] bg-white px-4 py-8 transition-colors hover:border-[#c9a96e]/60 hover:bg-[#faf8f5] ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <Icon icon="solar:upload-linear" className="h-8 w-8 text-[#c2bdb6]" />
        <p className="font-manrope text-sm text-[#9e9890]">
          Arrastra archivos aquí o <span className="text-[#c9a96e]">selecciona</span>
        </p>
        <p className="font-manrope text-xs text-[#c2bdb6]">Imágenes, videos, PDF, Word</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Queued files */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {files.map((file, i) => {
            const percent = progress[file.name];
            return (
              <div
                key={i}
                className="flex items-center gap-3 border border-[#e8e2dd] bg-white px-3 py-2"
              >
                <Icon icon={fileIcon(file.type)} className="h-5 w-5 shrink-0 text-[#c2bdb6]" />
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-manrope truncate text-xs text-[#1c1a16]">
                      {file.name}
                    </span>
                    <span className="font-manrope shrink-0 text-xs text-[#b5b0a8]">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                  {percent !== undefined && (
                    <div className="h-1 w-full overflow-hidden bg-[#f0ede8]">
                      <div
                        className="h-full bg-[#c9a96e] transition-all duration-200"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="shrink-0 text-[#c2bdb6] hover:text-[#a06658]"
                  >
                    <Icon icon="solar:close-circle-bold" className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
