export type ExperienceItem = {
  type: 'work' | 'education'
  title: string
  company: string
  location: string
  period: string
  description: string[]
  technologies: string[]
}

export const experiences: ExperienceItem[] = [
  // Education - Degree
  {
    type: 'education',
    title: "B.Tech in Information Technology",
    company: "University College of Engineering (BIT Campus), Anna University, Tiruchirappalli",
    location: 'Tiruchirappalli, India',
    period: '2022 - 2026',
    description: [
      'Register Number: 810022205705',
      'Major: Information Technology',
      'Expected graduation: 2026',
    ],
    technologies: ['UI/UX','Frontend', 'Backend', 'Database', 'API Integration'],
  },
  // Internship Experience
  {
    type: 'work',
    title: 'Android App Development with IoT Intern',
    company: 'NSIC Technical Services Centre (Government of India)',
    location: 'India',
    period: 'Jan 2023',
    description: [
      'Developed Android applications integrating IoT device data',
      'Worked with hardware teams to collect and visualize sensor data',
    ],
    technologies: ['Android', 'Java', 'IoT', 'Bluetooth'],
  },
  {
    type: 'work',
    title: 'Python & Data Science Intern',
    company: 'Gateway Software Solutions',
    location: 'India',
    period: 'Jun 2024 - Aug 2024',
    description: [
      'Assisted in data cleaning, exploratory analysis and model development',
      'Built visualization dashboards to communicate insights',
    ],
    technologies: ['Python', 'Pandas', 'Scikit-learn', 'Matplotlib'],
  },
  {
    type: 'work',
    title: 'Artificial Intelligence Intern',
    company: 'Grantley Edutech',
    location: 'India',
    period: 'Aug 2024 - Oct 2024',
    description: [
      'Worked on AI/ML projects related to educational content personalization',
      'Implemented model evaluation pipelines and performance monitoring',
    ],
    technologies: ['Python', 'TensorFlow', 'NLP', 'Model Evaluation'],
  },
  // Education - Schooling
  {
    type: 'education',
    title: 'HSC',
    company: 'Vaigai Matric Higher Secondary School, valapaddi',
    location: 'valapaddi, India',
    period: '2022',
    description: ['Percentage: 73%'],
    technologies: [],
  },
  {
    type: 'education',
    title: 'SSLC',
    company: 'Vaigai Matric Higher Secondary School, valapaddi',
    location: 'valapaddi, India',
    period: '2020',
    description: ['Percentage: 84%'],
    technologies: [],
  },
]
