import React, { useEffect } from 'react';
import { ImageFile } from '../types';

interface ImageModalProps {
  image: ImageFile | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!image) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="확대된 이미지"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="modal-close-button"
          aria-label="닫기"
        >
          X
        </button>
        <img
          src={image.previewUrl}
          alt={image.file.name}
          className="modal-image"
        />
      </div>
    </div>
  );
};

export default ImageModal;