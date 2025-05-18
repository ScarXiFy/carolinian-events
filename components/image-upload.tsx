// components/image-upload.tsx
'use client';

import { UploadDropzone } from "@/utils/uploadthing";
import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface ImageUploadProps {
  onChange: (value: string) => void;
  value: string;
}

const ImageUpload = ({ onChange, value }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveImage = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}
      {!value ? (
        <UploadDropzone
          appearance={{
            container: {
              border: "1px dashed #e2e8f0",
              borderRadius: "0.375rem",
              padding: "1.5rem",
              backgroundColor: "#f8fafc",
              transition: "all 0.2s ease",
            },
            button: {
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
            },
            label: {
              color: "#64748b",
              fontSize: "0.875rem",
            },
            uploadIcon: {
              color: "#94a3b8",
            }
          }}
          endpoint="imageUploader"
          onUploadBegin={() => {
            setIsUploading(true);
            setError(null);
          }}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            if (res?.[0]?.url) {
              onChange(res[0].url);
            }
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false);
            setError(error.message || "Upload failed");
            console.error("Upload error:", error);
          }}
        />
      ) : (
        <div className="relative group">
          <div className="relative aspect-square w-full max-w-xs mx-auto rounded-md overflow-hidden border">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 mr-1" />
                Remove Image
              </Button>
            </div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="text-center text-sm text-muted-foreground">
          Uploading image...
        </div>
      )}
    </div>
  );
};

export default ImageUpload;