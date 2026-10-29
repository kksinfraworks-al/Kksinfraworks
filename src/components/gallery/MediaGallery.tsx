import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MediaItem } from '../../types';
import {
  Images,
  Camera,
  Upload,
  Play,
  Trash2,
  X,
  Building2,
  Calendar,
  Filter,
  Maximize2,
  FileText,
  User,
  AlertCircle,
} from 'lucide-react';

export const MediaGallery: React.FC<{ onOpenReport?: (reportId: string) => void }> = ({
  onOpenReport,
}) => {
  const { user } = useAuth();
  const { media, sites, uploadCameraPhoto, uploadMediaFiles, deleteMediaItem } = useData();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Active preview lightbox modal
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);

  // Upload modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadSiteId, setUploadSiteId] = useState(sites[0]?.id || 'SITE-01');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = media.filter((m) => {
    const matchSite = selectedSiteFilter === 'all' || m.siteId === selectedSiteFilter;
    const matchType = selectedTypeFilter === 'all' || m.type === selectedTypeFilter;
    const matchSearch =
      m.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.workCategory && m.workCategory.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSite && matchType && matchSearch;
  });

  const handleCameraCapture = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setUploading(true);
        try {
          await uploadCameraPhoto(dataUrl, uploadCaption || 'Camera Capture', uploadSiteId);
          setIsUploadOpen(false);
          setUploadCaption('');
        } catch (err: any) {
          setError(err.message || 'Upload failed');
        } finally {
          setUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (files: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('siteId', uploadSiteId);
    formData.append('caption', uploadCaption || 'Site Photo');

    setUploading(true);
    try {
      await uploadMediaFiles(formData);
      setIsUploadOpen(false);
      setUploadCaption('');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (m: MediaItem) => {
    if (window.confirm(`Are you sure you want to delete this media item? An audit record will be logged.`)) {
      await deleteMediaItem(m.id);
      if (activeItem?.id === m.id) setActiveItem(null);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Images className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-bold text-white">Daily Work Media Gallery • फोटो व वीडियो गैलरी</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse construction progress photos, shuttering inspections, and site video recordings
          </p>
        </div>

        <button
          onClick={() => {
            setUploadCaption('');
            setIsUploadOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Site Media (फोटो/वीडियो जोड़ें)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Filter by Site
          </label>
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500"
          >
            <option value="all">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Media Type
          </label>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500"
          >
            <option value="all">Photos & Videos</option>
            <option value="photo">Photos Only</option>
            <option value="video">Videos Only</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Search Captions & Location
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search caption, category..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <Images className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-300">No media items found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Upload photos or videos to visually document daily site work.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-800 hover:border-sky-500/50 transition cursor-pointer shadow-md flex flex-col justify-end"
            >
              {item.type === 'video' ? (
                <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                  <video src={item.url} className="w-full h-full object-cover opacity-60" />
                  <div className="w-10 h-10 rounded-full bg-sky-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.caption}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              )}

              {/* Type pill */}
              <div className="absolute top-2 right-2">
                <span className="text-[9px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-white border border-white/10">
                  {item.type}
                </span>
              </div>

              {/* Caption Overlay */}
              <div className="relative z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-2.5 text-left">
                <p className="text-xs font-bold text-white line-clamp-1">{item.caption}</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">{item.siteName}</p>
                <div className="flex items-center justify-between text-[9px] text-slate-500 mt-0.5">
                  <span>{item.uploadedByName}</span>
                  <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Video Player Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{activeItem.caption}</h3>
                <p className="text-xs text-slate-400">
                  {activeItem.siteName} • Uploaded by {activeItem.uploadedByName} ({new Date(activeItem.uploadedAt).toLocaleString()})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(activeItem)}
                  className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition"
                  title="Delete media item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Content View */}
            <div className="flex-1 bg-black flex items-center justify-center p-2 overflow-hidden min-h-[300px]">
              {activeItem.type === 'video' ? (
                <video
                  src={activeItem.url}
                  controls
                  autoPlay
                  className="max-h-[65vh] max-w-full rounded-xl"
                />
              ) : (
                <img
                  src={activeItem.url}
                  alt={activeItem.caption}
                  className="max-h-[65vh] max-w-full object-contain rounded-xl"
                />
              )}
            </div>

            {/* Footer with Related Report Link */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                {activeItem.reportLocation && (
                  <p>Location: <strong className="text-amber-400">{activeItem.reportLocation}</strong></p>
                )}
                {activeItem.workCategory && (
                  <p className="text-[11px] text-slate-400">Category: {activeItem.workCategory}</p>
                )}
              </div>

              {activeItem.reportId && onOpenReport && (
                <button
                  onClick={() => {
                    onOpenReport(activeItem.reportId!);
                    setActiveItem(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open Daily Work Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Media Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Upload Site Media</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Construction Site *
                </label>
                <select
                  value={uploadSiteId}
                  onChange={(e) => setUploadSiteId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Caption / Description (कैप्शन)
                </label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="e.g. 2nd Floor Staircase Shuttering Inspection"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition flex flex-col items-center justify-center gap-2 font-bold text-xs"
                >
                  <Camera className="w-6 h-6 text-amber-400" />
                  <span>Take Live Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-4 rounded-2xl bg-sky-500/15 border border-sky-500/40 text-sky-300 hover:bg-sky-500/25 transition flex flex-col items-center justify-center gap-2 font-bold text-xs"
                >
                  <Upload className="w-6 h-6 text-sky-400" />
                  <span>Choose Gallery Files</span>
                </button>
              </div>

              {uploading && (
                <p className="text-xs text-amber-400 text-center animate-pulse pt-2">
                  Uploading files to permanent cloud storage...
                </p>
              )}

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleCameraCapture(e.target.files[0])}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
