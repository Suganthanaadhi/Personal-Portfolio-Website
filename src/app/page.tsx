import dynamic from 'next/dynamic'
import BackToTop from '../components/BackToTop'
import Hero from '../components/Hero'
import Navigation from '../components/Navigation'

// Lazy load below-the-fold components with smaller loading placeholders
const About = dynamic(() => import('../components/About'), { 
  ssr: true,
  loading: () => <div className="h-96 bg-gradient-to-b from-background/50 to-transparent" aria-hidden />
})
const Skills = dynamic(() => import('../components/Skills'), { 
  loading: () => <div className="h-40 bg-background/50" aria-hidden /> 
})
const Projects = dynamic(() => import('../components/Projects'), { 
  loading: () => <div className="h-96 bg-background/50" aria-hidden /> 
})
const Experience = dynamic(() => import('../components/Experience'), { 
  loading: () => <div className="h-40 bg-background/50" aria-hidden /> 
})
const Achievements = dynamic(() => import('../components/Achievements'), { 
  loading: () => <div className="h-96 bg-background/50" aria-hidden /> 
})
const Contact = dynamic(() => import('../components/Contact'), { 
  loading: () => <div className="h-screen bg-background/50" aria-hidden /> 
})

export default function Home() {
  return (
    <>
    <main className="relative" suppressHydrationWarning>
      <Navigation />
      
      <section id="home" className="scroll-mt-20">
        <Hero />
      </section>
      
      <section id="about" className="scroll-mt-20">
        <About />
      </section>
      
      <section id="skills" className="scroll-mt-20">
        <Skills />
      </section>
      
      <section id="projects" className="scroll-mt-20">
        <Projects />
      </section>
      
      <section id="experience" className="scroll-mt-20">
        <Experience />
      </section>

      <section id="achievements" className="scroll-mt-20">
        <Achievements />
      </section>
      
      <section id="contact" className="scroll-mt-20">
        <Contact />
      </section>
    </main>
    <BackToTop threshold={500} />
    </>
  )
}
