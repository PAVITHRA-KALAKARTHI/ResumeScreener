
import React from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';
import { ParsedResume } from '@/services/api';

interface ResumeBasicInfoProps {
  resumeData: ParsedResume;
}

const ResumeBasicInfo: React.FC<ResumeBasicInfoProps> = ({ resumeData }) => {
  return (
    <div className="space-y-3">
      {resumeData.name && (
        <h1 className="text-2xl font-bold tracking-tight">{resumeData.name}</h1>
      )}
      
      <div className="flex flex-wrap gap-4 mt-2">
        {resumeData.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Mail size={16} className="text-primary" />
            <span>{resumeData.email}</span>
          </div>
        )}
        
        {resumeData.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Phone size={16} className="text-primary" />
            <span>{resumeData.phone}</span>
          </div>
        )}
        
        {resumeData.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <MapPin size={16} className="text-primary" />
            <span>{resumeData.location}</span>
          </div>
        )}
      </div>
      
      {resumeData.social && (
        <div className="flex gap-4 mt-2">
          {resumeData.social.linkedin && (
            <a href={resumeData.social.linkedin} target="_blank" rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 transition-colors">
              <Linkedin size={20} />
            </a>
          )}
          
          {resumeData.social.github && (
            <a href={resumeData.social.github} target="_blank" rel="noopener noreferrer" 
                className="text-gray-800 hover:text-black transition-colors">
              <Github size={20} />
            </a>
          )}
          
          {resumeData.social.twitter && (
            <a href={resumeData.social.twitter} target="_blank" rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-600 transition-colors">
              <Twitter size={20} />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeBasicInfo;
