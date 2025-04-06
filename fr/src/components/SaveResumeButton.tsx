import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { SaveIcon } from 'lucide-react';
import { ParsedResume } from '@/services/api';

interface SaveResumeButtonProps {
  resumeData: ParsedResume;
}

const SaveResumeButton: React.FC<SaveResumeButtonProps> = ({ resumeData }) => {
  const [isSaving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save resumes",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('http://localhost:5000/api/save-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume_data: {
            ...resumeData,
            saved_at: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save resume');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: "Resume saved successfully",
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to save resume',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving}
      variant="default"
      size="sm"
      className="flex items-center gap-2"
    >
      <SaveIcon className="h-4 w-4" />
      {isSaving ? 'Saving...' : 'Save Resume'}
    </Button>
  );
};

export default SaveResumeButton;