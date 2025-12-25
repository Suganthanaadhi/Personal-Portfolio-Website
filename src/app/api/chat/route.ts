import { about } from '@/data/about'
import { contact } from '@/data/contact'
import { experiences } from '@/data/experience'
import { projects } from '@/data/projects'
import { skillsSummary } from '@/data/skills'
import { NextResponse } from 'next/server'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const messages = (body?.messages ?? []) as ChatMessage[]
    const userText = messages.filter(m => m.role === 'user').pop()?.content?.trim() || ''

    // Helpers
    const isGreeting = (t: string) => /^(hi|hii+|hello|hey|hiya|yo|hola|namaste|bonjour|hallo|sup|good\s+(morning|afternoon|evening))\b/i.test(t)
    const fallbackReply = () => {
      if (!userText) {
        return 'Hi! I’m your portfolio assistant. Ask me about projects, skills, or how to contact you. Try: "show projects".'
      }
      if (isGreeting(userText)) {
        return 'Hey! I’m here—want me to jump to a section? Try “show projects”, “go to skills”, or “scroll to contact”.'
      }
      const t = userText.toLowerCase()
      const keyify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')
      const techKeyMap: Record<string, string> = {
        js: 'javascript', javascript: 'javascript', 'reactjs': 'react', react: 'react',
        next: 'nextjs', 'nextjs': 'nextjs', 'next.js': 'nextjs',
        ts: 'typescript', typescript: 'typescript',
        tailwind: 'tailwindcss', 'tailwind css': 'tailwindcss', tailwindcss: 'tailwindcss',
        node: 'nodejs', 'node.js': 'nodejs', nodejs: 'nodejs',
        postgres: 'postgresql', postgresql: 'postgresql',
        mongo: 'mongodb', 'mongo db': 'mongodb', mongodb: 'mongodb',
        python: 'python', flask: 'flask', django: 'django',
        aws: 'aws', docker: 'docker', kubernetes: 'kubernetes',
        stripe: 'stripe', socketio: 'socketio', 'socket.io': 'socketio',
        streamlit: 'streamlit', pandas: 'pandas', plotly: 'plotly',
        nlp: 'nlp', 'machinelearning': 'ml', ml: 'ml',
      }
      const normalizeTech = (name: string) => techKeyMap[keyify(name)] || keyify(name)
      const projMatchesTech = (pTechs: string[], tech: string) => {
        const n = normalizeTech(tech)
        return pTechs.some(pt => normalizeTech(pt) === n)
      }
      // Contact/location
      if (/contact|email|reach|phone|call|number/.test(t)) {
        return `Contact: ${contact.email} | ${contact.phone}. Location: ${contact.location}. Say "scroll to contact" and I’ll take you there.`
      }

      // Hiring / value proposition
      if (/(why.*hire.*you|why.*you|why should i hire you|why hire you|what.*make.*you.*(good|fit)|why.*fit)/.test(t)) {
        const topProjects = projects.slice(0,2).map(p => p.title).join(', ')
        const topSkills = skillsSummary.slice(0,3).flatMap(s => s.skills.slice(0,2)).slice(0,6).join(', ')
        const recentRole = experiences.find(e => e.type === 'work')
        const roleLine = recentRole ? `${recentRole.title} @ ${recentRole.company}` : 'Full‑stack developer'
        return `I deliver quickly with clean, modern code and a strong design sense.

• Proven experience: ${roleLine}
• Projects: ${topProjects}
• Stack: ${topSkills}

I’m pragmatic, communicative, and focused on business outcomes—shipping features that look great and perform well. Want details? Say "show projects" or "what stack do you use?"`
      }

      // About/summary
      if (/about|bio|summary|who\s+are\s+you|what\s+do\s+you\s+do/.test(t)) {
        const s = about.summary[0]
        return `${s} Key skills include ${about.skills.slice(0,6).join(', ')}. Ask "go to about" to read more.`
      }

      // Experience/companies/roles/education
      if (/experience|work|role|company|education|degree|university|college/.test(t)) {
        const roles = experiences.filter(e => e.type === 'work').slice(0,3).map(e => `• ${e.title} @ ${e.company} (${e.period})`).join('\n')
        const edu = experiences.filter(e => e.type === 'education').slice(0,2).map(e => `• ${e.title} — ${e.company}`).join('\n')
        return `Recent roles:\n${roles}\n\nEducation:\n${edu}`
      }

      // Try to match a specific project by title keywords
      const matchByProject = (() => {
        const words = t.split(/[^a-z0-9+#.]+/).filter(w => w.length >= 3)
        const proj = projects.find(p => {
          const titleWords = p.title.toLowerCase().split(/[^a-z0-9+#.]+/)
          return titleWords.some(w => w.length >= 3 && words.includes(w))
        })
        return proj
      })()
      if (matchByProject) {
        const p = matchByProject
        return `${p.title}: ${p.description}\n\nTech: ${p.technologies.join(', ')}\nLive: ${p.live}\nCode: ${p.github}`
      }
      // Try to match technologies mentioned
      const allTech = Array.from(new Set([
        ...projects.flatMap(p => p.technologies.map(t => t.toLowerCase())),
        ...skillsSummary.flatMap(s => s.skills.map(x => x.toLowerCase())),
      ]))
      const mentioned = allTech.filter(k => t.includes(k))
      if (mentioned.length) {
        return `You mentioned ${mentioned.slice(0,5).join(', ')}. I use these across projects and skills. Say "show projects" or "go to skills" to see more.`
      }
      // Projects filtered by technology (e.g., "projects using next.js")
      if (/(project|work|built|using|with).*\b(next|react|typescript|tailwind|node|python|stripe|mongodb|postgres|postgresql|socket|streamlit|pandas|plotly|nlp|ml)\b/.test(t)) {
        const tokens = Array.from(new Set(t.split(/[^a-z0-9.+#]+/).filter(Boolean)))
        const wanted = tokens.filter(tok => normalizeTech(tok) !== keyify(tok) || allTech.includes(tok))
        const filtered = projects.filter(p => wanted.every(w => projMatchesTech(p.technologies, w)))
        if (filtered.length) {
          const lines = filtered.slice(0,6).map(p => `• ${p.title} — ${p.description} (Tech: ${p.technologies.join(', ')})`).join('\n')
          return `Projects matching ${wanted.join(', ')}:\n${lines}${filtered.length > 6 ? `\n…and ${filtered.length-6} more.` : ''}`
        }
      }
      // How many projects
      if (/(how many|count|number of)\s+projects?/.test(t)) {
        return `I currently showcase ${projects.length} projects: ${projects.map(p => p.title).join(', ')}.`
      }
      // List all projects
      if (/list (all )?projects|show (all )?projects/.test(t)) {
        return projects.map(p => `• ${p.title} — ${p.description}`).join('\n')
      }
      // Latest/recent project
      if (/latest|most recent|new(est)?\s+project/.test(t)) {
        const p = projects[projects.length - 1]
        return p ? `Latest project: ${p.title} — ${p.description}\nTech: ${p.technologies.join(', ')}\nLive: ${p.live}\nCode: ${p.github}` : 'No projects listed.'
      }
      // Portfolio stack / this site tech
      if (/(this (site|portfolio)|portfolio website).*built|stack|tech stack|what do you use\??/.test(t)) {
        // Use the "Portfolio Website" project if present
        const site = projects.find(p => keyify(p.title).includes('portfoliowebsite'))
        const techs = site?.technologies ?? Array.from(new Set(skillsSummary.flatMap(s => s.skills))).slice(0,6)
        return `My portfolio stack: ${techs.join(', ')}.`
      }
      // Skills overview
      if (/skills? (list|overview|summary)|what skills (do you use|you use)/.test(t)) {
        const tops = skillsSummary.map(s => `• ${s.title}: ${s.skills.join(', ')}`).join('\n')
        return `Here’s my skills overview:\n${tops}`
      }
      // List roles/companies
      if (/company|companies|roles|positions|jobs|worked|experience list/.test(t)) {
        const roles = experiences.filter(e => e.type === 'work').map(e => `${e.title} @ ${e.company} (${e.period})`).join('\n• ')
        return roles ? `Experience:\n• ${roles}` : `No work experience listed.`
      }
      // Education details
      if (/education|degree|university|college|study/.test(t)) {
        const edu = experiences.filter(e => e.type === 'education').map(e => `${e.title} — ${e.company} (${e.period})`).join('\n• ')
        return edu ? `Education:\n• ${edu}` : `No education details listed.`
      }
      // Experience filtered by company name
      const companyMatch = t.match(/(?:at|@|company)\s+([a-z0-9 .,&-]+)/i)
      if (companyMatch) {
        const q = companyMatch[1].trim()
        const hits = experiences.filter(e => e.type === 'work' && e.company.toLowerCase().includes(q))
        if (hits.length) {
          return hits.map(e => `• ${e.title} @ ${e.company} — ${e.period}`).join('\n')
        }
      }
      // Experience filtered by year
      const yearMatch = t.match(/\b(20\d{2}|19\d{2})\b/)
      if (yearMatch) {
        const yr = yearMatch[1]
        const hits = experiences.filter(e => e.period.includes(yr))
        if (hits.length) {
          return `Experience around ${yr}:\n` + hits.map(e => `• ${e.title} @ ${e.company} (${e.period})`).join('\n')
        }
      }
      // Social links
      if (/github|linkedin|twitter|instagram|social/.test(t)) {
        const links = [
          contact.socials?.github ? `GitHub: ${contact.socials.github}` : '',
          contact.socials?.linkedin ? `LinkedIn: ${contact.socials.linkedin}` : '',
          contact.socials?.twitter ? `Twitter: ${contact.socials.twitter}` : '',
          contact.socials?.instagram ? `Instagram: ${contact.socials.instagram}` : '',
        ].filter(Boolean).join('\n')
        return links || 'No social links provided.'
      }
      // Years of experience (estimate from periods if possible)
      if (/years? of experience|how long|experience\s*\?$/i.test(t) || /how long have you been/.test(t)) {
        // naive extraction from period ranges like '2022 - Present'
        const now = new Date().getFullYear()
        let minYear = now
        experiences.forEach(e => {
          const m = e.period.match(/(\d{4})\s*-\s*(Present|\d{4})/i)
          if (m) {
            const start = parseInt(m[1])
            if (!isNaN(start)) minYear = Math.min(minYear, start)
          }
        })
        const years = Math.max(0, now - (isFinite(minYear) ? minYear : now))
        if (years > 0) return `Roughly ${years}+ years of experience (based on timeline).`
        return 'I have 3+ years of experience.'
      }
      // Project categories
      if (/category|categories|types of projects/.test(t)) {
        const cats = Array.from(new Set(projects.map(p => p.category))).join(', ')
        return cats ? `Project categories: ${cats}.` : 'No project categories listed.'
      }
      // CV/Resume
      if (/cv|resume|curriculum vitae/.test(t)) {
        return 'You can download my CV from the About section. If you need a copy via email, use the Contact section.'
      }
      // Contact specifics
      if (/email|phone|location|where.*based|where.*from/.test(t)) {
        const lines = [
          contact.email ? `Email: ${contact.email}` : '',
          contact.phone ? `Phone: ${contact.phone}` : '',
          contact.location ? `Location: ${contact.location}` : '',
        ].filter(Boolean)
        return lines.length ? lines.join(' | ') : 'Check the Contact section for details.'
      }
      // Count skills or list categories
      if (/how many skills|skills count/.test(t)) {
        const total = skillsSummary.reduce((sum, s) => sum + s.skills.length, 0)
        return `I list ${total} skills across ${skillsSummary.length} categories.`
      }
      if (/list skill categories|categories of skills/.test(t)) {
        return `Skill categories: ${skillsSummary.map(s => s.title).join(', ')}.`
      }
      // Availability/rates (not specified)
      if (/availability|available|freelance|hire|rate|pricing/.test(t)) {
        return 'Availability and rates aren’t specified here. Please use the Contact section to discuss details.'
      }
      // Simple intents for local answers
      if (/project|work|portfolio/.test(t)) {
        const tops = projects.slice(0, 3).map(p => `• ${p.title} — ${p.description}`).join('\n')
        return `Here are a few projects:\n\n${tops}\n\nAsk "show projects" and I’ll scroll there.`
      }
      if (/skill|stack|tech|technology/.test(t)) {
        const tops = skillsSummary.slice(0, 4).map(s => `• ${s.title}: ${s.skills.slice(0,4).join(', ')}`).join('\n')
        return `Key skills:\n\n${tops}\n\nSay "go to skills" to view more.`
      }
      if (/contact|email|reach/.test(t)) {
        return `You can reach out via the Contact section. Say "scroll to contact" and I’ll take you there.`
      }
      // Portfolio overview fallback (no clear intent)
      const overviewAbout = about.summary[0] || 'Full‑stack developer focused on modern web apps.'
      const overviewRole = experiences.find(e => e.type === 'work')
      const overviewEdu = experiences.find(e => e.type === 'education')
      const overviewSkills = skillsSummary.slice(0,3).map(s => s.title).join(', ')
      const overviewProjects = projects.slice(0,2).map(p => p.title).join(', ')
      return [
        overviewAbout,
        overviewRole ? `Recent role: ${overviewRole.title} @ ${overviewRole.company} (${overviewRole.period}).` : '',
        overviewEdu ? `Education: ${overviewEdu.title} — ${overviewEdu.company}.` : '',
        `Core strengths: ${overviewSkills}.`,
        `Flagship projects: ${overviewProjects}.`,
        `Ask for details (e.g., "Tell me about ${projects[0]?.title}" or "What stack do you use?") or say "show projects" to jump there.`
      ].filter(Boolean).join('\n')
    }

    const openaiKey = process.env.OPENAI_API_KEY
    const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const openrouterModel = process.env.OPENROUTER_MODEL // optional
    const systemPrompt = [
      'You are the portfolio owner\'s assistant speaking as "I". Be concise, friendly, and on-brand.',
      'Use ONLY the provided site context for facts (location, roles, skills, projects, contact).',
      'If a detail is missing, say you don\'t know and suggest contacting via the Contact section.',
      'Never use placeholders like [insert ...]; never fabricate details.',
    ].join(' ')

    // Build a small knowledge snippet for provider calls (kept short for tokens)
    const topProjects = projects.slice(0, 3).map(p => `${p.title}: ${p.category}`).join(' | ')
    const topSkills = skillsSummary.slice(0, 3).map(s => `${s.title}(${s.skills.slice(0,2).join(', ')})`).join(' | ')
    const recentRole = experiences.find(e => e.type === 'work')
    const edu = experiences.find(e => e.type === 'education')
    const kbLines = [
      about.summary[0] ? `About: ${about.summary[0]}` : '',
      contact.location ? `Location: ${contact.location}` : '',
      contact.email ? `Email: ${contact.email}` : '',
      recentRole ? `Recent role: ${recentRole.title} @ ${recentRole.company} (${recentRole.period})` : '',
      edu ? `Education: ${edu.title} — ${edu.company}` : '',
      topSkills ? `Skills: ${topSkills}` : '',
      topProjects ? `Projects: ${topProjects}` : '',
    ].filter(Boolean)
    const contextMsg = { role: 'system' as const, content: `Site context:\n${kbLines.join('\n')}` }

    // Build common messages
    const commonMessages = [
      { role: 'system', content: systemPrompt },
      contextMsg,
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    // Prefer OpenAI first if available
    if (openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: openaiModel,
            messages: commonMessages,
            temperature: 0.4,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const reply = data?.choices?.[0]?.message?.content?.trim() || fallbackReply()
          return NextResponse.json({ reply, provider: 'openai' })
        }
        // If OpenAI returns a quota/402/429 error, fall through to OpenRouter (if configured) then Local
      } catch {
        // ignore and try other providers
      }
    }

    // Try OpenRouter next if configured
    if (openrouterKey) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openrouterKey}`,
          },
          body: JSON.stringify({
            model: openrouterModel || 'openai/gpt-4o-mini',
            messages: commonMessages,
            temperature: 0.4,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const reply = data?.choices?.[0]?.message?.content?.trim() || fallbackReply()
          return NextResponse.json({ reply, provider: 'openrouter' })
        }
      } catch {
        // ignore and fall through
      }
    }

    // Neither OpenAI nor OpenRouter available/successful → Local analysis fallback
    return NextResponse.json({ reply: fallbackReply(), provider: 'local' })
  } catch (err: any) {
    return NextResponse.json({ reply: 'The assistant is temporarily unavailable. Please try again in a moment.', provider: 'local' }, { status: 200 })
  }
}
