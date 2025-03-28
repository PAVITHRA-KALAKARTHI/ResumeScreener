
import React from 'react';
import { 
  Trophy, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Check, 
  Globe,
  Bot
} from 'lucide-react';

export type IconName = 
  | 'Trophy' 
  | 'Briefcase' 
  | 'GraduationCap' 
  | 'FileText' 
  | 'Check' 
  | 'Globe'
  | 'Bot';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

const IconProvider: React.FC<IconProps> = ({ name, size = 18, className }) => {
  const iconMap = {
    Trophy: <Trophy size={size} className={className} />,
    Briefcase: <Briefcase size={size} className={className} />,
    GraduationCap: <GraduationCap size={size} className={className} />,
    FileText: <FileText size={size} className={className} />,
    Check: <Check size={size} className={className} />,
    Globe: <Globe size={size} className={className} />,
    Bot: <Bot size={size} className={className} />
  };

  return iconMap[name] || null;
};

export default IconProvider;
