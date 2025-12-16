export type SkillCategory = {
  title: string
  skills: string[]
  level: number
}

export const skillsSummary: SkillCategory[] = [
  { title: 'Languages', skills: ['Java', 'Python'], level: 90 },
  { title: 'Frontend', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind'], level: 88 },
  { title: 'Backend', skills: ['Java (JDBC, JSP, Servlets)', 'Spring Boot', 'JPA / Hibernate'], level: 85 },
  { title: 'Database', skills: ['MySQL (Schema Design & Query Optimization)'], level: 82 },
  { title: 'ML/Data Libraries', skills: ['NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Scikit-learn'], level: 80 },
  { title: 'Data Visualization Tools', skills: ['Power BI', 'Tableau', 'MS Excel'], level: 78 },
  { title: 'UI/UX Tools', skills: ['Figma'], level: 80 },
  { title: 'Creative Tools', skills: ['DaVinci Resolve', 'Blender'], level: 70 },
  { title: 'Version Control & IDEs', skills: ['Git', 'GitHub', 'GitHub Copilot', 'VS Code', 'IntelliJ IDEA'], level: 90 },
  { title: 'Core Concepts', skills: ['OOP', 'MVC Architecture', 'Authentication & Authorization', 'Data Modeling', 'API Integration'], level: 92 },
  { title: 'Prompt Engineering', skills: ['Prompt Engineering (LLMs & Generative AI)'], level: 92 },
]
