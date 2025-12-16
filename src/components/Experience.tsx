'use client'

import { experiences } from '@/data/experience'
import { motion } from 'framer-motion'
import { Briefcase, Calendar, GraduationCap, MapPin } from 'lucide-react'
import { useMotionPreference } from '../hooks/useMotionPreference'

const Experience = () => {
  const { reduceMotion } = useMotionPreference()
  // experiences are imported from shared data

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/20 to-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold font-poppins mb-6">
            Experience &{' '}
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Education
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            My journey through various roles and educational experiences that shaped my expertise
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="relative"
        >
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-blue via-neon-purple to-neon-pink hidden md:block" />

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative flex items-start"
              >
                {/* Timeline Dot */}
                <motion.div
                  className="hidden md:flex absolute left-6 w-4 h-4 bg-neon-blue rounded-full border-4 border-background z-10"
                  initial={reduceMotion ? { scale: 1 } : { scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={reduceMotion ? { duration: 0 } : { delay: 0.2, type: 'spring', stiffness: 200 }}
                  viewport={{ once: true }}
                />

                {/* Content Card */}
                <motion.div
                  className="w-full md:ml-16 glass rounded-2xl p-6 border border-gray-700/50 hover:border-neon-blue/50 transition-all duration-300"
                  whileHover={reduceMotion ? {} : { y: -5, boxShadow: '0 20px 40px rgba(0, 212, 255, 0.1)' }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      {exp.type === 'work' ? (
                        <div className="p-2 bg-neon-blue/10 rounded-lg">
                          <Briefcase className="w-5 h-5 text-neon-blue" />
                        </div>
                      ) : (
                        <div className="p-2 bg-neon-purple/10 rounded-lg">
                          <GraduationCap className="w-5 h-5 text-neon-purple" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-white">{exp.title}</h3>
                        <p className="text-neon-blue font-semibold">{exp.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-1">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {exp.period}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        {exp.location}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <ul className="space-y-2">
                      {exp.description.map((item, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-3 text-gray-300"
                          initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={reduceMotion ? { duration: 0 } : { delay: i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className="w-1.5 h-1.5 bg-neon-blue rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Technologies */}
                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    {exp.technologies.map((tech, i) => (
                      <motion.span
                        key={tech}
                        className="px-3 py-1 text-xs bg-gray-800/50 text-gray-300 rounded-full border border-gray-700/50 hover:border-neon-blue/30 transition-colors duration-300"
                        initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={reduceMotion ? { duration: 0 } : { delay: 0.1 * i, type: 'spring', stiffness: 200 }}
                        viewport={{ once: true }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Experience