export interface RoleSkillTaxonomyEntry {
  role: string;
  aliases: string[];
  requiredSkills: string[];
  relatedRoles: string[];
  relatedRoleKeywords: string[];
}

export const ROLE_SKILL_TAXONOMY: RoleSkillTaxonomyEntry[] = [
  {
    role: 'Frontend Developer',
    aliases: ['frontend developer', 'front end developer', 'frontend engineer', 'front end engineer', 'react developer'],
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Next.js', 'Redux', 'Git', 'REST APIs', 'Tailwind CSS'],
    relatedRoles: ['Frontend Developer', 'React Developer', 'UI Engineer', 'JavaScript Developer', 'Web Frontend Engineer'],
    relatedRoleKeywords: ['frontend', 'front end', 'react', 'javascript', 'ui engineer', 'web frontend'],
  },
  {
    role: 'UI/UX Designer',
    aliases: ['ui/ux designer', 'ui ux designer', 'ux designer', 'ui designer', 'product designer'],
    requiredSkills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Accessibility', 'Design Systems', 'Usability Testing'],
    relatedRoles: ['UI/UX Designer', 'UX Designer', 'UI Designer', 'Product Designer', 'Interaction Designer'],
    relatedRoleKeywords: ['ui ux', 'ux designer', 'ui designer', 'product designer', 'interaction designer', 'design'],
  },
  {
    role: 'Backend Developer',
    aliases: ['backend developer', 'back end developer', 'backend engineer', 'api developer', 'server side developer'],
    requiredSkills: ['Node.js', 'Express', 'SQL', 'MongoDB', 'Redis', 'REST API', 'Authentication', 'Docker'],
    relatedRoles: ['Backend Developer', 'Backend Engineer', 'Node.js Developer', 'API Developer', 'Server-Side Engineer'],
    relatedRoleKeywords: ['backend', 'back end', 'node', 'api', 'server side', 'server-side'],
  },
  {
    role: 'Full Stack Developer',
    aliases: ['full stack developer', 'fullstack developer', 'full stack engineer', 'fullstack engineer'],
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'SQL', 'Docker', 'Authentication', 'Deployment'],
    relatedRoles: ['Full Stack Developer', 'Full Stack Engineer', 'MERN Stack Developer', 'Web Application Developer', 'Software Engineer'],
    relatedRoleKeywords: ['full stack', 'fullstack', 'mern', 'web application', 'software engineer'],
  },
  {
    role: 'Data Analyst',
    aliases: ['data analyst', 'business intelligence analyst', 'bi analyst', 'analytics analyst'],
    requiredSkills: ['Excel', 'SQL', 'Power BI', 'Tableau', 'Python', 'Statistics', 'Data Visualization'],
    relatedRoles: ['Data Analyst', 'BI Analyst', 'Business Intelligence Analyst', 'Reporting Analyst', 'Analytics Analyst'],
    relatedRoleKeywords: ['data analyst', 'bi analyst', 'business intelligence', 'reporting analyst', 'analytics analyst'],
  },
  {
    role: 'Data Scientist',
    aliases: ['data scientist'],
    requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'TensorFlow', 'Spark'],
    relatedRoles: ['Data Scientist', 'Machine Learning Scientist', 'Applied Scientist', 'AI Data Scientist', 'Predictive Modeling Scientist'],
    relatedRoleKeywords: ['data scientist', 'machine learning scientist', 'applied scientist', 'predictive'],
  },
  {
    role: 'AI Engineer',
    aliases: ['ai engineer', 'python ai engineer', 'artificial intelligence engineer', 'gen ai engineer', 'generative ai engineer'],
    requiredSkills: ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'PyTorch', 'NLP', 'RAG', 'Vector Databases', 'Docker', 'AWS'],
    relatedRoles: ['AI Engineer', 'AI ML Engineer', 'Machine Learning Engineer', 'Artificial Intelligence Engineer', 'Generative AI Engineer'],
    relatedRoleKeywords: ['ai engineer', 'artificial intelligence', 'machine learning', 'ml engineer', 'generative ai', 'gen ai'],
  },
  {
    role: 'DevOps Engineer',
    aliases: ['devops engineer', 'dev ops engineer', 'site reliability engineer', 'sre engineer'],
    requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS', 'Monitoring'],
    relatedRoles: ['DevOps Engineer', 'Site Reliability Engineer', 'Cloud DevOps Engineer', 'Platform Engineer', 'Infrastructure Engineer'],
    relatedRoleKeywords: ['devops', 'dev ops', 'site reliability', 'sre', 'platform engineer', 'infrastructure'],
  },
  {
    role: 'Cybersecurity Engineer',
    aliases: ['cybersecurity engineer', 'cyber security engineer', 'security engineer', 'soc engineer'],
    requiredSkills: ['Networking', 'OWASP', 'SIEM', 'Threat Analysis', 'Penetration Testing', 'Security Auditing'],
    relatedRoles: ['Cybersecurity Engineer', 'Security Engineer', 'SOC Engineer', 'Penetration Tester', 'Application Security Engineer'],
    relatedRoleKeywords: ['cybersecurity', 'cyber security', 'security engineer', 'soc', 'penetration', 'application security'],
  },
  {
    role: 'Cloud Engineer',
    aliases: ['cloud engineer', 'aws engineer', 'azure engineer', 'gcp engineer', 'cloud infrastructure engineer'],
    requiredSkills: ['Linux', 'AWS', 'Azure', 'GCP', 'Terraform', 'Docker', 'Kubernetes', 'Networking'],
    relatedRoles: ['Cloud Engineer', 'AWS Cloud Engineer', 'Azure Cloud Engineer', 'GCP Cloud Engineer', 'Cloud Infrastructure Engineer'],
    relatedRoleKeywords: ['cloud engineer', 'aws', 'azure', 'gcp', 'cloud infrastructure'],
  },
];
