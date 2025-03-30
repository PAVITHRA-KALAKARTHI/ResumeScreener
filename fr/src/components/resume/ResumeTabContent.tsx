import React from 'react';
import { Card } from '@/components/ui/card';
import { ParsedResume } from '@/services/api';
import SkillsTab from './tabs/SkillsTab';
import ExperienceTab from './tabs/ExperienceTab';
import EducationTab from './tabs/EducationTab';
import ProjectsTab from './tabs/ProjectsTab';
import CertificationsTab from './tabs/CertificationsTab';
import LanguagesTab from './tabs/LanguagesTab';
import AchievementsTab from './tabs/AchievementsTab';

interface ResumeTabContentProps {
  tabId: string;
  resumeData: ParsedResume;
}

const ResumeTabContent: React.FC<ResumeTabContentProps> = ({ tabId, resumeData }) => {
  const shouldRenderSection = (key: string) => {
    const value = resumeData[key as keyof ParsedResume];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    return value !== undefined && value !== null && value !== '';
  };

  // Map tabId to appropriate component
  const renderTabContent = () => {
    switch (tabId) {
      case "skills":
        return shouldRenderSection('skills') ? <SkillsTab skills={resumeData.skills || []} /> : <EmptyTabContent />;
      case "experience":
        return shouldRenderSection('experience') ? (
          <ExperienceTab
            experience={(resumeData.experience || []).map(exp => ({
              title: exp.title || 'Untitled',
              company: exp.company || '',
              date: exp.date || '',
              description: exp.description || '',
            }))}
          />
        ) : (
          <EmptyTabContent />
        );
      case "education":
        return shouldRenderSection('education') ? (
          <EducationTab
            education={(resumeData.education || []).map(edu => ({
              degree: edu.degree || 'Unknown Degree',
              institution: edu.institution || '',
              date: edu.date || '',
              gpa: edu.gpa || '',
            }))}
          />
        ) : (
          <EmptyTabContent />
        );
      case "projects":
        return shouldRenderSection('projects') ? (
          <ProjectsTab
            projects={(resumeData.projects || []).map(project => ({
              name: project.name || 'Untitled Project',
              description: project.description || '',
              technologies: project.technologies || [],
            }))}
          />
        ) : (
          <EmptyTabContent />
        );
      case "certifications":
        return shouldRenderSection('certifications') ? <CertificationsTab certifications={resumeData.certifications || []} /> : <EmptyTabContent />;
      case "languages":
        return shouldRenderSection('languages') ? <LanguagesTab languages={resumeData.languages || []} /> : <EmptyTabContent />;
      case "achievements":
        return shouldRenderSection('achievements') ? <AchievementsTab achievements={resumeData.achievements || []} /> : <EmptyTabContent />;
      default:
        return <EmptyTabContent />;
    }
  };

  return renderTabContent();
};

// Component for empty tab content
const EmptyTabContent: React.FC = () => (
  <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
    <p className="text-gray-500">No data available for this section</p>
  </div>
);

export default ResumeTabContent;
