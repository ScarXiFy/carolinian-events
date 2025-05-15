'use client';

import { UploadDropzone } from "@/utils/uploadthing";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageUploadProps {
  onChange: (value: string) => void;
  value: string;
}

const ImageUpload = ({ onChange, value }: ImageUploadProps) => {
  const [imageUrl, setImageUrl] = useState(value);

  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  return (
    <div>
      <UploadDropzone
        appearance={{
          container: {
            border: "1px solid white",
            borderRadius: "0.375rem", // rounded-md equivalent
            padding: "1rem" // p-4 equivalent
          },
          button: {
            backgroundColor: "#3b82f6", // bg-blue-500
            color: "white",
            padding: "0.5rem 1rem" // py-2 px-4
          }
        }}
        endpoint='imageUploader' 
        onClientUploadComplete={(res) => {
          if (res && res[0]?.url) {
            setImageUrl(res[0].url);
            onChange(res[0].url);
          }
        }}
        onUploadError={(error: Error) => {
          console.error("Upload error:", error);
        }} 
      />

      {imageUrl && (
        <div className="mt-4">
          <div className="relative aspect-square w-full max-w-xs mx-auto">
            <Image 
              src={imageUrl} 
              alt="Uploaded image" 
              fill
              className="rounded-md object-cover"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload;