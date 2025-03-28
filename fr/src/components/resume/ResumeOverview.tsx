
import React from 'react';
import { Card } from '@/components/ui/card';
import { ParsedResume } from '@/services/api';
import { FileText, Award, Code, Briefcase, GraduationCap } from 'lucide-react';

interface ResumeOverviewProps {
  resumeData: ParsedResume;
}

const ResumeOverview: React.FC<ResumeOverviewProps> = ({ resumeData }) => {
  // Count items in different sections
  const skillsCount = resumeData.skills?.length || 0;
  const experienceCount = resumeData.experience?.length || 0;
  const educationCount = resumeData.education?.length || 0;
  const projectsCount = resumeData.projects?.length || 0;

  // Calculate the years of experience
  const calculateYearsOfExperience = () => {
    if (!resumeData.experience?.length) return 0;
    
    // This is a very simple calculation just for the overview
    // A more accurate calculation would need to parse the date strings
    return resumeData.experience.length > 1 ? resumeData.experience.length - 1 : 1;
  };

  const yearsOfExperience = calculateYearsOfExperience();

  return (
    <Card className="p-6 mt-6 glossy-card">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Resume Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
          <Code className="text-blue-500 mb-2" size={24} />
          <span className="text-2xl font-bold">{skillsCount}</span>
          <span className="text-sm text-gray-600">Skills</span>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
          <Briefcase className="text-green-500 mb-2" size={24} />
          <span className="text-2xl font-bold">{yearsOfExperience}+</span>
          <span className="text-sm text-gray-600">Years Experience</span>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
          <GraduationCap className="text-purple-500 mb-2" size={24} />
          <span className="text-2xl font-bold">{educationCount}</span>
          <span className="text-sm text-gray-600">Education</span>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg">
          <FileText className="text-yellow-500 mb-2" size={24} />
          <span className="text-2xl font-bold">{projectsCount}</span>
          <span className="text-sm text-gray-600">Projects</span>
        </div>
      </div>
      
      {resumeData.summary && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Professional Summary</h3>
          <p className="text-sm text-gray-700">{resumeData.summary}</p>
        </div>
      )}
    </Card>
  );
};

export default ResumeOverview;
