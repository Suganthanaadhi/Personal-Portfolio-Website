'use client'

import { projects } from '@/data/projects'
import { motion } from 'framer-motion'
import { ExternalLink, Eye, Github } from 'lucide-react'
import { useMotionPreference } from '../hooks/useMotionPreference'

const Projects = () => {
  const { reduceMotion } = useMotionPreference()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const projectVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-gray-900/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold font-poppins mb-6">
            Featured{' '}
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            A collection of projects that showcase my skills and passion for creating innovative solutions
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={projectVariants}
              className="group relative"
            >
              <motion.div
                className="relative bg-gray-900/50 rounded-2xl overflow-hidden glass border border-gray-700/50 hover:border-neon-blue/50 transition-all duration-300"
                whileHover={reduceMotion ? {} : { y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Project Image */}
                <div className="relative aspect-video overflow-hidden">
                  {/* Placeholder for project image */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Eye className="w-12 h-12 text-gray-600" />
                    <span className="absolute bottom-2 right-2 text-xs text-gray-500 bg-black/50 px-2 py-1 rounded">
                      Project Screenshot
                    </span>
                  </div>
                  
                  {/* Overlay on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  >
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-3 justify-center">
                        <motion.a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                          whileHover={reduceMotion ? {} : { scale: 1.1 }}
                          whileTap={reduceMotion ? {} : { scale: 0.9 }}
                        >
                          <Github className="w-5 h-5 text-white" />
                        </motion.a>
                        <motion.a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-neon-blue/20 backdrop-blur-sm rounded-full hover:bg-neon-blue/30 transition-colors"
                          whileHover={reduceMotion ? {} : { scale: 1.1 }}
                          whileTap={reduceMotion ? {} : { scale: 0.9 }}
                        >
                          <ExternalLink className="w-5 h-5 text-neon-blue" />
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Project Content */}
                <div className="p-6">
                  {/* Category Badge */}
                    <motion.span
                    className="inline-block px-3 py-1 text-xs font-semibold bg-neon-blue/10 text-neon-blue rounded-full mb-3"
                      initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={reduceMotion ? { duration: 0 } : { delay: 0.2 }}
                  >
                    {project.category}
                  </motion.span>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-neon-blue transition-colors duration-300">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, index) => (
                      <motion.span
                        key={tech}
                        className="px-2 py-1 text-xs bg-gray-800/50 text-gray-300 rounded border border-gray-700/50"
                        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={reduceMotion ? { duration: 0 } : { delay: index * 0.1 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-300"
                      whileHover={reduceMotion ? {} : { scale: 1.02 }}
                      whileTap={reduceMotion ? {} : { scale: 0.98 }}
                    >
                      <Github className="w-4 h-4" />
                      Code
                    </motion.a>
                    
                    <motion.a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 hover:border-neon-blue/50 rounded-lg text-sm text-neon-blue hover:text-white transition-all duration-300"
                      whileHover={reduceMotion ? {} : { scale: 1.02 }}
                      whileTap={reduceMotion ? {} : { scale: 0.98 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </motion.a>
                  </div>
                </div>

                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0, 212, 255, 0.3) 0%, transparent 70%)',
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* View More Button */}
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.3 }}
          className="text-center mt-12"
        >
          <motion.button
            suppressHydrationWarning
            className="px-8 py-4 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/50 hover:border-neon-blue/50 rounded-full font-semibold text-white glass hover:from-neon-purple/30 hover:to-neon-blue/30 transition-all duration-300"
            whileHover={reduceMotion ? {} : { scale: 1.05 }}
            whileTap={reduceMotion ? {} : { scale: 0.95 }}
          >
            View All Projects
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default Projects