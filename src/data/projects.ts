export type Project = {
  id: number
  title: string
  description: string
  image: string
  technologies: string[]
  github: string
  live: string
  category: string
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'A modern full-stack e-commerce platform with user authentication, payment processing, and admin dashboard.',
    image: '/api/placeholder/600/400',
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL', 'Tailwind CSS'],
    github: 'https://github.com/username/ecommerce',
    live: 'https://ecommerce-demo.vercel.app',
    category: 'Full Stack'
  },
  {
    id: 2,
    title: 'Task Management App',
    description: 'Collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration.',
    image: '/api/placeholder/600/400',
    technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Express'],
    github: 'https://github.com/username/taskmanager',
    live: 'https://taskmanager-demo.netlify.app',
    category: 'Web App'
  },
  {
    id: 3,
    title: 'Data Visualization Dashboard',
    description: 'Interactive dashboard for visualizing complex datasets with charts, graphs, and real-time analytics.',
    image: '/api/placeholder/600/400',
    technologies: ['Python', 'Streamlit', 'Pandas', 'Plotly', 'APIs'],
    github: 'https://github.com/username/dataviz',
    live: 'https://dataviz-dashboard.herokuapp.com',
    category: 'Data Science'
  },
  {
    id: 4,
    title: 'Mobile Weather App',
    description: 'Cross-platform mobile application providing weather forecasts with location-based services and offline support.',
    image: '/api/placeholder/600/400',
    technologies: ['React Native', 'Expo', 'Weather API', 'AsyncStorage'],
    github: 'https://github.com/username/weather-app',
    live: 'https://expo.dev/@username/weather',
    category: 'Mobile'
  },
  {
    id: 5,
    title: 'AI Chat Assistant',
    description: 'Intelligent chatbot powered by machine learning for customer support with natural language processing.',
    image: '/api/placeholder/600/400',
    technologies: ['Python', 'OpenAI API', 'Flask', 'NLP', 'Docker'],
    github: 'https://github.com/username/ai-chat',
    live: 'https://ai-chat-demo.railway.app',
    category: 'AI/ML'
  },
  {
    id: 6,
    title: 'Portfolio Website',
    description: 'Modern, responsive portfolio website built with Next.js, featuring smooth animations and glassmorphism design.',
    image: '/api/placeholder/600/400',
    technologies: ['Next.js', 'Framer Motion', 'Tailwind CSS', 'TypeScript'],
    github: 'https://github.com/username/portfolio',
    live: 'https://yourname.dev',
    category: 'Frontend'
  }
]
