"use client"
import { achievements } from '@/data/achievements'
import { motion } from 'framer-motion'
import { Award, ExternalLink, Star, Trophy } from 'lucide-react'

const Achievements = () => {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }
  const item = {
    hidden: { opacity: 0, y: 32, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: 'easeOut' } }
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" id="achievements">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-poppins bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent mb-6">
            Achievements
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A curated selection of milestones, awards, contributions, and recognitions that highlight growth, craftsmanship, and impact.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {achievements.map((a, i) => {
            const Icon = a.highlight ? Trophy : Award
            return (
              <motion.div
                key={a.id}
                variants={item}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl p-6 overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_70%)]" />
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 group-hover:from-neon-purple/30 group-hover:to-neon-pink/30 transition-colors duration-500">
                    <Icon className="w-6 h-6 text-neon-blue group-hover:text-neon-pink transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {a.title}
                      {a.highlight && <Star className="w-4 h-4 text-neon-pink" />}
                    </h3>
                    <div className="text-xs uppercase tracking-wide text-neon-blue/70 font-medium mt-1 flex flex-wrap gap-2">
                      {a.year && <span>{a.year}</span>}
                      {a.organization && <span className="text-gray-500">• {a.organization}</span>}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  {a.description}
                </p>
                {a.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {a.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-gray-700/40 text-gray-300 border border-gray-600/40 group-hover:border-neon-purple/40 group-hover:text-white transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  {a.link ? (
                    <a
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-neon-blue hover:text-neon-pink transition-colors"
                    >
                      View More <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : <span className="text-xs text-gray-500">—</span>}
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-tr from-neon-blue/10 via-neon-purple/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default Achievements