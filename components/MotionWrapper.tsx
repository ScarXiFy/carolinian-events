'use client'

import { motion } from 'framer-motion'
import { staggerContainer } from '@/utils/motion'
import { ReactNode } from 'react'

export const MotionWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      className="container py-12"
      variants={staggerContainer(0.15, 0.3)}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}
