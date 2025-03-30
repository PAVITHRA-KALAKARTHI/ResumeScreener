import React from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';
import { ParsedResume } from '@/services/api';

// Add this custom LeetCode icon component at the top of the file
const LeetCodeIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="20" 
    height="20" 
    fill="currentColor"
  >
    <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.039-1.901l-2.609-2.636a5.055 5.055 0 0 0-2.445-1.337l2.467-2.503c.516-.514.498-1.366-.037-1.901-.535-.535-1.387-.552-1.902-.038l-10.1 10.101c-.981.982-1.494 2.337-1.494 3.835 0 1.498.513 2.895 1.494 3.875l4.347 4.361c.981.981 2.337 1.494 3.834 1.494 1.498 0 2.853-.513 3.835-1.494l2.609-2.637c.514-.514.496-1.365-.039-1.9s-1.386-.553-1.899-.039zM20.811 13.01H10.666c-.702 0-1.27.604-1.27 1.346s.568 1.346 1.27 1.346h10.145c.701 0 1.27-.604 1.27-1.346s-.569-1.346-1.27-1.346z" />
  </svg>
);

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
            <a 
              href={resumeData.social.linkedin.startsWith('http') 
                ? resumeData.social.linkedin 
                : `https:/${resumeData.social.linkedin}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Linkedin size={20} />
            </a>
          )}
          
          {/* Add the LeetCode icon and link */}
          {resumeData.social.leetcode && (
            <a 
              href={resumeData.social.leetcode.startsWith('http') 
                ? resumeData.social.leetcode 
                : `https:/${resumeData.social.leetcode}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#FFA116] hover:text-[#E69200] transition-colors"
            >
              <LeetCodeIcon />
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
