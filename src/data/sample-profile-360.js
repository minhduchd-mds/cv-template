export const sampleProfile360 = {
  id: 'alex-chen-product-designer',
  identity: {
    name: 'Alex Chen',
    preferredName: 'Alex',
    pronouns: 'he/him',
    role: 'Senior Product Designer · Design Engineer',
    headline: 'I turn complex B2B workflows into calm, measurable product experiences.',
    location: 'Singapore',
    timezone: 'GMT+8',
    availability: 'Open to Senior Product Designer / Design Engineer roles',
    workMode: 'Hybrid · Remote-friendly',
    email: 'alex.chen@example.com',
    phone: '+65 8123 4567',
    website: 'alexchen.design',
    github: 'github.com/alexchen-design',
    linkedin: 'linkedin.com/in/alexchen-design',
    avatar: '/sample/alex-profile.svg',
  },

  positioning: {
    shortBio:
      'Product-minded UI/UX designer with 8+ years across B2B SaaS, analytics, AI-assisted workflows and design systems. Strong at simplifying complex operational products and partnering closely with engineering.',
    longBio:
      'I work at the intersection of product strategy, interaction design and front-end implementation. My best work usually starts with a messy workflow, fragmented information or a product that has outgrown its original UI. I map the decision flow, reduce cognitive load, build reusable patterns and stay close to engineering until the experience ships. I care about measurable outcomes, accessible interfaces and design systems that actually survive production.',
    valueProposition: [
      'Translate complex workflows into clear product journeys.',
      'Build scalable design systems that reduce visual drift.',
      'Use prototypes and code awareness to shorten design-to-dev handoff.',
      'Bring AI into product workflows without sacrificing usability or trust.',
    ],
    principles: [
      'Clarity before decoration',
      'Evidence before opinion',
      'Systems before one-off screens',
      'Ship quality, not just mockups',
    ],
  },

  proof: {
    years: '8+',
    shippedProducts: '18+',
    auditedModules: '42+',
    designSystemCoverage: '85%',
    handoffImprovement: '40%',
    usabilityImprovement: '31%',
    teamsSupported: '7',
    workshopsLed: '24+',
  },

  experience: [
    {
      role: 'Senior Product Designer',
      company: 'Northstar Cloud',
      period: '2023 — Present',
      location: 'Singapore',
      employmentType: 'Full-time',
      summary: 'Lead product design for enterprise operations, analytics and AI-assisted workflows.',
      bullets: [
        'Redesigned a multi-module operations platform used by regional teams, reducing task completion time by 31% in moderated usability tests.',
        'Built a token-based design system covering navigation, forms, tables, data visualization and responsive states; adoption reached 85% across active product surfaces.',
        'Created a design QA workflow with engineering that reduced recurring visual defects and cut design-to-dev clarification time by roughly 40%.',
        'Partnered with product managers on AI-assisted reporting and anomaly triage, defining trust, fallback and explainability patterns before implementation.',
      ],
      tags: ['B2B SaaS', 'AI', 'Design Systems', 'Analytics'],
    },
    {
      role: 'Product Designer',
      company: 'Orbit Finance',
      period: '2020 — 2023',
      location: 'Remote · APAC',
      employmentType: 'Full-time',
      summary: 'Designed financial operations and reporting experiences for growing businesses.',
      bullets: [
        'Simplified approval and reconciliation workflows spanning five user roles and more than 20 edge cases.',
        'Introduced research repositories, reusable flow maps and component patterns that improved design consistency across squads.',
        'Worked directly with React engineers on responsive behavior, empty states, accessibility and edge-case validation.',
      ],
      tags: ['Fintech', 'Workflow UX', 'Research', 'React'],
    },
    {
      role: 'UI/UX Designer',
      company: 'Pixel Foundry Studio',
      period: '2018 — 2020',
      location: 'Singapore',
      employmentType: 'Full-time',
      summary: 'Designed responsive websites and digital products for technology and service brands.',
      bullets: [
        'Delivered end-to-end UX from discovery and information architecture to production-ready interface specifications.',
        'Created reusable web components and visual guidelines that shortened repeat delivery for common page types.',
      ],
      tags: ['Web', 'UI/UX', 'Prototyping'],
    },
  ],

  projects: [
    {
      id: 'atlas-ops',
      name: 'Atlas Ops',
      type: 'B2B SaaS · Operations',
      role: 'Lead Product Designer',
      period: '2025 — 2026',
      impact: '31% faster completion for high-frequency operational tasks',
      description:
        'A redesign of an enterprise operations workspace that brought fragmented queues, approvals and exception handling into one coherent decision flow.',
      problem:
        'Users moved across several tools and dense tables to complete one task, creating missed exceptions and slow handoffs.',
      solution:
        'Reframed the product around task states, progressive disclosure and a shared detail workspace with contextual actions.',
      result:
        'Usability testing showed 31% faster task completion and materially fewer navigation errors across the primary workflow.',
      image: '/sample/atlas-ops.svg',
      tags: ['Workflow UX', 'Tables', 'Design System', 'Accessibility'],
    },
    {
      id: 'signal-ai',
      name: 'Signal AI Assistant',
      type: 'AI · Analytics',
      role: 'Product Designer',
      period: '2025',
      impact: 'Reduced analyst triage steps from 7 to 3',
      description:
        'An AI-assisted anomaly review workflow that helps analysts understand unusual patterns, inspect evidence and move to the next action with confidence.',
      problem:
        'AI suggestions were difficult to trust because users could not see supporting evidence or understand what would happen after accepting a recommendation.',
      solution:
        'Added evidence-first explanations, confidence framing, safe fallback states and reversible actions.',
      result:
        'The revised flow reduced triage steps and improved confidence ratings in internal usability sessions.',
      image: '/sample/signal-ai.svg',
      tags: ['AI UX', 'Trust', 'Analytics', 'Human-in-the-loop'],
    },
    {
      id: 'northstar-system',
      name: 'Northstar Design System',
      type: 'Platform · Design System',
      role: 'Design System Lead',
      period: '2024 — 2026',
      impact: '85% adoption across active product surfaces',
      description:
        'A production-focused design system connecting semantic tokens, components, interaction states and implementation guidance.',
      problem:
        'Fast product growth created inconsistent patterns, duplicated components and visual drift between design and code.',
      solution:
        'Introduced semantic tokens, component contracts, accessibility rules, QA checks and release notes shared with engineering.',
      result:
        'Component adoption reached 85%, while design review cycles became shorter and more predictable.',
      image: '/sample/northstar-system.svg',
      tags: ['Tokens', 'Components', 'Governance', 'Design QA'],
    },
    {
      id: 'pulse-dashboard',
      name: 'Pulse Executive Dashboard',
      type: 'Data · Executive Analytics',
      role: 'Senior Product Designer',
      period: '2024',
      impact: 'Unified 5 reporting views into one decision dashboard',
      description:
        'A decision-oriented dashboard for leadership teams, focused on exceptions, trends and drill-down rather than passive chart collections.',
      problem:
        'Leaders received multiple reports with duplicated metrics and no consistent way to identify what required attention.',
      solution:
        'Reorganized information around business questions, thresholds, alerts and progressive drill-down.',
      result:
        'Five recurring report views were consolidated into one responsive workspace with clearer escalation paths.',
      image: '/sample/pulse-dashboard.svg',
      tags: ['Dashboard', 'Data Visualization', 'Information Architecture'],
    },
  ],

  capabilities: {
    product: [
      'Product strategy',
      'Problem framing',
      'User flows',
      'Information architecture',
      'Interaction design',
      'Prototyping',
      'Usability testing',
    ],
    systems: [
      'Design systems',
      'Design tokens',
      'Component governance',
      'Accessibility',
      'Design QA',
      'Documentation',
    ],
    technical: [
      'HTML/CSS',
      'SCSS',
      'Vue',
      'React awareness',
      'TypeScript awareness',
      'Git',
      'Vite',
      'Responsive implementation',
    ],
    ai: [
      'AI product UX',
      'Prompt flows',
      'Human-in-the-loop patterns',
      'Explainability UX',
      'AI-assisted design QA',
    ],
  },

  tools: [
    'Figma',
    'FigJam',
    'Maze',
    'Notion',
    'Jira',
    'GitHub',
    'VS Code',
    'Vue',
    'Vite',
    'Storybook',
  ],

  education: [
    {
      title: 'B.Sc. Information Systems',
      place: 'Singapore Management University',
      period: '2014 — 2018',
    },
  ],

  certificates: [
    {
      title: 'Google UX Design Professional Certificate',
      issuer: 'Google · Coursera',
      period: '2023',
      url: 'https://www.coursera.org/professional-certificates/google-ux-design',
    },
    {
      title: 'Accessibility for Designers',
      issuer: 'Interaction Design Foundation',
      period: '2024',
      url: 'https://www.interaction-design.org/',
    },
    {
      title: 'Design Systems',
      issuer: 'Professional Development Program',
      period: '2025',
      url: '',
    },
  ],

  recognition: [
    { year: '2026', title: 'Product Craft Award', detail: 'Internal recognition for Atlas Ops redesign.' },
    { year: '2025', title: 'Design Systems Champion', detail: 'Recognized for cross-team system adoption and governance.' },
  ],

  testimonials: [
    {
      quote:
        'Alex consistently turns complicated requirements into product decisions the whole squad can understand. He is equally strong in workshops, detailed interaction design and implementation review.',
      author: 'Maya Lim',
      role: 'Group Product Manager · Northstar Cloud',
    },
  ],

  interests: ['Design tooling', 'AI product UX', 'Data visualization', 'Photography', 'Urban cycling'],
  languages: ['English · Native / bilingual proficiency', 'Mandarin Chinese · Professional proficiency'],
}

export const resumeCandidateFrom360 = (profile = sampleProfile360) => ({
  name: profile.identity.name,
  role: profile.identity.role,
  location: profile.identity.location,
  email: profile.identity.email,
  phone: profile.identity.phone,
  website: profile.identity.website,
  avatar: profile.identity.avatar,
  headline: profile.identity.headline,
  quote: profile.testimonials?.[0]?.quote || '',
  availability: profile.identity.availability,
  summary: profile.positioning.shortBio,
  sections: [
    { id: 'summary', label: 'Profile', enabled: true },
    { id: 'highlights', label: 'Impact', enabled: true },
    { id: 'experience', label: 'Experience', enabled: true },
    { id: 'projects', label: 'Projects', enabled: true },
    { id: 'skills', label: 'Skills', enabled: true },
    { id: 'education', label: 'Education', enabled: true },
    { id: 'certificates', label: 'Certificates', enabled: true },
    { id: 'languages', label: 'Languages', enabled: true },
  ],
  highlights: [
    { value: profile.proof.years, label: 'Years designing digital products' },
    { value: profile.proof.shippedProducts, label: 'Products and major releases shipped' },
    { value: profile.proof.handoffImprovement, label: 'Faster design-to-dev handoff' },
  ],
  experience: profile.experience.slice(0, 3).map(({ role, company, period, location, bullets }) => ({
    role,
    company,
    period,
    location,
    bullets,
  })),
  projects: profile.projects.slice(0, 4).map(({ name, type, impact, description, image, problem, solution, result, role, period, tags }) => ({
    name,
    type,
    impact,
    description,
    image,
    problem,
    solution,
    result,
    role,
    period,
    tags,
  })),
  skills: [
    ...profile.capabilities.product,
    ...profile.capabilities.systems,
    ...profile.capabilities.technical,
    ...profile.capabilities.ai,
  ].filter((item, index, list) => list.indexOf(item) === index),
  tools: profile.tools,
  education: profile.education,
  certificates: profile.certificates,
  languages: profile.languages,
  recognition: profile.recognition,
  testimonials: profile.testimonials,
  interests: profile.interests,
  profile360: profile,
})
