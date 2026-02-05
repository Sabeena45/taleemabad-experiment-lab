"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  show: boolean;
  levelTitle: string;
  onDismiss: () => void;
}

export default function CelebrationOverlay({ show, levelTitle, onDismiss }: Props) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    if (show) {
      const colors = ["#F59E0B", "#10B981", "#3B82F6", "#f4511e", "#0170b9"];
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);

      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={onDismiss}
        >
          {/* Confetti particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: "50vw",
                y: "50vh",
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: `${p.x}vw`,
                y: `${p.y}vh`,
                scale: [0, 1, 0.5],
                rotate: Math.random() * 720 - 360,
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: Math.random() * 0.3,
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: p.color }}
            />
          ))}

          {/* Success message */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="bg-surface rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
              Level Complete!
            </h2>
            <p className="text-text-secondary">
              <span className="font-semibold text-success">{levelTitle}</span> is done.
              Onward to the next level!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
