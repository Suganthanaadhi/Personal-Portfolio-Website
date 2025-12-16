export interface Achievement {
  id: string
  year?: string
  date?: string
  title: string
  organization?: string
  description: string
  tags?: string[]
  highlight?: boolean
  link?: string
  icon?: string // optional name referencing a Lucide icon key
}

export const achievements: Achievement[] = [
  {
    id: 'kabaddi-winner-2019',
    year: '2019',
    title: 'Winner — Kabaddi (National Level)',
    organization: 'Youth National Games, Nehru Yuva Kendra (Govt. of India)',
    description: 'Represented and won at the national level in Kabaddi during the Youth National Games.',
    tags: ['Sports', 'Kabaddi'],
    highlight: true,
  },
  {
    id: 'wushu-1st-2015',
    year: '2015',
    title: '1st Place — Wushu (Sanshou)',
    organization: 'Salem District Wushu Association',
    description: 'Secured first place in the Wushu (Sanshou) competition at the Salem district level.',
    tags: ['Sports', 'Wushu'],
  },
  {
    id: 'nptel-python-2023',
    year: '2023',
    title: 'The Joy of Computing Using Python',
    organization: 'NPTEL, IIT Madras',
    description: 'Completed the NPTEL course "The Joy of Computing Using Python" offered by IIT Madras.',
    tags: ['Course', 'Python'],
  },
  {
    id: 'genai-ibm-2025',
    year: '2025',
    title: 'Generative AI in Action',
    organization: 'IBM SkillsBuild',
    description: 'Completed the "Generative AI in Action" program on IBM SkillsBuild.',
    tags: ['Course', 'AI'],
  },
  {
    id: 'employability-titan-2023',
    year: '2023-2024',
    title: 'Employability Skills Training',
    organization: 'TITAN LeAP & Naandi Foundation',
    description: 'Participated in employability skills training offered by TITAN LeAP in partnership with Naandi Foundation.',
    tags: ['Training', 'Employability'],
  },
]

// Utility group by year (descending)
export function achievementsByYear() {
  return achievements.reduce<Record<string, Achievement[]>>((acc, a) => {
    const key = a.year || 'Other'
    acc[key] = acc[key] || []
    acc[key].push(a)
    return acc
  }, {})
}