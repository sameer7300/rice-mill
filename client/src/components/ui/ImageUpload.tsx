import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Link } from 'lucide-react';
import api from '../../api';

interface ImageUploadProps {
  value: string;                    // current imageUrl (relative /uploads/... or full https://...)
  onChange: (url: string) => void;  // called with the new URL on success
  label?: string;
  hint?: string;
}

// The server always returns full absolute URLs for uploads.
// For externally-pasted URLs this is also already absolute.
function toDisplaySrc(url: string): string {
  return url || '';
}

export default function ImageUpload({ value, onChange, label = 'Image', hint }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const displaySrc = toDisplaySrc(value);

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>}

      {/* Drop zone / preview */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden
          ${uploading ? 'border-green-400 bg-green-50' : value ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/40'}`}
        style={{ minHeight: 120 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleInputChange}
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 size={24} className="text-green-600 animate-spin" />
            <p className="text-xs text-green-700 font-medium">Uploading…</p>
          </div>
        ) : displaySrc ? (
          /* Image preview */
          <div className="relative group">
            <img
              src={displaySrc}
              alt="preview"
              className="w-full object-cover rounded-xl"
              style={{ maxHeight: 200 }}
              onError={e => { (e.target as HTMLImageElement).src = ''; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-full">
                Click to replace
              </span>
            </div>
            {/* Remove button */}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(''); }}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
            <Upload size={24} className="text-gray-300" />
            <p className="text-xs font-medium text-gray-500">Drop image here or click to browse</p>
            <p className="text-[11px] text-gray-400">JPG, PNG, WebP, GIF · max 5 MB</p>
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-red-600 font-medium">
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Secondary actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowUrlInput(v => !v)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors"
        >
          <Link size={11} /> {showUrlInput ? 'Hide URL input' : 'Or paste a URL'}
        </button>
      </div>

      {/* URL fallback input */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 overflow-hidden">
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyUrl(); } }}
              placeholder="https://example.com/image.jpg"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}
