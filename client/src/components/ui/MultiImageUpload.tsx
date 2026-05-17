import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, GripVertical, Star } from 'lucide-react';
import api from '../../api';

interface Props {
  images: string[];           // array of relative/absolute URLs
  onChange: (urls: string[]) => void;
  max?: number;
}

const SERVER = import.meta.env.DEV ? 'http://localhost:5000' : '';

function toDisplay(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${SERVER}${url}`;
  return url;
}

export default function MultiImageUpload({ images, onChange, max = 8 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIdx = useRef<number | null>(null);

  const upload = async (files: FileList) => {
    if (images.length + files.length > max) {
      setError(`Maximum ${max} images allowed`);
      return;
    }
    setError('');
    setUploading(true);
    try {
      const results: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('image', file);
        const res = await api.post('/upload', form);
        results.push(res.data.url);
      }
      onChange([...images, ...results]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const setPrimary = (idx: number) => {
    const next = [...images];
    const [moved] = next.splice(idx, 1);
    next.unshift(moved);
    onChange(next);
  };

  // Simple drag-reorder
  const onDragStart = (idx: number) => { dragIdx.current = idx; };
  const onDrop = (idx: number) => {
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const next = [...images];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(idx, 0, moved);
    dragIdx.current = null;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Product Images <span className="text-gray-400 normal-case font-normal">({images.length}/{max})</span>
        </p>
        {images.length > 0 && (
          <p className="text-[11px] text-gray-400">First image is the cover · drag to reorder</p>
        )}
      </div>

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <AnimatePresence>
            {images.map((url, idx) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className={`relative group rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border-2 transition-colors ${idx === 0 ? 'border-green-400' : 'border-transparent'}`}
                style={{ aspectRatio: '1' }}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(idx)}
              >
                <img
                  src={toDisplay(url)}
                  alt={`Product image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Cover badge */}
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    Cover
                  </span>
                )}
                {/* Hover controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimary(idx)}
                      title="Set as cover"
                      className="w-7 h-7 bg-green-500 hover:bg-green-400 text-white rounded-full flex items-center justify-center shadow"
                    >
                      <Star size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="w-7 h-7 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center shadow"
                  >
                    <X size={12} />
                  </button>
                </div>
                {/* Drag handle indicator */}
                <div className="absolute bottom-1 right-1 text-white/40 group-hover:text-white/70 transition-colors pointer-events-none">
                  <GripVertical size={12} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload zone */}
      {images.length < max && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files); }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 py-6
            ${uploading ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/40'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files?.length) upload(e.target.files); e.target.value = ''; }}
          />
          {uploading ? (
            <Loader2 size={20} className="text-green-600 animate-spin" />
          ) : (
            <Upload size={20} className="text-gray-400" />
          )}
          <p className="text-xs font-medium text-gray-500">
            {uploading ? 'Uploading…' : images.length === 0 ? 'Drop images or click to browse' : 'Add more images'}
          </p>
          <p className="text-[11px] text-gray-400">JPG, PNG, WebP · up to {max - images.length} more</p>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
