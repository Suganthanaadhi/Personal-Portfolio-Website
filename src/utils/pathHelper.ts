/**
 * Utility function to handle paths with conditional basePath
 * Automatically prepends basePath for GitHub Pages
 */

// Import basePath from next.config
const getBasePath = (): string => {
  // For client-side, we can detect from window.location or use a config constant
  // Since this is a static export, we check environment variables during build
  if (typeof window === 'undefined') {
    // Server-side (build time)
    return process.env.DEPLOY_TO_GITHUB_PAGES ? '/Personal-Portfolio-Website' : '';
  }
  
  // Client-side: Check if we're on GitHub Pages subdirectory
  const pathname = window.location.pathname;
  if (pathname.startsWith('/Personal-Portfolio-Website/')) {
    return '/Personal-Portfolio-Website';
  }
  
  return '';
};

export const withBasePath = (path: string): string => {
  const basePath = getBasePath();
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return basePath + path;
};

export default withBasePath;
