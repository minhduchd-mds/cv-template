export const templates = [
  {
    id: 'product-slate',
    name: 'Senior Product Designer',
    category: 'Product',
    variant: 'product',
    accent: '#6d5dfc',
    description: 'Portfolio-led layout with a strong product design hierarchy.',
  },
  {
    id: 'ats-clean',
    name: 'ATS Clean',
    category: 'ATS',
    variant: 'ats',
    accent: '#0f766e',
    description: 'Single-column, recruiter-friendly and intentionally minimal.',
  },
  {
    id: 'creative-grid',
    name: 'Creative Portfolio',
    category: 'Creative',
    variant: 'creative',
    accent: '#e44d7a',
    description: 'Editorial composition for designers who want more personality.',
  },
  {
    id: 'executive-ink',
    name: 'Executive Minimal',
    category: 'Leadership',
    variant: 'executive',
    accent: '#b7791f',
    description: 'Calm, premium direction for senior and lead-level profiles.',
  },
]

export const candidate = {
  name: 'Nguyễn Minh Anh',
  role: 'Senior UI/UX & Product Designer',
  location: 'Hà Nội, Việt Nam',
  email: 'hello@example.com',
  phone: '+84 900 000 000',
  website: 'portfolio.example.com',
  summary:
    'Product-minded UI/UX designer focused on complex web platforms, design systems and code-aware delivery. I turn ambiguous workflows into clear interfaces, reusable patterns and measurable product outcomes.',
  highlights: [
    { value: '6+', label: 'Years designing digital products' },
    { value: '15+', label: 'Complex modules audited or redesigned' },
    { value: '40%', label: 'Faster design-to-dev handoff' },
  ],
  experience: [
    {
      role: 'Senior UI/UX Designer',
      company: 'Enterprise Product Team',
      period: '2022 — Present',
      location: 'Hà Nội',
      bullets: [
        'Led end-to-end UX for enterprise web products spanning analytics, operations and internal platforms.',
        'Built and governed a reusable design system covering tokens, components, interaction states and accessibility guidance.',
        'Partnered directly with front-end teams to reduce visual drift and improve implementation quality across releases.',
      ],
    },
    {
      role: 'UI/UX Designer',
      company: 'Digital Platform Studio',
      period: '2020 — 2022',
      location: 'Hà Nội',
      bullets: [
        'Designed responsive web journeys from discovery and flow mapping through polished production UI.',
        'Introduced structured UX reviews and component reuse to improve consistency across multiple products.',
      ],
    },
  ],
  projects: [
    {
      name: 'Design QA Agent',
      type: 'AI · Design Ops',
      impact: 'Automated visual QA workflow',
      description: 'A design-to-web audit concept that compares implementation quality, flags UI issues and structures review output for delivery teams.',
    },
    {
      name: 'Analytics Workspace',
      type: 'B2B · Data',
      impact: 'Unified dashboard patterns',
      description: 'A modular analytics experience with responsive dashboards, drill-down patterns and reusable chart interaction rules.',
    },
    {
      name: 'Design System Core',
      type: 'Platform · System',
      impact: 'Reusable cross-product foundation',
      description: 'Shared tokens, components and quality rules designed to bridge Figma decisions and front-end implementation.',
    },
  ],
  skills: [
    'Product Design',
    'UI/UX',
    'Design Systems',
    'Interaction Design',
    'UX Audit',
    'Accessibility',
    'Figma',
    'Prototyping',
    'HTML/CSS',
    'Vue / React awareness',
    'Design QA',
    'AI-assisted workflows',
  ],
  education: [
    { title: 'Software & Web Development', place: 'Technology Program', period: '2018' },
    { title: 'Continuous Product & UX Learning', place: 'Professional Certificates', period: '2024 — Present' },
  ],
  languages: ['Vietnamese · Native', 'English · Professional working proficiency'],
}
