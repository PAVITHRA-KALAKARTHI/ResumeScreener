import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, MinusCircle, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import CameraCapture from './CameraCapture';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I can help you search through and analyze resumes. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + ' ' + transcript);
          setIsRecording(false);
          toast.success('Voice input received');
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
          toast.error(`Error: ${event.error}`);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognitionRef.current = recognition;
      } else {
        console.warn('Speech Recognition API not supported in this browser');
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    
    try {
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: getBotResponse(userMessage.text),
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsSending(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setIsSending(false);
    }
  };
  
  const getBotResponse = (message: string): string => {
    const messageL = message.toLowerCase();
    
    if (messageL.includes('hello') || messageL.includes('hi') || messageL.includes('hey')) {
      return "Hello! How can I help you with resume analysis today?";
    } else if (messageL.includes('experience') || messageL.includes('work history')) {
      return "I can help analyze work experience in resumes. You can ask about specific roles, duration, or skills mentioned in the experience sections.";
    } else if (messageL.includes('skills') || messageL.includes('abilities')) {
      return "I can identify and analyze skills mentioned in resumes. Would you like to search for specific skills or get a summary of skills found?";
    } else if (messageL.includes('education') || messageL.includes('degree')) {
      return "I can extract education information from resumes including degrees, institutions, and graduation dates.";
    } else if (messageL.includes('job') || messageL.includes('match')) {
      return "I can help match resumes with job descriptions. Would you like to know more about our job matching features?";
    } else if (messageL.includes('search')) {
      return "You can search through parsed resumes by keyword, skill, company name, or other criteria. What specific information are you looking for?";
    } else {
      return "I'll analyze resumes based on your criteria. You can ask about skills, experience, education, or other sections of the resumes.";
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      toast.info('Voice recording stopped');
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          toast.info('Listening... Speak now. Click again to stop.');
        } catch (error) {
          console.error('Speech recognition error:', error);
          toast.error('Could not start speech recognition');
        }
      } else {
        toast.error('Speech recognition not supported in this browser');
      }
    }
  };
  
  const handleCameraCapture = (imageData: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: "📷 [Image sent]",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setShowCamera(false);
    
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "I've received your image. Connect your backend to process resume images!",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <>
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center"
          size="icon"
        >
          <Bot size={28} className="text-white" />
        </Button>
      )}
      
      {isOpen && (
        <Card className={`fixed z-50 shadow-xl glossy-card animate-scale-in transition-all duration-300 ease-in-out ${
          isMinimized 
            ? 'bottom-6 right-6 h-auto w-auto p-0 rounded-full' 
            : 'bottom-6 right-6 w-[520px] max-w-[calc(100vw-2rem)] h-[700px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl overflow-hidden'
        }`}>
          {isMinimized ? (
            <Button
              onClick={toggleChat}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center"
              size="icon"
            >
              <Bot size={28} className="text-white" />
            </Button>
          ) : (
            <>
              <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center gap-2">
                  <Bot size={22} />
                  <h3 className="font-medium text-lg">Resume Assistant</h3>
                  <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                    AI
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleMinimize} 
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <MinusCircle size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleChat} 
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-background/80 to-background">
                {messages.map(message => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    formatTime={formatTime} 
                  />
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <ChatInput 
                input={input}
                setInput={setInput}
                handleSendMessage={handleSendMessage}
                isRecording={isRecording}
                toggleRecording={toggleRecording}
                isSending={isSending}
                onOpenCamera={() => setShowCamera(true)}
              />
            </>
          )}
        </Card>
      )}
      
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
};

export default Chatbot;
