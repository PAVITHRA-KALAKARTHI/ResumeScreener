
import React, { useEffect, useState } from 'react';
import { Cpu, FileSearch, Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingAnimationProps {
  visible: boolean;
  onComplete: () => void;
}

const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({ visible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const steps = [
    { icon: FileSearch, label: 'OCR Processing', color: 'text-blue-500' },
    { icon: Cpu, label: 'Resume Analysis', color: 'text-purple-500' },
    { icon: Brain, label: 'AI Evaluation', color: 'text-emerald-500' }
  ];
  
  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }
    
    // Reset at start
    setCurrentStep(0);
    setProgress(0);
    
    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.5;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 20);
    
    // Step animations
    let currentStepIndex = 0;
    const stepDuration = 1300; // Each step takes ~1.3 seconds
    
    const stepInterval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setCurrentStep(currentStepIndex);
        currentStepIndex++;
      } else {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
        
        // Small delay before completing
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, stepDuration);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [visible, steps.length, onComplete]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-6 border border-border/50">
        <h3 className="text-xl font-medium text-center mb-8">Processing Resumes</h3>
        
        <div className="flex justify-around mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="icon-container">
                  <Icon
                    size={28}
                    className={`process-icon ${step.color} transition-all duration-300 ${
                      isActive ? 'scale-110 animate-pulse-glow' : 
                      isCompleted ? 'opacity-100' : 'opacity-40'
                    }`}
                  />
                  {isActive && (
                    <div 
                      className={`glow-bg animate-glow-pulse`}
                      style={{ 
                        backgroundColor: `var(--glow-color)`,
                        boxShadow: `0 0 15px var(--glow-color)`
                      }}
                    />
                  )}
                </div>
                <span className={`text-sm ${isActive || isCompleted ? step.color : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        
        <Progress value={progress} className="h-2 progress-glow" />
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          {progress < 100 ? 'Please wait while we analyze your resumes...' : 'Analysis complete!'}
        </p>
      </div>
    </div>
  );
};

export default ProcessingAnimation;
