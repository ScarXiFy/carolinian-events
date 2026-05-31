"use client";

import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

export type EventImageItem =
  | {
      id: string;
      kind: "existing";
      url: string;
    }
  | {
      id: string;
      kind: "new";
      file: File;
      previewUrl: string;
    };

type EventImageUploaderProps = {
  items: EventImageItem[];
  onItemsChange: (items: EventImageItem[]) => void;
  mode: "create" | "edit";
  disabled?: boolean;
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function EventImageUploader({
  items,
  onItemsChange,
  mode,
  disabled = false,
}: EventImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef(new Set<string>());
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      for (const previewUrl of previewUrls) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  function addFiles(files: File[]) {
    const validItems: EventImageItem[] = [];

    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Event images must be JPG, PNG, WebP, or GIF files.");
        continue;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(
          `Image size exceeds the 5 MB limit. ${file.name} is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
        );
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);

      validItems.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        kind: "new",
        file,
        previewUrl,
      });
    }

    if (validItems.length > 0) {
      onItemsChange([...items, ...validItems]);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    addFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function removeItem(id: string) {
    const removed = items.find((item) => item.id === id);
    if (removed?.kind === "new") {
      URL.revokeObjectURL(removed.previewUrl);
      previewUrlsRef.current.delete(removed.previewUrl);
    }
    onItemsChange(items.filter((item) => item.id !== id));
  }

  const imageCount = items.length;
  const emptyMessage =
    mode === "create"
      ? "At least 1 image is required."
      : "Keep at least 1 image before saving.";

  return (
    <div className="event-image-uploader">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div
        className={`event-image-dropzone ${isDragging ? "is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="event-image-dropzone-icon" aria-hidden="true">
          <UploadCloud size={28} />
        </div>
        <div>
          <p>Drag and drop event images</p>
          <span>JPG, PNG, WebP, or GIF. 5 MB max per image.</span>
        </div>
        <button
          type="button"
          className="legacy-btn legacy-btn-secondary btn-sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus size={16} aria-hidden="true" />
          Choose Files
        </button>
      </div>

      <div className="event-image-upload-summary" aria-live="polite">
        <span>
          {imageCount} image{imageCount === 1 ? "" : "s"} selected
        </span>
        <span>{imageCount > 0 ? "First image is used as the banner." : emptyMessage}</span>
      </div>

      {items.length > 0 ? (
        <div className="event-image-preview-grid">
          {items.map((item, index) => {
            const src = item.kind === "existing" ? item.url : item.previewUrl;
            const label = item.kind === "existing" ? "Existing image" : "New image";

            return (
              <div key={item.id} className="event-image-preview-card">
                <div className="event-image-preview-media">
                  <div
                    className="event-image-preview-bg"
                    style={{ backgroundImage: `url("${src}")` }}
                    role="img"
                    aria-label={`${label} ${index + 1}`}
                  />
                </div>
                <div className="event-image-preview-meta">
                  <div>
                    <span>{label}</span>
                    {index === 0 ? <strong>Banner image</strong> : null}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
                    onClick={() => removeItem(item.id)}
                    disabled={disabled}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
