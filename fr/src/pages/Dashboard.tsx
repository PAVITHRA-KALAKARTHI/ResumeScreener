import React, { useEffect, useState } from 'react';
import { getParsedResumes } from '@/services/api';

interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
}
import { toast } from 'sonner';

interface Resume {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
}

const Dashboard: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await getParsedResumes();
        if (data.resumes && data.resumes.length > 0) {
          setResumes(
            data.resumes.map((resume: ParsedResume) => ({
              name: resume.name || 'N/A',
              email: resume.email || 'N/A',
              phone: resume.phone || 'N/A',
              location: resume.location || 'N/A',
              summary: resume.summary || 'N/A',
              skills: resume.skills || [],
            }))
          );
        } else {
          toast.error('No saved resumes found.');
        }
      } catch (error) {
        console.error('Error fetching resumes:', error);
        toast.error('Failed to load resumes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Saved Resumes</h1>
      {loading ? (
        <p>Loading resumes...</p>
      ) : resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume, index) => (
            <div key={index} className="p-4 border rounded shadow">
              <h2 className="text-xl font-semibold">{resume.name}</h2>
              <p><strong>Email:</strong> {resume.email}</p>
              <p><strong>Phone:</strong> {resume.phone}</p>
              <p><strong>Location:</strong> {resume.location}</p>
              <p><strong>Summary:</strong> {resume.summary}</p>
              <p><strong>Skills:</strong> {resume.skills.join(', ')}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No resumes available.</p>
      )}
    </div>
  );
};

export default Dashboard;