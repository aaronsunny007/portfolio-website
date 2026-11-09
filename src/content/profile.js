// All site copy lives in src/content. Edit here, not in components.
export const profile = {
  first: 'Sunny',
  last: 'Aaron',
  // Legal name, shown only as the home-page headline. Everywhere else the site says Sunny / Sunny Aaron.
  legal: { given: 'Aaron Prakash', family: 'Gandi' },
  role: 'AI Engineer',
  tagline: 'Controlled chaos. AI systems that stay in line when things go sideways.',
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
    ['Background', 'BTech, Computer Science and Cybersecurity'],
    ['Fuel', 'Football and biriyani'],
  ],
  bio: [
    "I'm an AI postgraduate at Ulster University with a BTech foundation in Computer Science and Cybersecurity. I build real-world things with machine learning, data and modern software.",
    'My work spans intelligent agents, ML systems, AI infrastructure and security. I like combining LLMs, retrieval, tools and proper engineering pipelines into AI products that people can actually use.',
    "Outside of tech you'll probably find me watching football or hunting down the best biriyani in town.",
  ],
};

// The roles behind the hero's "Open to roles" control. Titles only, exactly as supplied.
export const roles = [
  {
    group: 'AI AND MACHINE LEARNING',
    titles: ['Graduate AI Engineer', 'Junior AI Engineer', 'Junior Applied AI Engineer', 'LLM Evaluation Engineer', 'AI Quality Engineer', 'Junior Machine Learning Engineer', 'AI Trainer', 'AI Content Reviewer'],
  },
  {
    group: 'DATA',
    titles: ['Graduate Data Analyst', 'Junior Data Scientist', 'Quality Data Analyst', 'Operations Data Analyst'],
  },
  {
    group: 'SOFTWARE AND TECHNOLOGY',
    titles: ['Graduate Software Engineer, Python', 'Junior Python Developer', 'Technology Graduate Programme, FDM', 'Technology Graduate Programme, American Express', 'KTP Associate, Artificial Intelligence Projects', 'KTP Associate, Data Projects'],
  },
];

export const roleCount = roles.reduce((n, g) => n + g.titles.length, 0);

export const toolkit = [
  { group: 'Engine', tools: [['Python', 'Warden, Ledger, NRF'], ['PyTorch', 'Fair-FL'], ['scikit-learn', 'Loan default'], ['LLM APIs', 'Ledger, GitHub agent']] },
  { group: 'Chassis', tools: [['FastAPI', 'Tom & Ollie, CI/CD MLOps'], ['Docker', 'CI/CD MLOps'], ['GitHub Actions', 'llm-eval-redteam'], ['Azure Databricks', 'PulseCity']] },
  { group: 'Safety systems', tools: [['MCP security', 'Warden'], ['Red-teaming', 'llm-eval-redteam'], ['OWASP', 'AEGIS, scanner'], ['AIF360', 'Fair-FL']] },
  { group: 'Telemetry', tools: [['MLflow', 'CI/CD MLOps'], ['Unity Catalog', 'PulseCity'], ['ROS / Gazebo', 'Warehouse robot'], ['Evaluation', 'Ledger, NRF']] },
];

// TODO(Sunny): the two entries with year: null have no confirmed dates anywhere in the project, so they show a status tag instead.
// Add the real years (and whether the MSc is complete) when you have them; do not guess.
// `kind` says what a corner is: Education, Internship or Project. Projects are never presented as jobs or degrees.
// `evidence` lists the projects (slugs in projects.js) that are the real material behind a card.
// `point` is the one extra detail on a card. Each is taken from this site's own project descriptions (src/content/projects.js).
// TODO(Sunny): the BTech card has no `point`: nothing in the project says what you did or learned there beyond the degree title.
export const milestones = [
  { year: null, tag: 'Foundation', kind: 'Education', title: 'BTech Computer Science + Cybersecurity', text: 'The foundation: software, networks and security.' },
  { year: 2024, kind: 'Internship', title: 'Security internship', text: 'Recon and scanning work, later rebuilt as web-security-scanner.', point: 'Web Security Scanner runs Nmap scans on approved targets, with dork generation and subdomain enumeration, in Flask.', evidence: ['web-security-scanner'] },
  { year: null, tag: 'Postgraduate', kind: 'Education', title: 'MSc Artificial Intelligence, Ulster', text: 'Robotics, ML and AI ethics coursework, plus the warehouse robot group project.', point: 'In the group project, a Gazebo patrol robot navigates with Bug2 or Q-learning and detects fire and intruders.', evidence: ['warehouse-robot'] },
  { year: 2026, kind: 'Project', title: 'Financial-NRF', text: 'Dissertation and paper draft: do LLM reliability scores notice when the source is wrong? Mostly no.', point: 'Tested on two finance datasets and four open models.', evidence: ['financial-nrf'] },
  { year: 2026, kind: 'Project', title: 'Tom & Ollie relaunch', text: 'First real client: a storefront for a Belfast cheesemonger.', point: 'FastAPI backend with chilled-aware checkout and an order admin.', evidence: ['tom-and-ollie'] },
  { year: 2026, kind: 'Project', title: 'Warden and AEGIS', text: 'AI security agents that only ship a defence after it passes validation.', point: 'Warden enforces a new defence only after an 8-stage validation gate. AEGIS proves a blocking rule will not break real traffic before it deploys it.', evidence: ['warden', 'aegis'] },
];

// Not a milestone: where the route is heading. Shown apart from the corners, never lit on the map.
export const ahead = { title: 'The next corner', text: 'AI engineering, AI security or MLOps. Let’s talk.' };
