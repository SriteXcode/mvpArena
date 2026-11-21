"use client";

import React, { useState, useRef, useEffect, DragEvent, ChangeEvent, ClipboardEvent } from "react";
import { 
  Upload, 
  X, 
  FileImage, 
  Loader2, 
  Sparkles, 
  Check, 
  Image as ImageIcon 
} from "lucide-react";

interface ImageDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  aspectRatio?: "square" | "video" | "auto";
  label?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
}

export default function ImageDropzone({
  value,
  onChange,
  aspectRatio = "auto",
  label = "Upload Image",
  hint = "Drag & drop an image here, click to browse, or paste from clipboard (Ctrl+V)",
  className = "",
  disabled = false,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WebP, GIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image file must be under 10MB.");
      return;
    }

    setErrorMessage(null);
    setUploading(true);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      }
    } catch {
      // Keep local preview if upload fails
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  // Support clipboard paste (e.g. Snipping tool / Win+Shift+S / PrtScn)
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
          break;
        }
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square max-w-[200px]"
      : aspectRatio === "video"
      ? "aspect-video"
      : "min-h-[140px]";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      <div
        ref={dropzoneRef}
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer outline-hidden select-none ${
          aspectClass
        } ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/80 ring-4 ring-emerald-500/20 scale-[1.01]"
            : value
            ? "border-emerald-400/80 bg-slate-900/5 hover:border-emerald-500"
            : "border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-400"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        {value ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center group">
            <img
              src={value}
              alt="Uploaded Preview"
              className="max-h-48 w-full object-contain rounded-lg shadow-2xs"
            />

            {/* Remove / Replace Overlay Button */}
            <div className="absolute top-1 right-1 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white transition-colors shadow-md"
                title="Remove image"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Check className="h-3 w-3" />
              <span>Image Attached • Click or drop to replace</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-2 py-2">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform ${
                isDragging
                  ? "bg-emerald-500 text-white scale-110 shadow-md"
                  : "bg-white text-slate-500 border border-slate-200 shadow-2xs"
              }`}
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">
                {isDragging ? "Drop image to upload" : "Drag and drop image here"}
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs">{hint}</p>
            </div>

            <span className="text-[10px] font-mono uppercase font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
              PNG, JPG, WebP up to 10MB
            </span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs rounded-xl flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800">Processing image...</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="text-[11px] text-rose-600 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
