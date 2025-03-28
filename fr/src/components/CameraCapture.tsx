
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        toast.success('Camera started');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const imageData = canvas.toDataURL('image/jpeg');
      onCapture(imageData);
      
      // Stop the camera
      stopCamera();
      toast.success('Image captured');
    }
  };

  React.useEffect(() => {
    // Start the camera when component mounts
    startCamera();
    
    // Cleanup when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative bg-card rounded-lg overflow-hidden shadow-2xl max-w-md w-full">
        <div className="p-3 bg-primary text-primary-foreground flex items-center justify-between">
          <h3 className="font-medium">Take a Picture</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <X size={18} />
          </Button>
        </div>
        
        <div className="relative aspect-[4/3] bg-black w-full overflow-hidden">
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas 
            ref={canvasRef}
            className="hidden" 
          />
        </div>
        
        <div className="p-4 flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-1/3"
          >
            Cancel
          </Button>
          <Button 
            variant="default"
            onClick={captureImage}
            className="w-1/3 bg-green-600 hover:bg-green-700"
            disabled={!isStreaming}
          >
            Capture
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
