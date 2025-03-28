
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  formatTime: (date: Date) => string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, formatTime }) => {
  return (
    <div 
      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} chat-bubble`}
    >
      <div className={`flex gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
        <Avatar className={`h-8 w-8 ${
          message.sender === 'assistant' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'
        }`}>
          {message.sender === 'assistant' ? <MessageSquare size={14} /> : <div className="text-xs">You</div>}
        </Avatar>
        
        <div className={`rounded-lg p-3 text-sm ${
          message.sender === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          <p>{message.text}</p>
          <div className={`text-xs mt-1 ${
            message.sender === 'user' 
              ? 'text-primary-foreground/70' 
              : 'text-muted-foreground'
          }`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
