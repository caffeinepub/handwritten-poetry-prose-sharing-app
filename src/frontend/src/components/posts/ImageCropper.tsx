import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crop, RotateCcw, Check, X } from 'lucide-react';

interface ImageCropperProps {
  imageFile: File;
  imagePreview: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageFile,
  imagePreview,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      const rect = img.getBoundingClientRect();
      setImageSize({ width: rect.width, height: rect.height });
      
      // Initialize crop area to center 80% of image
      const margin = 0.1;
      setCropArea({
        x: rect.width * margin,
        y: rect.height * margin,
        width: rect.width * (1 - 2 * margin),
        height: rect.height * (1 - 2 * margin),
      });
    }
  }, [imagePreview]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setCropArea((prev) => {
      const newX = Math.max(0, Math.min(prev.x + deltaX, imageSize.width - prev.width));
      const newY = Math.max(0, Math.min(prev.y + deltaY, imageSize.height - prev.height));
      return { ...prev, x: newX, y: newY };
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    const margin = 0.1;
    setCropArea({
      x: imageSize.width * margin,
      y: imageSize.height * margin,
      width: imageSize.width * (1 - 2 * margin),
      height: imageSize.height * (1 - 2 * margin),
    });
  };

  const handleApplyCrop = async () => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = cropArea.width * scaleX;
    canvas.height = cropArea.height * scaleY;

    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      imageFile.type || 'image/jpeg',
      0.95
    );
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crop className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Crop Your Image</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <div
          ref={containerRef}
          className="relative select-none overflow-hidden rounded-lg border bg-muted"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imagePreview}
            alt="Crop preview"
            className="w-full h-auto max-h-[500px] object-contain"
            draggable={false}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Dark overlay outside crop area */}
            <svg className="w-full h-full">
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={cropArea.x}
                    y={cropArea.y}
                    width={cropArea.width}
                    height={cropArea.height}
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="black"
                opacity="0.5"
                mask="url(#crop-mask)"
              />
            </svg>

            {/* Crop area border */}
            <div
              className="absolute border-2 border-primary cursor-move pointer-events-auto"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full" />
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Drag the crop area to adjust. Click Apply when ready.
        </p>

        <div className="flex gap-3">
          <Button onClick={handleApplyCrop} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Apply Crop
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
