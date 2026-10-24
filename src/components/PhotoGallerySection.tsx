import React, { useState, useRef } from 'react';
import { Camera, Plus, X, ChevronLeft, ChevronRight, Heart, Sparkles, Trash2 } from 'lucide-react';
import { PhotoMemory } from '../types/birthday';
import { triggerHeartShower } from '../utils/confettiUtils';

interface PhotoGallerySectionProps {
  photos: PhotoMemory[];
  onAddPhoto: (photo: PhotoMemory) => void;
  onDeletePhoto: (id: string) => void;
  recipientName: string;
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({
  photos,
  onAddPhoto,
  onDeletePhoto,
  recipientName,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAddModal = () => {
    setIsAddingPhoto(true);
    setNewPhotoUrl('');
    setNewCaption('');
    setNewDate('');
    setNewTag('Cherished Moment');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setNewPhotoUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    const newPhoto: PhotoMemory = {
      id: `photo-${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newCaption.trim() || `Beautiful moments with ${recipientName}`,
      date: newDate.trim() || 'Timeless Memory',
      tag: newTag.trim() || 'Special Memory',
    };

    onAddPhoto(newPhoto);
    setIsAddingPhoto(false);
    triggerHeartShower();
  };

  const currentPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
  };

  return (
    <section id="memories" className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header with Title and Add Picture Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 pb-6 border-b border-rose-900/15">
          <div>
            <div className="flex items-center gap-2 text-xs md:text-sm tracking-widest uppercase font-semibold text-rose-600 mb-2">
              <Camera className="w-4 h-4 text-rose-500" />
              <span>Memories of You</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d1822] font-display">
              A Gallery of Her Light
            </h2>
            <p className="text-[#5c404c] text-sm sm:text-base mt-2 max-w-lg leading-relaxed">
              Snapshots of laughter, quiet smiles, and the moments that make loving {recipientName} so effortless.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="pb-1.5 border-b-2 border-rose-500 text-xs sm:text-sm font-semibold text-[#2d1822] hover:text-rose-600 hover:border-amber-500 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-rose-500" />
              <span>Add Her Pictures</span>
            </button>
          </div>
        </div>

        {/* Frameless Editorial Gallery Grid (No card boxes or rounded borders) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {photos.map((photo, index) => {
            const indexLabel = String(index + 1).padStart(2, '0');

            return (
              <figure
                key={photo.id}
                className="group relative flex flex-col justify-between transition-transform duration-500 hover:-translate-y-1.5"
              >
                {/* Frameless Photo Surface */}
                <div
                  className="relative overflow-hidden aspect-[4/5] bg-rose-100/70 cursor-pointer"
                  onClick={() => setSelectedPhotoIndex(index)}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.classList.add('flex', 'flex-col', 'items-center', 'justify-center', 'p-4', 'text-center');
                        parent.innerHTML = `
                          <div class="text-rose-500 mb-2">📸</div>
                          <div class="text-xs text-[#5c404c] font-medium">Cherished Photo</div>
                        `;
                      }
                    }}
                  />

                  {/* Subtle warm hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d1822]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="text-xs font-medium text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>View Closer</span>
                    </span>
                    <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
                  </div>
                </div>

                {/* Unboxed Editorial Caption & Metadata */}
                <figcaption className="pt-4">
                  <div className="flex items-center justify-between text-[11px] text-rose-600 font-mono mb-1">
                    <span>{indexLabel} · {photo.date || 'Golden memory'}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove this photo from ${recipientName}'s memories?`)) {
                          onDeletePhoto(photo.id);
                        }
                      }}
                      title="Delete photo"
                      className="text-[#8c6d79] hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-normal text-[#3b222e] leading-snug">
                    {photo.caption}
                  </p>
                </figcaption>
              </figure>
            );
          })}
        </div>

        {/* Empty State */}
        {photos.length === 0 && (
          <div className="text-center py-16 px-4 border-y border-rose-900/15">
            <Camera className="w-10 h-10 text-rose-500 mx-auto mb-3 opacity-70" />
            <h3 className="text-lg font-semibold text-[#2d1822]">No photos added yet</h3>
            <p className="text-xs text-[#634853] max-w-sm mx-auto mt-1 mb-5">
              Add her favorite snapshots, memories from your trips, or radiant smiles to make this tribute truly hers.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="pb-1 border-b border-rose-500 text-xs font-medium text-rose-600 hover:text-[#2d1822] transition-colors cursor-pointer"
            >
              Add First Picture
            </button>
          </div>
        )}

        {/* Add Her Picture Modal */}
        {isAddingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1822]/45 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#fffaf5] border-y border-rose-900/20 w-full max-w-lg p-6 relative shadow-2xl">
              <button
                onClick={() => setIsAddingPhoto(false)}
                className="absolute top-5 right-5 text-[#7a5c68] hover:text-[#2d1822] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-[#2d1822] font-display">Add a Picture of {recipientName}</h3>
              </div>

              <form onSubmit={handleSaveNewPhoto} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5c404c] mb-1.5">
                    Choose Photo (From Device or Web URL)
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 text-xs font-medium bg-rose-100 hover:bg-rose-200/80 text-[#2d1822] border-b border-rose-500 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-rose-600" />
                      <span>Upload from Device</span>
                    </button>

                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="Or paste an image URL (https://...)"
                      className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] placeholder-[#9b7e89] focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {newPhotoUrl && (
                  <div className="relative w-full h-44 overflow-hidden bg-rose-100/60 flex items-center justify-center">
                    <img
                      src={newPhotoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                    Caption or Cherished Memory
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="e.g. That summer afternoon in the botanical gardens..."
                    className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] placeholder-[#9b7e89] focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                      Date / Moment
                    </label>
                    <input
                      type="text"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      placeholder="e.g. June 15 · Golden hour"
                      className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] placeholder-[#9b7e89] focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5c404c] mb-1">
                      Theme Tag
                    </label>
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="e.g. Pure Joy"
                      className="w-full text-xs p-2.5 bg-transparent border-b border-rose-900/25 text-[#2d1822] placeholder-[#9b7e89] focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingPhoto(false)}
                    className="px-4 py-2 text-xs font-medium text-[#634853] hover:text-[#2d1822] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPhotoUrl.trim()}
                    className="pb-1.5 border-b-2 border-rose-500 text-xs font-semibold text-[#2d1822] hover:text-rose-600 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Add to Her Gallery
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Fullscreen Lightbox Modal */}
        {currentPhoto && selectedPhotoIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1822]/85 backdrop-blur-md animate-fade-in">
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-6 right-6 text-white/85 hover:text-white p-2 transition-colors z-20 cursor-pointer"
              aria-label="Close photo preview"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={handlePrevPhoto}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/85 hover:text-white p-3 transition-colors z-20 cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNextPhoto}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/85 hover:text-white p-3 transition-colors z-20 cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="max-w-2xl w-full flex flex-col items-center">
              <div className="relative max-h-[70vh] overflow-hidden bg-[#1a0d13]">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.caption}
                  className="max-h-[70vh] w-auto object-contain mx-auto"
                />
              </div>

              <div className="mt-4 text-center max-w-lg">
                <p className="text-base sm:text-lg font-medium text-white font-display">
                  {currentPhoto.caption}
                </p>
                <div className="flex items-center justify-center gap-3 text-xs text-rose-200 mt-1.5">
                  <span>{currentPhoto.date || 'Cherished Memory'}</span>
                  <span>·</span>
                  <span>{selectedPhotoIndex + 1} of {photos.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
