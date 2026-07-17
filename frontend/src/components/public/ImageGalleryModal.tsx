import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Department } from '@/types/department';
import { getImageUrl } from '@/utils/imageUtils';

interface ImageGalleryModalProps {
  department: Department;
  onClose: () => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ department, onClose }) => {
  const images = department.images && department.images.length > 0 
    ? department.images.map(img => getImageUrl(img))
    : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  // Escuchar tecla ESC para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Prevenir scroll en body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-slate-900/80 to-transparent">
        <div className="text-white">
          <h3 className="text-2xl font-display font-bold">{department.name}</h3>
          <p className="text-slate-300 font-medium mt-1">
            Imagen {currentIndex + 1} de {images.length}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-emerald-400 p-2 transition-colors bg-white/10 hover:bg-white/20 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-[70vh] flex items-center justify-center px-4 md:px-20 mt-12">
        <img 
          src={images[currentIndex]} 
          alt={`Vista ${currentIndex + 1} de ${department.name}`}
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-opacity duration-300"
        />

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 md:left-8 p-3 rounded-full bg-slate-800/80 hover:bg-emerald-600 text-white transition-all shadow-lg backdrop-blur-md"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 md:right-8 p-3 rounded-full bg-slate-800/80 hover:bg-emerald-600 text-white transition-all shadow-lg backdrop-blur-md"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 px-4 overflow-x-auto py-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                currentIndex === idx 
                  ? 'border-emerald-500 scale-110 opacity-100 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                  : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
              }`}
            >
              <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGalleryModal;
