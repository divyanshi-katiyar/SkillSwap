/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  delay?: number;
  id?: string;
  key?: React.Key;
}

export default function GlassCard({
  children,
  className = "",
  onClick,
  hoverEffect = false,
  delay = 0,
  id
}: GlassCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hoverEffect ? { y: -4, scale: 1.01 } : undefined}
      onClick={onClick}
      className={`
        bg-white/70 dark:bg-[#0F172A]/70 
        backdrop-blur-md 
        border border-white/40 dark:border-white/10 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] 
        rounded-2xl 
        p-6 
        transition-shadow duration-300
        ${hoverEffect ? "hover:shadow-[0_12px_40px_0_rgba(99,102,241,0.12)] cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
