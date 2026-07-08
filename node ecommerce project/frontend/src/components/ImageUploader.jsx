/**
 * ImageUploader.jsx
 * ──────────────────────────────────────────────────────────────
 * Drag-and-drop / click-to-upload image uploader that pushes
 * files directly to ImageKit CDN.
 *
 * Props
 * ─────
 * value        : string        – current image URL (single mode)
 * values       : string[]      – current image URLs (multi mode)
 * onUpload     : (url) => void – called after successful upload (single)
 * onMultiUpload: (urls) => void – called with full updated array (multi)
 * multi        : boolean       – enable multiple image support
 * label        : string        – optional label text
 * folder       : string        – ImageKit folder, e.g. "/products"
 */

import { useRef, useState, useCallback } from 'react';
import { FiUploadCloud, FiX, FiImage, FiCheck, FiAlertCircle, FiPlus } from 'react-icons/fi';
import { API_BASE_URL, getAuthHeaders } from '../lib/api';

/* ── theme colours (matches AdminPage) ─────────────────────── */
const T = {
  gold: '#caa24a', goldDeep: '#9c7a2d', navy: '#0b1530',
  border: '#eef0f4', borderStrong: '#e3e6ee',
  text: '#0b1220', textMuted: '#94a3b8', textSoft: '#475569',
  ring: 'rgba(202,162,74,0.25)',
};

/* ── Upload a single file to ImageKit ───────────────────────── */
async function uploadToImageKit(file, folder = '/jyots-collection') {
  // 1. Get auth signature from our backend (admin-only)
  const authRes = await fetch(`${API_BASE_URL}/upload/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!authRes.ok) {
    const err = await authRes.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to get upload auth from server');
  }
  const { token, expire, signature, publicKey } = await authRes.json();

  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
  if (!urlEndpoint || urlEndpoint.includes('REPLACE_ME')) {
    throw new Error('ImageKit URL Endpoint not configured. Set VITE_IMAGEKIT_URL_ENDPOINT in frontend/.env');
  }

  // 2. Upload directly to ImageKit
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', `${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
  formData.append('folder', folder);
  formData.append('publicKey', publicKey);
  formData.append('signature', signature);
  formData.append('expire', String(expire));
  formData.append('token', token);
  formData.append('useUniqueFileName', 'true');

  const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.message || `ImageKit upload failed (${uploadRes.status})`);
  }

  const result = await uploadRes.json();
  return result.url; // e.g. https://ik.imagekit.io/yourname/jyots-collection/timestamp_file.jpg
}

/* ── Single Image Uploader ─────────────────────────────────── */
export function ImageUploader({ value, onUpload, folder = '/jyots-collection', label }) {
  const [dragging, setDragging]     = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);
  const inputRef                    = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.');
      return;
    }

    setError('');
    setSuccess(false);
    setUploading(true);
    setProgress(10);

    // Simulate progress while uploading
    const timer = setInterval(() => setProgress(p => Math.min(p + 8, 85)), 300);
    try {
      const url = await uploadToImageKit(file, folder);
      clearInterval(timer);
      setProgress(100);
      setSuccess(true);
      onUpload(url);
      setTimeout(() => setProgress(0), 1200);
    } catch (err) {
      clearInterval(timer);
      setError(err.message || 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }, [folder, onUpload]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}

      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? T.gold : error ? '#fca5a5' : value ? T.gold + '80' : T.borderStrong}`,
          borderRadius: 14,
          background: dragging ? '#fffaf0' : value ? '#fffdf7' : '#fafbfc',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all .2s ease',
          overflow: 'hidden',
          position: 'relative',
          minHeight: value ? 'auto' : 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Current image preview */}
        {value && (
          <div style={{ position: 'relative', width: '100%' }}>
            <img
              src={value}
              alt="Preview"
              style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
            />
            {/* Overlay on hover */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(11,21,48,0.55)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: 0, transition: 'opacity .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <FiUploadCloud size={28} color="#fff" />
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Replace Image</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!value && !uploading && (
          <div style={{ padding: '28px 20px', textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
            }}>
              <FiUploadCloud size={24} color="#3b82f6" />
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: T.text }}>
              {dragging ? 'Drop image here' : 'Click or drag & drop'}
            </p>
            <p style={{ margin: '5px 0 0', fontSize: 12, color: T.textMuted }}>
              JPG, PNG, WebP · Max 10 MB
            </p>
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div style={{ padding: '28px 20px', textAlign: 'center', width: '100%' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', margin: '0 auto 14px',
              background: `conic-gradient(${T.gold} ${progress * 3.6}deg, #e8e8e8 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: T.gold }}>{progress}%</span>
              </div>
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: T.text }}>Uploading to ImageKit…</p>
            <div style={{ marginTop: 10, height: 4, background: '#eee', borderRadius: 99, overflow: 'hidden', width: '80%', margin: '10px auto 0' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${T.gold}, ${T.goldDeep})`, borderRadius: 99, transition: 'width .3s ease' }} />
            </div>
          </div>
        )}

        {/* Success flash */}
        {success && !uploading && value && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: '#10b981', color: '#fff',
            borderRadius: 999, padding: '4px 10px',
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <FiCheck size={12} /> Uploaded!
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#b42318', fontSize: 12, fontWeight: 600 }}>
          <FiAlertCircle size={13} />
          {error}
        </div>
      )}

      {/* URL display (read-only) */}
      {value && !uploading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: `1px solid ${T.border}`, borderRadius: 9, padding: '7px 11px' }}>
          <FiImage size={13} color={T.textMuted} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, color: T.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {value}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onUpload(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: 2, display: 'flex', alignItems: 'center', flexShrink: 0 }}
            title="Remove image"
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}

/* ── Multi Image Uploader ──────────────────────────────────── */
export function MultiImageUploader({ values = [], onMultiUpload, folder = '/jyots-collection', label }) {
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null); // which slot is uploading
  const [error, setError]         = useState('');
  const inputRef                  = useRef(null);

  const handleFiles = useCallback(async (files) => {
    setError('');
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileArr.length) { setError('Please select image files.'); return; }

    setUploading(true);
    const newUrls = [...values];
    for (let i = 0; i < fileArr.length; i++) {
      setUploadingIdx(values.length + i);
      try {
        const url = await uploadToImageKit(fileArr[i], folder);
        newUrls.push(url);
        onMultiUpload([...newUrls]);
      } catch (err) {
        setError(err.message || 'One or more uploads failed');
      }
    }
    setUploading(false);
    setUploadingIdx(null);
  }, [values, folder, onMultiUpload]);

  const removeImage = (idx) => {
    const updated = values.filter((_, i) => i !== idx);
    onMultiUpload(updated);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}

      {/* Thumbnail grid */}
      {values.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {values.map((url, idx) => (
            <div key={idx} style={{
              width: 90, height: 90, borderRadius: 12, overflow: 'hidden', position: 'relative',
              border: `2px solid ${T.gold}60`, flexShrink: 0,
            }}>
              <img src={url} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {idx === 0 && (
                <span style={{
                  position: 'absolute', bottom: 4, left: 4,
                  background: T.gold, color: T.navy, fontSize: 9, fontWeight: 800,
                  padding: '2px 6px', borderRadius: 99, letterSpacing: '0.05em',
                }}>MAIN</span>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  border: 'none', borderRadius: '50%', width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0,
                }}
              >
                <FiX size={12} />
              </button>
            </div>
          ))}

          {/* Uploading placeholder */}
          {uploading && (
            <div style={{
              width: 90, height: 90, borderRadius: 12,
              border: `2px dashed ${T.gold}`, flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#fffaf0', gap: 4,
            }}>
              <div style={{ width: 28, height: 28, border: `3px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: T.goldDeep }}>Uploading</span>
            </div>
          )}
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? T.gold : T.borderStrong}`,
          borderRadius: 14, background: dragging ? '#fffaf0' : '#fafbfc',
          cursor: uploading ? 'wait' : 'pointer', transition: 'all .2s',
          padding: '20px 16px', textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: '#eff6ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FiPlus size={20} color="#3b82f6" />
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: T.text }}>
            {values.length === 0 ? 'Upload gallery images' : 'Add more images'}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 11.5, color: T.textMuted }}>
            {dragging ? 'Drop here!' : 'Click or drag · Multiple files allowed'}
          </p>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#b42318', fontSize: 12, fontWeight: 600 }}>
          <FiAlertCircle size={13} /> {error}
        </div>
      )}

      <input
        ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

export default ImageUploader;
