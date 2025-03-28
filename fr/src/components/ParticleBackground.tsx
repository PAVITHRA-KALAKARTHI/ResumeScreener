import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  hue: number;
  duration: number;
  opacity: number;
  type: 'circle' | 'star' | 'square';
}

const ParticleBackground: React.FC = () => {
  const particlesRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const particlesContainer = particlesRef.current;
    const particles: HTMLDivElement[] = [];
    const particleCount = 50; // Increased particle count
    
    // Create particles
    const createParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
          if (!particlesContainer) return;
          
          const particle = document.createElement('div');
          particle.classList.add('particle');
          
          // Random properties
          const size = Math.random() * 100 + 50;
          const x = Math.random() * (window.innerWidth - size);
          const y = Math.random() * (window.innerHeight - size) + window.innerHeight * 0.5;
          const speedX = Math.random() * 0.8 - 0.4;
          const speedY = -Math.random() * 0.8 - 0.5;
          const duration = Math.random() * 25 + 15;
          const delay = Math.random() * 10;
          
          // Randomly select particle type and color scheme
          const types = ['circle', 'star', 'square', 'circle', 'circle']; // More circles than other shapes
          const type = types[Math.floor(Math.random() * types.length)];
          
          let hue = 0;
          
          // 50% chance for blue hues, 25% for purple, 25% for teal
          const colorRand = Math.random();
          if (colorRand < 0.5) {
            hue = Math.random() * 30 + 210; // Blue hues
          } else if (colorRand < 0.75) {
            hue = Math.random() * 40 + 270; // Purple hues
          } else {
            hue = Math.random() * 30 + 180; // Teal hues
          }
          
          // Apply styles
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.left = `${x}px`;
          particle.style.bottom = `${y}px`;
          
          // Different styling based on type
          if (type === 'circle') {
            particle.style.background = `radial-gradient(circle at center, hsla(${hue}, 100%, 70%, 0.5), transparent 70%)`;
            
            // 40% chance to add glow effect
            if (Math.random() < 0.4) {
              particle.classList.add('particle-glow');
            }
            
            // Use standard float animation
            particle.style.animation = `float-particle ${duration}s ease-in-out infinite`;
          } 
          else if (type === 'star') {
            particle.classList.add('particle-star');
            particle.style.background = `radial-gradient(circle at center, hsla(${hue}, 100%, 75%, 0.6), transparent 70%)`;
            
            // Stars use rotating animation
            particle.style.animation = `float-rotate ${duration}s ease-in-out infinite`;
          }
          else if (type === 'square') {
            particle.classList.add('particle-square');
            particle.style.background = `radial-gradient(circle at center, hsla(${hue}, 90%, 65%, 0.4), transparent 70%)`;
            
            // Squares use pulsing animation
            const pulseAnimation = `float-particle ${duration}s ease-in-out infinite, pulse-size ${Math.random() * 4 + 3}s ease-in-out infinite`;
            particle.style.animation = pulseAnimation;
          }
          
          particle.style.animationDelay = `${delay}s`;
          
          particlesContainer.appendChild(particle);
          particles.push(particle);
          
          // Remove particle after some time to prevent memory leaks
          setTimeout(() => {
            if (particlesContainer.contains(particle)) {
              particlesContainer.removeChild(particle);
              const index = particles.indexOf(particle);
              if (index > -1) {
                particles.splice(index, 1);
              }
            }
          }, duration * 1000 + delay * 1000);
        }, i * 80);
      }
    };
    
    createParticles();
    
    // Add particles periodically
    const interval = setInterval(createParticles, 6000);
    
    // Add a few special large particles that move very slowly (for background depth)
    const createBackgroundParticles = () => {
      for (let i = 0; i < 8; i++) {
        if (!particlesContainer) return;
        
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Large slow-moving particles
        const size = Math.random() * 250 + 150;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const duration = Math.random() * 40 + 30; // Very slow
        const hue = Math.random() * 20 + 210; // Blue hues
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.background = `radial-gradient(circle at center, hsla(${hue}, 80%, 75%, 0.15), transparent 80%)`;
        particle.style.animation = `float-particle ${duration}s ease-in-out infinite`;
        particle.style.opacity = '0.2';
        particle.style.zIndex = '-2'; // Behind other particles
        
        particlesContainer.appendChild(particle);
        particles.push(particle);
      }
    };
    
    createBackgroundParticles();
    
    return () => {
      clearInterval(interval);
      particles.forEach(particle => {
        if (particlesContainer.contains(particle)) {
          particlesContainer.removeChild(particle);
        }
      });
    };
  }, []);

  // Add cursor glow effect
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    document.body.appendChild(cursor);

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (document.body.contains(cursor)) {
        document.body.removeChild(cursor);
      }
    };
  }, []);
  
  return <div ref={particlesRef} className="particles" />;
};

export default ParticleBackground;
