
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: () => void;
  isRecording: boolean;
  toggleRecording: () => void;
  isSending: boolean;
  onOpenCamera: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  input, 
  setInput, 
  handleSendMessage, 
  isRecording, 
  toggleRecording, 
  isSending,
  onOpenCamera
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="p-3 border-t bg-card">
      <div className="flex items-end gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleRecording}
          className={`h-9 w-9 shrink-0 rounded-full ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
        >
          <Mic size={18} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onOpenCamera}
          className="h-9 w-9 shrink-0 rounded-full text-blue-500"
        >
          <Camera size={18} />
        </Button>
        
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask something about resumes..."
          className="min-h-9 resize-none py-2"
          rows={1}
        />
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSendMessage}
          disabled={!input.trim() || isSending}
          className="h-9 w-9 shrink-0 rounded-full text-primary"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
