'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { http } from '@/lib/api/http';
import { PropertyImage } from '@/types/property.types';

interface UploadUrlResponse {
  uploadUrl: string;
  storageKey: string;
  publicUrl: string;
}

interface FinalizeUploadResponse extends PropertyImage {}

interface PropertyMediaManagerProps {
  propertyId: string;
  initialImages?: PropertyImage[];
}

export function PropertyMediaManager({
  propertyId,
  initialImages = [],
}: PropertyMediaManagerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<PropertyImage[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images],
  );

  const resetFeedback = () => {
    setMessage(null);
    setErrorMessage(null);
  };

  const persistOrder = async (nextImages: PropertyImage[]) => {
    setIsReordering(true);
    resetFeedback();

    try {
      await http.patch('/media/reorder', {
        propertyId,
        items: nextImages.map((image, index) => ({
          imageId: image.id,
          sortOrder: index,
        })),
      });

      setImages(
        nextImages.map((image, index) => ({
          ...image,
          sortOrder: index,
        })),
      );
      setMessage('Gallery order updated successfully.');
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ??
          'Failed to update image order. Please try again.',
      );
    } finally {
      setIsReordering(false);
    }
  };

  const moveImage = async (imageId: string, direction: 'left' | 'right') => {
    const current = [...sortedImages];
    const index = current.findIndex((item) => item.id === imageId);
    if (index === -1) return;
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === current.length - 1) return;
    const swapIndex = direction === 'left' ? index - 1 : index + 1;
    [current[index], current[swapIndex]] = [current[swapIndex], current[index]];
    await persistOrder(current);
  };

  const handleSetCover = async (imageId: string) => {
    setActiveImageId(imageId);
    resetFeedback();
    try {
      await http.patch(`/media/${imageId}`, { isCover: true });
      setImages((prev) => prev.map((image) => ({ ...image, isCover: image.id === imageId })));
      setMessage('Cover image updated.');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message ?? 'Failed to update cover image. Please try again.');
    } finally {
      setActiveImageId(null);
    }
  };

  const handleAltTextSave = async (imageId: string, altText: string) => {
    setActiveImageId(imageId);
    resetFeedback();
    try {
      await http.patch(`/media/${imageId}`, { altText });
      setImages((prev) => prev.map((image) => image.id === imageId ? { ...image, altText } : image));
      setMessage('Image details updated.');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message ?? 'Failed to save image details. Please try again.');
    } finally {
      setActiveImageId(null);
    }
  };

  const handleDelete = async (imageId: string) => {
    setActiveImageId(imageId);
    resetFeedback();
    try {
      await http.delete(`/media/${imageId}`);
      const nextImages = sortedImages.filter((image) => image.id !== imageId);
      setImages(nextImages.map((image, index) => ({ ...image, sortOrder: index })));
      setMessage('Image removed successfully.');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message ?? 'Failed to remove image. Please try again.');
    } finally {
      setActiveImageId(null);
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const normalizedFiles = Array.from(files);
    if (!normalizedFiles.length) return;
    setIsUploading(true);
    resetFeedback();
    try {
      for (const file of normalizedFiles) {
        const { data: uploadData } = await http.post<UploadUrlResponse>('/media/upload-url', {
          propertyId,
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        });
        await fetch(uploadData.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        const { data: finalizedImage } = await http.post<FinalizeUploadResponse>('/media/finalize', {
          propertyId,
          storageKey: uploadData.storageKey,
          url: uploadData.publicUrl,
          mimeType: file.type,
          sizeBytes: file.size,
        });
        setImages((prev) => [...prev, finalizedImage].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      setMessage('Upload completed successfully.');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message ?? 'Failed to upload one or more files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Gallery management</div>
          <h2 className="mt-3 font-serif text-4xl text-[#1F2328]">Media uploads</h2>
          <p className="mt-3 max-w-2xl text-sm leading-8 text-[#5F5A53]">Upload gallery images, select the cover, edit alt text and refine the order of your presentation.</p>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(31,35,40,0.18)]">{isUploading ? 'Uploading...' : 'Upload images'}</button>
      </div>
      <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(event) => { if (event.target.files?.length) { void uploadFiles(event.target.files); event.target.value = ''; } }} />
      <div onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }} onDrop={(event) => { event.preventDefault(); setIsDragging(false); if (event.dataTransfer.files?.length) { void uploadFiles(event.dataTransfer.files); } }} className={`mt-8 rounded-[28px] border border-dashed px-6 py-10 text-center transition-all duration-300 ${isDragging ? 'border-[#B49A7B] bg-[#F4EBDD]' : 'border-[#DCCDB8] bg-[#FBFAF7]'}`}>
        <div className="mx-auto max-w-2xl"><div className="font-medium text-[#1F2328]">Drag and drop your images here</div><p className="mt-2 text-sm leading-7 text-[#5F5A53]">Upload refined photography that reflects the tone of your property. You can also click the upload button to choose files manually.</p></div>
      </div>
      {message ? <div className="mt-6 rounded-[20px] border border-[#DCCDB8] bg-[#F8F3EA] px-5 py-4 text-sm text-[#5F5A53]">{message}</div> : null}
      {errorMessage ? <div className="mt-6 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{errorMessage}</div> : null}
      {isReordering ? <div className="mt-6 text-sm text-[#8A7660]">Saving image order...</div> : null}
      {sortedImages.length === 0 ? <div className="mt-8 rounded-[26px] border border-[#E8DED0] bg-[#FCFBF9] px-6 py-10 text-center text-sm text-[#6E665E]">No images have been uploaded yet.</div> : null}
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {sortedImages.map((image, index) => (
            <motion.article key={image.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} whileHover={{ y: -6 }} className="overflow-hidden rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] shadow-[0_10px_30px_rgba(31,35,40,0.03)]">
              <div className="relative aspect-[4/3] overflow-hidden"><img src={image.url} alt={image.altText || 'Property image'} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]" />{image.isCover ? <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#1F2328] shadow">Cover</div> : null}</div>
              <ImageMetaEditor image={image} index={index} total={sortedImages.length} isBusy={activeImageId === image.id} onSaveAltText={handleAltTextSave} onSetCover={handleSetCover} onDelete={handleDelete} onMoveLeft={() => moveImage(image.id, 'left')} onMoveRight={() => moveImage(image.id, 'right')} />
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ImageMetaEditor({ image, index, total, isBusy, onSaveAltText, onSetCover, onDelete, onMoveLeft, onMoveRight, }: { image: PropertyImage; index: number; total: number; isBusy: boolean; onSaveAltText: (imageId: string, altText: string) => Promise<void>; onSetCover: (imageId: string) => Promise<void>; onDelete: (imageId: string) => Promise<void>; onMoveLeft: () => Promise<void>; onMoveRight: () => Promise<void>; }) {
  const [altText, setAltText] = useState(image.altText ?? '');
  useEffect(() => { setAltText(image.altText ?? ''); }, [image.altText]);
  return <div className="p-5"><div className="flex items-center justify-between gap-3"><div className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">Position {index + 1}</div><div className="text-xs text-[#7A726A]">{image.isCover ? 'Primary image' : `Image ${index + 1} of ${total}`}</div></div><div className="mt-4"><label className="mb-2 block text-sm text-[#5F5A53]">Alt text</label><input value={altText} onChange={(event) => setAltText(event.target.value)} className="w-full rounded-[18px] border border-[#E7DED1] bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#C8B193]" placeholder="Describe the image for accessibility" /></div><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => void onSaveAltText(image.id, altText)} disabled={isBusy} className="rounded-full border border-[#D9C7B0] bg-white px-4 py-3 text-sm text-[#1F2328] transition-all duration-300 hover:-translate-y-0.5">{isBusy ? 'Saving...' : 'Save text'}</button><button type="button" onClick={() => void onSetCover(image.id)} disabled={isBusy || image.isCover} className="rounded-full bg-[#1F2328] px-4 py-3 text-sm text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60">{image.isCover ? 'Cover image' : 'Set as cover'}</button></div><div className="mt-4 grid grid-cols-3 gap-3"><button type="button" onClick={() => void onMoveLeft()} disabled={isBusy || index === 0} className="rounded-full border border-[#D9C7B0] bg-white px-4 py-3 text-sm text-[#1F2328] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50">Move left</button><button type="button" onClick={() => void onMoveRight()} disabled={isBusy || index === total - 1} className="rounded-full border border-[#D9C7B0] bg-white px-4 py-3 text-sm text-[#1F2328] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50">Move right</button><button type="button" onClick={() => void onDelete(image.id)} disabled={isBusy} className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 transition-all duration-300 hover:-translate-y-0.5">Delete</button></div></div>;
}
