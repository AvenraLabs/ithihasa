import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, Check, X } from 'lucide-react';
import { uploadImage } from '../api/upload.js';
import { resolveMediaUrl } from '../api/client.js';
import { toast } from 'sonner';

export function ImageUploader({
  value,
  onChange,
  folder = 'products',
  label = 'Upload Image',
  aspectRatio = '3/4',
  helperText = 'PNG, JPG, WebP up to 15MB'
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, AVIF).');
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadImage(file, folder);
      if (result && result.url) {
        onChange(result.url);
        toast.success('Image uploaded successfully to server.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error(err.message || 'Image upload failed. Please retry.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <label className="label-caps text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
            <ImageIcon size={13} className="text-[var(--gold)]" />
            <span>{label}</span>
          </label>
          {value && (
            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
              <Check size={11} /> Uploaded
            </span>
          )}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-3.5 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-[var(--gold)] bg-[var(--gold)]/10 scale-[1.01]'
            : value
            ? 'border-[var(--border-color)] bg-[var(--bg-secondary)]/30 hover:border-[var(--gold)]'
            : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/10 hover:border-[var(--gold)] hover:bg-[var(--bg-secondary)]/30'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        {isUploading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-[var(--gold)]" />
            <span className="text-[12px] text-[var(--text-secondary)]">Uploading to backend storage...</span>
          </div>
        ) : value ? (
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-14 h-16 bg-[var(--bg-card)] border border-[var(--border-color)] rounded overflow-hidden shrink-0 relative group">
              <img src={resolveMediaUrl(value)} alt="Uploaded" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[var(--text-primary)] truncate font-mono">
                {value.split('/').pop()}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Click or drag to replace image
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 text-[var(--text-secondary)] hover:text-rose-500 rounded cursor-pointer"
              title="Remove"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--gold)]">
              <Upload size={16} />
            </div>
            <span className="text-[12px] font-medium text-[var(--text-primary)]">
              Click to upload or drag & drop
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">{helperText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
