"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  /** Currently displayed image URL (from parent form state) */
  value?: string;
  /** Called with the new ImgBB URL after a successful upload */
  onChange: (url: string) => void;
  /** Optional size in pixels for the preview circle. Default: 80 */
  previewSize?: number;
}

export default function ImageUploader({
  value,
  onChange,
  previewSize = 80,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displaySrc = localPreview || value || null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be smaller than 8 MB.");
      return;
    }

    // Show local preview immediately so the UI feels responsive
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success && result.url) {
        onChange(result.url);
        toast.success("Image uploaded successfully.");
      } else {
        toast.error(result.message || "Upload failed. Please try again.");
        // Revert local preview on failure
        setLocalPreview(null);
        URL.revokeObjectURL(objectUrl);
      }
    } catch {
      toast.error("Upload failed. Check your internet connection.");
      setLocalPreview(null);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onChange("");
  };

  return (
    <div className="flex items-center gap-4">
      {/* Preview circle */}
      <div
        className="relative flex-shrink-0 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
        style={{ width: previewSize, height: previewSize }}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        ) : displaySrc ? (
          <Image
            src={displaySrc}
            alt="Profile preview"
            fill
            className="object-cover"
            sizes={`${previewSize}px`}
            unoptimized // local blob URLs skip Next.js optimisation
          />
        ) : (
          <ImageIcon className="w-7 h-7 text-zinc-400" />
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {/* Hidden real file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          id="imgbb-file-input"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {/* Styled trigger button */}
        <label
          htmlFor="imgbb-file-input"
          className={`inline-flex items-center gap-2 cursor-pointer rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-2 text-xs font-medium transition-colors ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              {displaySrc ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </label>

        {/* Clear button — only shown when an image is set */}
        {displaySrc && !uploading && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        )}

        <p className="text-[11px] text-muted-foreground">
          JPG, PNG, GIF or WEBP · max 8 MB
        </p>
      </div>
    </div>
  );
}
