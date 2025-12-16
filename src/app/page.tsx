import dynamic from 'next/dynamic'
import BackToTop from '../components/BackToTop'
import Hero from '../components/Hero'
import Navigation from '../components/Navigation'

const About = dynamic(() => import('../components/About'), { ssr: true })
const Skills = dynamic(() => import('../components/Skills'), { loading: () => <div className="h-24" aria-hidden /> })
const Projects = dynamic(() => import('../components/Projects'), { loading: () => <div className="h-32" aria-hidden /> })
const Experience = dynamic(() => import('../components/Experience'), { loading: () => <div className="h-24" aria-hidden /> })
const Achievements = dynamic(() => import('../components/Achievements'), { loading: () => <div className="h-32" aria-hidden /> })
const Contact = dynamic(() => import('../components/Contact'), { loading: () => <div className="h-48" aria-hidden /> })

export default function Home() {
  return (
    <>
    <main className="relative" suppressHydrationWarning>
      <Navigation />
      
      <section id="home" className="scroll-mt-24 md:scroll-mt-28">
        <Hero />
      </section>
      
      <section id="about" className="scroll-mt-24 md:scroll-mt-28">
        <About />
      </section>
      
      <section id="skills" className="scroll-mt-24 md:scroll-mt-28">
        <Skills />
      </section>
      
      <section id="projects" className="scroll-mt-24 md:scroll-mt-28">
        <Projects />
      </section>
      
      <section id="experience" className="scroll-mt-24 md:scroll-mt-28">
        <Experience />
      </section>

      <section id="achievements" className="scroll-mt-24 md:scroll-mt-28">
        <Achievements />
      </section>
      
      <section id="contact" className="scroll-mt-24 md:scroll-mt-28">
        <Contact />
      </section>
    </main>
    <BackToTop threshold={500} />
    </>
  )
}