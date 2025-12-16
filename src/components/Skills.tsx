'use client'

import { motion } from 'framer-motion'
import {
  Cloud,
  Code,
  Database,
  GitBranch,
  Globe,
  Palette,
  Zap
} from 'lucide-react'
import { skillsSummary } from '../data/skills'
import { useMotionPreference } from '../hooks/useMotionPreference'

const Skills = () => {
  const { reduceMotion } = useMotionPreference()
  // Map imported skills summary to UI cards, provide defaults for icon, color and description
  const iconMap: Record<string, any> = {
    Languages: Code,
    Frontend: Code,
    Backend: Database,
    Database: Database,
    'ML/Data Libraries': Zap,
    'Data Visualization Tools': Palette,
    'UI/UX Tools': Palette,
    'Creative Tools': Cloud,
    'Version Control & IDEs': GitBranch,
    'Core Concepts': Globe,
    'Prompt Engineering': Zap,
  }

  const colorMap: Record<string, string> = {
    Languages: 'from-blue-500 to-cyan-500',
    Frontend: 'from-blue-500 to-cyan-500',
    Backend: 'from-green-500 to-emerald-500',
    Database: 'from-emerald-500 to-green-500',
    'ML/Data Libraries': 'from-yellow-500 to-orange-500',
    'Data Visualization Tools': 'from-purple-500 to-pink-500',
    'UI/UX Tools': 'from-purple-500 to-pink-500',
    'Creative Tools': 'from-indigo-500 to-purple-500',
    'Version Control & IDEs': 'from-gray-500 to-gray-700',
    'Core Concepts': 'from-orange-500 to-red-500',
    'Prompt Engineering': 'from-pink-500 to-violet-500',
  }

  const descMap: Record<string, string> = {
    Languages: 'Primary programming languages',
    Frontend: 'Building responsive and interactive user interfaces',
    Backend: 'Server-side frameworks and Java backend technologies',
    Database: 'Schema design, optimization and query tuning',
    'ML/Data Libraries': 'Data processing, visualization and ML model building',
    'Data Visualization Tools': 'Creating dashboards and visual insights',
    'UI/UX Tools': 'Designing user interfaces and experiences',
    'Creative Tools': 'Video editing and 3D modeling',
    'Version Control & IDEs': 'Code workflow and editor tooling',
    'Core Concepts': 'Architectural and foundational software concepts',
    'Prompt Engineering': 'Designing effective prompts and strategies for LLMs and generative AI',
  }

  const skillCategories = skillsSummary.map((cat) => ({
    icon: iconMap[cat.title] ?? Code,
    title: cat.title,
    skills: cat.skills,
    level: cat.level ?? 80,
    color: colorMap[cat.title] ?? 'from-blue-500 to-cyan-500',
    description: descMap[cat.title] ?? '',
  }))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
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
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/20 to-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold font-poppins mb-6">
            My{' '}
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Skills
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            A comprehensive overview of my technical expertise and the tools I use to bring ideas to life
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {skillCategories.map((category, index) => {
            const IconComponent = category.icon
            
            return (
                <motion.div
                key={category.title}
                variants={cardVariants}
                className="group relative"
              >
                {/* Card */}
                <motion.div
                  className="relative h-full p-6 glass rounded-2xl border border-gray-700/50 hover:border-neon-blue/50 transition-all duration-300 overflow-hidden"
                  whileHover={reduceMotion ? {} : { y: -5, transition: { duration: 0.2 } }}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <motion.div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} p-2.5 mb-4 shadow-lg`}
                    whileHover={reduceMotion ? {} : { scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconComponent className="w-full h-full text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-neon-blue transition-colors duration-300">
                    {category.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Skills List */}
                  <div className="space-y-2 mb-4">
                    {category.skills.map((skill, skillIndex) => (
                      <motion.div
                        key={skill}
                        className="flex items-center gap-2"
                        initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={reduceMotion ? { duration: 0 } : { delay: skillIndex * 0.1 }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                        <span className="text-gray-300 text-sm">{skill}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Proficiency</span>
                      <span className="text-xs text-neon-blue font-semibold">{category.level}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${category.color} rounded-full relative`}
                        initial={reduceMotion ? { width: `${category.level}%` } : { width: 0 }}
                        whileInView={{ width: `${category.level}%` }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 1, delay: 0.2, ease: 'easeOut' }}
                        viewport={{ once: true }}
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={reduceMotion ? { opacity: 0.2 } : { x: ['-100%', '100%'] }}
                          transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-neon-blue opacity-0 group-hover:opacity-50"
                    initial={false}
                    animate={{ 
                      opacity: 0,
                      scale: 1,
                    }}
                    whileHover={{ 
                      opacity: 0.3,
                      scale: 1.02,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default Skills