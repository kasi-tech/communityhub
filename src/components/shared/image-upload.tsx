"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { Badge } from "@/components/ui/badge";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  isCover: boolean;
}

interface ImageUploadProps {
  onUpload?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
}

export function ImageUpload({
  onUpload,
  maxFiles = 10,
  maxSizeMB = 5,
  accept = "image/*",
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const maxBytes = maxSizeMB * 1024 * 1024;
      const valid = files.filter(
        (f) => f.size <= maxBytes && f.type.startsWith("image/")
      );

      const remaining = maxFiles - images.length;
      const toAdd = valid.slice(0, remaining);

      const newImages: ImageFile[] = toAdd.map((file, i) => ({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: URL.createObjectURL(file),
        isCover: images.length === 0 && i === 0,
      }));

      setImages((prev) => [...prev, ...newImages]);
      onUpload?.(toAdd);
    },
    [images.length, maxFiles, maxSizeMB, onUpload]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      // If the removed image was cover, set first image as cover
      if (updated.length > 0 && !updated.some((img) => img.isCover)) {
        updated[0]!.isCover = true;
      }
      return updated;
    });
  };

  const handleSetCover = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isCover: img.id === id }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
          dragOver
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        aria-label="Upload images by dragging and dropping or clicking"
      >
        <svg
          className="mb-2 h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm font-medium text-gray-600">
          Drag & drop images here or click to browse
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Max {maxFiles} files, up to {maxSizeMB}MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
          aria-hidden="true"
        />
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
            >
              <img
                src={img.preview}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />
              {/* Cover badge */}
              {img.isCover && (
                <div className="absolute left-1 top-1">
                  <Badge variant="info">COVER</Badge>
                </div>
              )}
              {/* Overlay actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.isCover && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetCover(img.id);
                    }}
                    className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white"
                    aria-label={`Set ${img.file.name} as cover image`}
                  >
                    Set Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(img.id);
                  }}
                  className="rounded bg-red-500/90 px-2 py-1 text-xs font-medium text-white hover:bg-red-500"
                  aria-label={`Remove ${img.file.name}`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
