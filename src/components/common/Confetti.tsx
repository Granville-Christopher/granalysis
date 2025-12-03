import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
  colors?: string[];
}

export const Confetti: React.FC<ConfettiProps> = ({
  trigger,
  duration = 3000,
  colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    angle: number;
    velocity: number;
  }>>([]);

  useEffect(() => {
    if (!trigger) {
      setParticles([]);
      return;
    }

    // Create confetti particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * 360,
      velocity: 2 + Math.random() * 3,
    }));

    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.velocity,
            x: p.x + Math.sin((p.angle * Math.PI) / 180) * 0.5,
            angle: p.angle + 2,
          }))
          .filter((p) => p.y < 110)
      );
    }, 16);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setParticles([]);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [trigger, duration, colors]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.angle}deg)`,
            transition: 'all 0.1s linear',
          }}
        />
      ))}
    </div>
  );
};

