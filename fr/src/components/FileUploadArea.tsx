
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, File, X } from 'lucide-react';
import { toast } from 'sonner';

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadAreaProps {
  onFilesSelected: (files: FileWithPreview[]) => void;
  onParseClick: () => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFilesSelected, onParseClick }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map(file => {
      // Create object URL for preview
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);
      return fileWithPreview;
    });

    setFiles(prev => [...prev, ...newFiles]);
    onFilesSelected([...files, ...newFiles]);
    toast.success(`${selectedFiles.length} file(s) added`);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    // Revoke the object URL to avoid memory leaks
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleCaptureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capturedFiles = Array.from(e.target.files || []);
    if (capturedFiles.length > 0) {
      addFiles(capturedFiles);
    }
  };

  return (
    <div className="animate-fade-in">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
          isDragging ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 dark:bg-gray-800/30 border-gray-300 dark:border-gray-700'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="mb-6 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse-glow text-blue-500">
          <Upload size={28} className="text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Upload Resume Files</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Drag and drop your resume files here, or click to select files from your device. We support PDF, DOCX, and image files.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <File size={18} />
            Select Files
          </Button>
          
          <Button 
            onClick={handleCameraCapture} 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-purple-50 hover:text-purple-600 transition-colors"
          >
            <Camera size={18} />
            Use Camera
          </Button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
            className="hidden" 
          />
          
          <input 
            type="file" 
            ref={cameraInputRef} 
            onChange={handleCaptureChange}
            accept="image/*" 
            capture="environment"
            className="hidden" 
          />
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <File size={18} className="text-primary" />
            Selected Files ({files.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                    <File size={16} />
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveFile(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button 
              onClick={onParseClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 rounded-md text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              Parse Resumes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;
