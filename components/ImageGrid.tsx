import React from 'react';
import { ImageFile } from '../types';

interface ImageGridProps {
  images: ImageFile[];
  sortedIds: string[];
  onImageClick: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onImageZoom: (image: ImageFile) => void;
  showRemoveButton?: boolean;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, sortedIds, onImageClick, onRemoveImage, onImageZoom, showRemoveButton = true }) => {
  return (
    <div className="image-grid">
      {images.map((image) => {
        const sortedIndex = sortedIds.indexOf(image.id);
        const isSorted = sortedIndex !== -1;

        return (
          <div
            key={image.id}
            className={`image-grid-item ${isSorted ? 'sorted' : ''}`}
            onClick={() => onImageClick(image.id)}
          >
            {showRemoveButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(image.id);
                }}
                className="image-grid-item-overlay-button image-grid-item-remove-button"
                aria-label="이미지 제거"
              >
                X
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageZoom(image);
              }}
              className="image-grid-item-overlay-button image-grid-item-zoom-button"
              style={{ right: showRemoveButton ? '3rem' : '0.5rem' }}
              aria-label="이미지 확대"
            >
              확대
            </button>
            <img
              src={image.previewUrl}
              alt={image.file.name}
            />
            {isSorted && (
              <div className="image-grid-item-badge">
                {sortedIndex + 1}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ImageGrid;