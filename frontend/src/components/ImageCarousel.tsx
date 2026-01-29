import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt = 'Department image' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasImages = images && images.length > 0;
  const placeholder = 'https://via.placeholder.com/800x600?text=Sin+Imagen';
  const displayImages = hasImages ? images : [placeholder];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Carrusel principal */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        {/* Imagen principal */}
        <div className="relative aspect-video">
          <img
            src={displayImages[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={openModal}
          />
          
          {/* Botón de zoom */}
          <button
            onClick={openModal}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-opacity"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Controles de navegación */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Contador de imágenes */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-lg">
              {currentIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {displayImages.length > 1 && (
          <div className="p-4">
            <div className="flex gap-2 overflow-x-auto">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-borders ${
                    index === currentIndex ? 'border-primary-500' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de imagen ampliada */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            {/* Botón cerrar */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Imagen ampliada */}
            <img
              src={displayImages[currentIndex]}
              alt={`${alt} ${currentIndex + 1} - Ampliada`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Controles en modal */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
                
                {/* Contador en modal */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-50 text-white rounded-lg">
                  {currentIndex + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCarousel;