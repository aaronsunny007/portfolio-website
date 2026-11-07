// All site copy lives in src/content. Edit here, not in components.
export const profile = {
  first: 'Sunny',
  last: 'Aaron',
  // Legal name, shown only as the home-page headline. Everywhere else the site says Sunny / Sunny Aaron.
  legal: { given: 'Aaron Prakash', family: 'Gandhi' },
  role: 'AI Engineer',
  tagline: 'Controlled chaos. AI systems that stay in line when things go sideways.',
  chips: ['AI Engineer', 'AI Security', 'MLOps'],
  location: 'Belfast, NI',
  status: 'Open to roles',
  github: 'https://github.com/aaronsunny007',
  // TODO(Sunny): add your public email, LinkedIn URL and CV (public/cv/Sunny-Aaron-CV.pdf).
  email: '',
  linkedin: '',
  cv: '',
  licence: [
    ['Class', 'AI Engineer · AI Security · MLOps'],
    ['Base', 'Belfast, NI'],
    ['Training', 'MSc Artificial Intelligence, Ulster University'],
    ['Background', 'Computer Science and Cybersecurity'],
    ['Fuel', 'Football and biriyani'],
  ],
  bio: [
    "I'm an AI postgraduate at Ulster University with a foundation in Computer Science and Cybersecurity. I build real-world things with machine learning, data and modern software.",
    'My work spans intelligent agents, ML systems, AI infrastructure and security. I like combining LLMs, retrieval, tools and proper engineering pipelines into AI products that people can actually use.',
    "Outside of tech you'll probably find me watching football or hunting down the best biriyani in town.",
  ],
};

export const toolkit = [
  { group: 'Engine', tools: [['Python', 'Warden, Ledger, NRF'], ['PyTorch', 'Fair-FL'], ['scikit-learn', 'Loan default'], ['LLM APIs', 'Ledger, GitHub agent']] },
  { group: 'Chassis', tools: [['FastAPI', 'Tom & Ollie, CI/CD MLOps'], ['Docker', 'CI/CD MLOps'], ['GitHub Actions', 'llm-eval-redteam'], ['Azure Databricks', 'PulseCity']] },
  { group: 'Safety systems', tools: [['MCP security', 'Warden'], ['Red-teaming', 'llm-eval-redteam'], ['OWASP', 'AEGIS, scanner'], ['AIF360', 'Fair-FL']] },
  { group: 'Telemetry', tools: [['MLflow', 'CI/CD MLOps'], ['Unity Catalog', 'PulseCity'], ['ROS / Gazebo', 'Warehouse robot'], ['Evaluation', 'Ledger, NRF']] },
];

// TODO(Sunny): fill in the years marked null.
export const milestones = [
  { year: null, title: 'BSc Computer Science + Cybersecurity', text: 'The foundation: software, networks and security.' },
  { year: 2024, title: 'Security internship', text: 'Recon and scanning work, later rebuilt as web-security-scanner.' },
  { year: null, title: 'MSc Artificial Intelligence, Ulster', text: 'Robotics, ML and AI ethics coursework, plus the warehouse robot group project.' },
  { year: 2026, title: 'Financial-NRF', text: "Dissertation and paper draft: do LLM reliability scores notice when the source is wrong? Mostly no." },
  { year: 2026, title: 'Tom & Ollie relaunch', text: 'First real client: a storefront for a Belfast cheesemonger.' },
  { year: 2026, title: 'Warden and AEGIS', text: 'AI security agents that only ship a defence after it passes validation.' },
  { year: 'Next', title: 'The next corner', text: 'AI engineering, AI security or MLOps. Let’s talk.' },
];
