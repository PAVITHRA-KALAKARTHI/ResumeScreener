import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import ParticleBackground from '@/components/ParticleBackground';

// Define the job interface
interface Job {
  id: number;
  title: string;
  matchScore: number;
  salary: string;
  description: string;
  skills: string[];
}

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [jobMatches, setJobMatches] = useState<Job[]>([]);

  useEffect(() => {
    // Fetch job matches from backend
    const fetchJobMatches = async () => {
      try {
        // Try to fetch from backend first
        try {
          const response = await fetch('http://localhost:5000/job-matches');
          if (response.ok) {
            const data = await response.json();
            setJobMatches(data);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.log("Backend not available, using demo data");
        }
        
        // If backend fetch fails, use demo data
        setTimeout(() => {
          setJobMatches([
            {
              id: 1,
              title: "Senior Frontend Developer",
              matchScore: 92,
              salary: "$120,000 - $150,000",
              description: "Looking for an experienced frontend developer proficient in React and TypeScript.",
              skills: ["React", "TypeScript", "UI/UX", "Tailwind CSS"]
            },
            {
              id: 2,
              title: "Full Stack Engineer",
              matchScore: 87,
              salary: "$110,000 - $140,000",
              description: "Join our team to build scalable web applications using modern technologies.",
              skills: ["React", "Node.js", "MongoDB", "Express"]
            },
            {
              id: 3,
              title: "UI/UX Developer",
              matchScore: 85,
              salary: "$105,000 - $130,000",
              description: "Create beautiful and functional user interfaces for our client projects.",
              skills: ["UI Design", "React", "Figma", "CSS"]
            },
            {
              id: 4,
              title: "Python Backend Developer",
              matchScore: 78,
              salary: "$115,000 - $140,000",
              description: "Develop robust backend systems with Python, Flask and SQLAlchemy.",
              skills: ["Python", "Flask", "SQL", "API Development"]
            },
            {
              id: 5,
              title: "Machine Learning Engineer",
              matchScore: 82,
              salary: "$130,000 - $160,000",
              description: "Build and deploy machine learning models for real-world applications.",
              skills: ["Python", "TensorFlow", "PyTorch", "Data Science"]
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching job matches:", error);
        toast.error("Failed to load job recommendations");
        setIsLoading(false);
      }
    };

    fetchJobMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50 dark:from-background dark:to-gray-900 relative overflow-x-hidden">
      <ParticleBackground />
      
      <div className="container mx-auto px-4 py-12">
        <header className="mb-8">
          <Button 
            onClick={() => navigate('/?showAnalytics=true')}
            variant="outline"
            className="mb-6 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resume
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight relative z-10 text-transparent bg-gradient-to-r from-primary to-purple-600 bg-clip-text">
            Job Recommendations
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Based on your resume, we've found these job matches for you
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {jobMatches.map((job) => (
                <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow glossy-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold">{job.title}</h2>
                      <a 
                        href={`https://in.best-jobs-online.com/serp/?position=${encodeURIComponent(job.title)}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Similar Jobs & details →
                      </a>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {Math.floor(Math.random() * (70 - 30 + 1)) + 30}% Match
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Salary Range</p>
                      <p className="text-green-600">{job.salary}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Key Skills</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Jobs;
