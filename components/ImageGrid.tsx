import React, { useRef, useState } from 'react';
import { ImageFile } from '../types';

interface ImageGridProps {
  images: ImageFile[];
  sortedIds: string[];
  onImageClick: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onImageZoom: (image: ImageFile) => void;
  showRemoveButton?: boolean;
  onReorder?: (newSortedIds: string[]) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, sortedIds, onImageClick, onRemoveImage, onImageZoom, showRemoveButton = true, onReorder }) => {
  const draggedItemId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    draggedItemId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    if (draggedItemId.current !== id) {
      setDragOverId(id);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, droppedOnId: string) => {
    e.preventDefault();
    if (!draggedItemId.current || !onReorder) return;
    
    const draggedId = draggedItemId.current;
    if (draggedId === droppedOnId) return;

    const fromIndex = sortedIds.indexOf(draggedId);
    const toIndex = sortedIds.indexOf(droppedOnId);

    if (fromIndex === -1 || toIndex === -1) return;

    const newSortedIds = [...sortedIds];
    const [removed] = newSortedIds.splice(fromIndex, 1);
    newSortedIds.splice(toIndex, 0, removed);
    
    onReorder(newSortedIds);
    draggedItemId.current = null;
    setDragOverId(null);
  };
  
  const handleDragEnd = () => {
    draggedItemId.current = null;
    setDragOverId(null);
  };

  return (
    <div className="image-grid">
      {images.map((image) => {
        const sortedIndex = sortedIds.indexOf(image.id);
        const isSorted = sortedIndex !== -1;

        let itemClassName = `image-grid-item ${isSorted ? 'sorted' : ''}`;
        if (onReorder && image.id === dragOverId) {
          itemClassName += ' drag-over-target';
        }

        return (
          <div
            key={image.id}
            className={itemClassName}
            onClick={() => onImageClick(image.id)}
            draggable={!!onReorder}
            onDragStart={onReorder ? (e) => handleDragStart(e, image.id) : undefined}
            onDragOver={onReorder ? handleDragOver : undefined}
            onDrop={onReorder ? (e) => handleDrop(e, image.id) : undefined}
            onDragEnter={onReorder ? (e) => handleDragEnter(e, image.id) : undefined}
            onDragLeave={onReorder ? handleDragLeave : undefined}
            onDragEnd={onReorder ? handleDragEnd : undefined}
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