
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParsedResume } from '@/services/api';
import ResumeBasicInfo from './resume/ResumeBasicInfo';
import ResumeTabContent from './resume/ResumeTabContent';
import ResumeOverview from './resume/ResumeOverview';
import ResumeActions from './resume/ResumeActions';
import TabIcon from './resume/TabIcon';
import { IconName } from './IconProvider';

interface ResumeAnalyticsProps {
  resumeData: ParsedResume | null;
}

const ResumeAnalytics: React.FC<ResumeAnalyticsProps> = ({ resumeData }) => {
  const [activeTab, setActiveTab] = useState("skills");
  
  if (!resumeData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No resume data available</p>
      </div>
    );
  }

  // Function to determine if a section should be rendered
  const shouldRenderSection = (key: string) => {
    const value = resumeData[key as keyof ParsedResume];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    return value !== undefined && value !== null && value !== '';
  };

  // Determine which tabs to show based on available data
  const availableTabs = [
    { id: "skills", label: "Skills", available: shouldRenderSection('skills'), icon: "Trophy" as IconName },
    { id: "experience", label: "Experience", available: shouldRenderSection('experience'), icon: "Briefcase" as IconName },
    { id: "education", label: "Education", available: shouldRenderSection('education'), icon: "GraduationCap" as IconName },
    { id: "projects", label: "Projects", available: shouldRenderSection('projects'), icon: "FileText" as IconName },
    { id: "certifications", label: "Certifications", available: shouldRenderSection('certifications'), icon: "Check" as IconName },
    { id: "languages", label: "Languages", available: shouldRenderSection('languages'), icon: "Globe" as IconName },
    { id: "achievements", label: "Achievements", available: shouldRenderSection('achievements'), icon: "Trophy" as IconName },
  ].filter(tab => tab.available);

  return (
    <div className="space-y-6 w-full mx-auto animate-slide-in">
      {/* Header with basic info */}
      <Card className="p-6 glossy-card shadow-md">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <ResumeBasicInfo resumeData={resumeData} />
          
          {/* Profile summary */}
          {resumeData.summary && (
            <div className="max-w-lg">
              <h2 className="text-sm font-medium text-primary mb-2">Professional Summary</h2>
              <p className="text-sm leading-relaxed">{resumeData.summary}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs for different sections */}
      {availableTabs.length > 0 && (
        <Tabs defaultValue={availableTabs[0].id} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar p-1 mb-6 bg-background/50 backdrop-blur-sm rounded-lg shadow-sm">
            {availableTabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2.5 flex items-center gap-2 text-base"
              >
                <TabIcon name={tab.icon} />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Dynamic Tab Content */}
          {availableTabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              <ResumeTabContent tabId={tab.id} resumeData={resumeData} />
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      {/* Resume Overview section - moved below tabs */}
      <ResumeOverview resumeData={resumeData} />
      
      {/* Job Matches button - moved below overview */}
      <ResumeActions />
    </div>
  );
};

export default ResumeAnalytics;
