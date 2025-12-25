'use client'

import { about } from '@/data/about'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import Image from 'next/image'

const About = () => {
  const skills = about.skills

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  const skillVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  }

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-gray-900/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Image Column */}
          <motion.div
            variants={itemVariants}
            className="relative order-2 lg:order-1"
          >
            <div className="relative w-full max-w-lg mx-auto">
              {/* Neon soft glow behind */}
              <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(40%_40%_at_70%_20%,rgba(0,212,255,0.25),transparent),radial-gradient(40%_40%_at_40%_80%,rgba(179,71,217,0.25),transparent)] blur-2xl" />

              {/* Gradient ring + glass container */}
              <motion.div
                className="group relative aspect-[4/5] rounded-2xl p-[2px] bg-gradient-to-br from-neon-blue/60 via-neon-purple/50 to-neon-pink/60 shadow-[0_0_40px_rgba(0,212,255,0.15)]"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[calc(theme(borderRadius.2xl)-2px)] bg-white/5 backdrop-blur-xl ring-1 ring-white/10">
                  {/* Profile image - portrait ratio, prioritize face */}
                  <Image
                    src="/me.jpg"
                    alt="Portrait"
                    fill
                    sizes="(min-width: 1024px) 480px, (min-width: 640px) 90vw, 95vw"
                    className="h-full w-full object-cover object-[center_18%]"
                    draggable={false}
                    priority
                    quality={85}
                  />

                  {/* Sheen sweep on hover */}
                  <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-[120%] translate-x-[-20%] bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 transition duration-700 group-hover:translate-x-[20%] group-hover:opacity-30 [mask-image:linear-gradient(90deg,transparent,white,transparent)]" />

                  {/* Subtle inner ring */}
                  <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/10" />
                </div>
              </motion.div>

              {/* Floating decorations matching theme */}
              <motion.div
                className="absolute -top-6 -right-6 size-24 rounded-full bg-gradient-to-tr from-neon-purple to-neon-pink blur-xl opacity-70"
                animate={{ scale: [1, 1.16, 1], opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 size-20 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple blur-xl opacity-60"
                animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Corner badge removed by request */}
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            variants={itemVariants}
            className="space-y-8 order-1 lg:order-2"
          >
            <div>
              <motion.h2
                className="text-4xl lg:text-5xl font-bold font-poppins mb-6"
                variants={itemVariants}
              >
                About{' '}
                <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Me
                </span>
              </motion.h2>
              
              <motion.div
                className="space-y-4 text-gray-300 text-lg leading-relaxed"
                variants={itemVariants}
              >
                {about.summary.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </motion.div>
            </div>

            {/* Skills */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold mb-4 text-neon-blue">
                Skills & Technologies
              </h3>
              <motion.div
                className="flex flex-wrap gap-3"
                variants={containerVariants}
              >
                {skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    variants={skillVariants}
                    className="px-4 py-2 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/30 rounded-full text-sm font-medium glass hover:from-neon-blue/20 hover:to-neon-purple/20 transition-all duration-300 cursor-default"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                    }}
                    custom={index}
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            {/* CV Download Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                suppressHydrationWarning
                className="group relative px-8 py-4 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/50 rounded-full font-semibold text-white glass overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
                <span className="relative flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Resume
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default About