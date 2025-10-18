import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ImageFile } from './types';
import ImageGrid from './components/ImageGrid';
import ActionButton from './components/ActionButton';
import ImageModal from './components/ImageModal';

declare const JSZip: any;
declare const saveAs: any;

export default function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [sortedIds, setSortedIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [modalImage, setModalImage] = useState<ImageFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.previewUrl));
    };
  }, [images]);
  
  const sortedImages = sortedIds.map(id => images.find(img => img.id === id)).filter(Boolean) as ImageFile[];

  const handleFilesChange = useCallback((files: FileList) => {
    const newImages = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleImageClick = useCallback((imageId: string) => {
    setSortedIds(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId) 
        : [...prev, imageId]
    );
  }, []);
  
  const handleOpenModal = useCallback((image: ImageFile) => setModalImage(image), []);
  const handleCloseModal = useCallback(() => setModalImage(null), []);
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleClearAll = useCallback(() => {
    images.forEach(image => URL.revokeObjectURL(image.previewUrl));
    setImages([]);
    setSortedIds([]);
  }, [images]);

  const handleResetSort = useCallback(() => {
    setSortedIds([]);
  }, []);

  const handleRemoveImage = useCallback((imageIdToRemove: string) => {
    const imageToRemove = images.find(img => img.id === imageIdToRemove);
    if (imageToRemove) URL.revokeObjectURL(imageToRemove.previewUrl);
    setImages(prev => prev.filter(img => img.id !== imageIdToRemove));
    setSortedIds(prev => prev.filter(id => id !== imageIdToRemove));
  }, [images]);

  const handleDownload = useCallback(async () => {
    if (sortedIds.length === 0) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      sortedImages.forEach((imageFile, index) => {
        const extension = imageFile.file.name.split('.').pop() || 'jpg';
        const newFileName = `${String(index + 1).padStart(3, '0')}.${extension}`;
        zip.file(newFileName, imageFile.file);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'sorted-images.zip');
    } catch (error) {
      console.error("Failed to create zip file", error);
      alert("ZIP 파일을 생성하는 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  }, [sortedIds, sortedImages]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const handleReorder = useCallback((newSortedIds: string[]) => {
    setSortedIds(newSortedIds);
  }, []);

  return (
    <div className="app-container">
       <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFilesChange(e.target.files)}
        className="hidden"
      />
      <header>
        <div>
          <h1>이미지 순서 정렬기</h1>
          <p>이미지를 클릭하여 순서를 정하고, zip 파일로 다운로드하세요.</p>
        </div>
        <ActionButton onClick={toggleTheme} variant="secondary">
          {theme === 'light' ? '다크 모드' : '라이트 모드'}
        </ActionButton>
      </header>

      <main>
        <div className="card-container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div>
              <h2 className="text-xl font-bold">이미지 업로드</h2>
              <p>정렬할 이미지들을 추가하세요.</p>
            </div>
             <ActionButton onClick={triggerFileSelect} variant="primary">
                {images.length > 0 ? '이미지 추가' : '이미지 선택'}
            </ActionButton>
          </div>
        </div>
        
        {images.length > 0 && (
          <>
            <div className="card-container">
              <div className="section-header">
                <h2>업로드된 이미지 ({images.length})</h2>
                <ActionButton onClick={handleClearAll} variant="danger">
                  모두 삭제
                </ActionButton>
              </div>
              <ImageGrid
                images={images}
                sortedIds={sortedIds}
                onImageClick={handleImageClick}
                onRemoveImage={handleRemoveImage}
                onImageZoom={handleOpenModal}
              />
            </div>
            
            <div className="card-container">
              <div className="section-header">
                <h2>정렬된 이미지 미리보기 ({sortedIds.length})</h2>
                {sortedIds.length > 0 && (
                  <div className="action-buttons-group">
                    <ActionButton onClick={handleResetSort} variant="secondary">
                      순서 초기화
                    </ActionButton>
                    <ActionButton
                      onClick={handleDownload}
                      disabled={isDownloading}
                      variant="primary"
                    >
                      {isDownloading ? '압축 중...' : `ZIP으로 다운로드`}
                    </ActionButton>
                  </div>
                )}
              </div>
              {sortedIds.length > 0 ? (
                <ImageGrid
                  images={sortedImages}
                  sortedIds={sortedIds}
                  onImageClick={handleImageClick}
                  onRemoveImage={handleRemoveImage}
                  onImageZoom={handleOpenModal}
                  showRemoveButton={false}
                  onReorder={handleReorder}
                />
              ) : (
                <div className="placeholder">
                  <p>위 목록의 이미지를 클릭하여 정렬을 시작하세요.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

       <ImageModal image={modalImage} onClose={handleCloseModal} />
    </div>
  );
}