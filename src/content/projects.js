const gh = (repo) => `https://github.com/aaronsunny007/${repo}`;

// `art` picks the schematic, `flow` is its caption. Diagrams are conceptual: no screenshots and no invented data.
// class: PRO | COMPETITION | SPORT | STREET (see the DRIFT design system's ClassBadge)
export const projects = [
  { slug: 'warden', purpose: 'Gateway between AI agents and MCP tool servers', title: 'Warden', cls: 'PRO', area: 'AI Security', pitch: 'A security gateway between AI agents and MCP tool servers. It tracks taint and only enforces a new defence after an 8-stage validation gate.', repo: gh('Warden'), art: 'gate', flow: 'Agent request, then eight validation gates, then the MCP tool server', facts: ['8-stage validation gate', 'Taint tracking', 'Sits between agents and MCP tool servers'] },
  { slug: 'ledger', purpose: 'Cited answers from annual reports', title: 'Ledger', cls: 'PRO', area: 'LLM / RAG', pitch: 'Cited answers from company annual reports. A calculator recomputes every number. 85.5% on 207 scored test questions.', repo: gh('ledger'), art: 'curve', flow: 'Annual report, retrieval, calculator check, cited answer', facts: ['85.5% on 207 scored test questions', 'Every number recomputed by a calculator', 'Answers cite the annual report'] },
  { slug: 'financial-nrf', purpose: 'Do reliability scores notice a wrong source?', title: 'Financial-NRF', cls: 'PRO', area: 'LLM evaluation', pitch: 'Do LLM reliability scores notice when the source document is wrong? Two finance datasets, four open models: mostly no.', repo: gh('Financial-NRF'), art: 'bars', flow: 'A reliability score beside a correct and a wrong source', facts: ['Two finance datasets', 'Four open models', 'Finding: reliability scores mostly miss a wrong source'] },
  { slug: 'aegis', purpose: 'Autonomous web-app defence', title: 'AEGIS', cls: 'PRO', area: 'AI Security', pitch: 'Autonomous web-app defence: spots an attack campaign, writes a blocking rule, proves it won’t break real traffic, deploys it live.', repo: gh('AI-CySec-defence-system'), art: 'shield', flow: 'Attack campaign, blocking rule, traffic check, live deploy', facts: ['Writes the blocking rule itself', 'Checks it against real traffic first', 'Then deploys it live'] },
  { slug: 'llm-eval-redteam', purpose: 'Red-team an LLM app, gate releases in CI', title: 'Red Team', cls: 'PRO', area: 'AI Security', pitch: 'Red-team an LLM app with versioned attacks and a validated AI judge, compare defences statistically, gate releases in CI.', repo: gh('llm-eval-redteam'), art: 'grid', flow: 'Versioned attacks, AI judge, CI release gate', facts: ['Versioned attacks', 'Validated AI judge', 'Release gate in CI'] },
  { slug: 'pulsecity', purpose: 'Transport reliability lakehouse on Azure', title: 'PulseCity', cls: 'PRO', area: 'Data engineering', pitch: 'A transport reliability lakehouse on Azure Databricks. Polls every Tube, DLR and Overground line every 5 minutes.', repo: gh('pulsegrid-belfast-smart-city-intelligence'), art: 'pulse', flow: 'Tube, DLR and Overground polled every 5 minutes into one lakehouse', facts: ['Tube, DLR and Overground', 'Polled every 5 minutes', 'Azure Databricks lakehouse'] },

  { slug: 'tom-and-ollie', title: 'Tom & Ollie', cls: 'COMPETITION', area: 'Web · Client', pitch: 'Storefront relaunch for Belfast cheesemongers: FastAPI backend with chilled-aware checkout and order admin.', repo: gh('tom.n.ollie') },
  { slug: 'fair-fl', title: 'Fair Federated Learning', cls: 'COMPETITION', area: 'ML · Healthcare', pitch: 'Federated learning for healthcare AI with fairness constraints and privacy preserved across sites.', repo: gh('fair-federated-learning-healthcare-ai') },
  { slug: 'cicd-mlops', title: 'CI/CD MLOps Pipeline', cls: 'COMPETITION', area: 'MLOps', pitch: 'Predicts CI/CD stage failures; served with FastAPI in Docker behind an automated train-evaluate-deploy pipeline.', repo: gh('cicd-mlops-pipeline') },
  { slug: 'github-ai-agent', title: 'GitHub AI Agent', cls: 'COMPETITION', area: 'LLM agents', pitch: 'Pulls real GitHub issues and uses an LLM to analyse them and suggest likely fixes.', repo: gh('github-ai-agent') },
  { slug: 'warehouse-robot', title: 'Warehouse Patrol Robot', cls: 'COMPETITION', area: 'Robotics · Group', pitch: 'Gazebo patrol robot with Bug2 or Q-learning navigation and motion, fire and intruder detection.', repo: gh('autonomous-warehouse-surveillance-robot') },

  { slug: 'ros-formation', title: 'ROS Formation Control', cls: 'SPORT', area: 'Robotics', pitch: 'Multi-agent formation control in ROS.', repo: gh('ros-formation-control') },
  { slug: 'smart-ai-agent', title: 'Smart AI Agent', cls: 'SPORT', area: 'LLM / RAG', pitch: 'Conversational agent with RAG, memory, web search and local LLM support.', repo: gh('smart-ai-agent') },
  { slug: 'loan-default', title: 'Loan Default Prediction', cls: 'SPORT', area: 'ML', pitch: 'Default risk on Lending Club data with three classic models compared.', repo: gh('loan-default-prediction') },
  { slug: 'web-security-scanner', title: 'Web Security Scanner', cls: 'SPORT', area: 'Security', pitch: 'Nmap scans on approved targets, dork generation and subdomain enumeration in Flask.', repo: gh('web-security-scanner') },
  { slug: 'dsm-ontology', title: 'DSM Compliance Ontology', cls: 'SPORT', area: 'Knowledge graphs', pitch: 'OWL ontology for deep-sea mining compliance with HermiT reasoning.', repo: gh('dsm-regulatory-compliance-ontology') },
  { slug: 'password-manager', title: 'Secure Password Manager', cls: 'STREET', area: 'Security', pitch: 'Flask password manager with encryption and 2FA.', repo: gh('secure-password-manager') },
  { slug: 'rl-gridworld', title: 'RL GridWorld', cls: 'STREET', area: 'Reinforcement learning', pitch: 'RL agents learning a GridWorld.', repo: gh('rl-gridworld') },
];

// Short names used in the toolkit's "Used in" lines -> project slug, so each skill points at real code.
const EVIDENCE = {
  Warden: 'warden', Ledger: 'ledger', NRF: 'financial-nrf', AEGIS: 'aegis', 'llm-eval-redteam': 'llm-eval-redteam', PulseCity: 'pulsecity',
  'Tom & Ollie': 'tom-and-ollie', 'Fair-FL': 'fair-fl', 'CI/CD MLOps': 'cicd-mlops', 'GitHub agent': 'github-ai-agent', 'Warehouse robot': 'warehouse-robot',
  'Loan default': 'loan-default', scanner: 'web-security-scanner',
};
export const evidenceProject = (alias) => projects.find((p) => p.slug === EVIDENCE[alias]);
