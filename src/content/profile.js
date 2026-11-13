// All site copy lives in src/content. Edit here, not in components.
export const profile = {
  first: 'Sunny',
  last: 'Aaron',
  // Legal name, shown only as the home-page headline. Everywhere else the site says Sunny / Sunny Aaron.
  legal: { given: 'Aaron Prakash', family: 'Gandi' },
  role: 'AI Engineer',
  focus: 'AI engineer · AI security · MLOps',
  tagline: 'Hand me the problem.',
  intro: 'I build AI systems, write the checks and work through what breaks. From the first working version to the details that make it usable, I take ownership of the build.',
  location: 'Belfast, Northern Ireland',
  status: 'Open to work',
  statusTitle: 'Open to work',
  github: 'https://github.com/aaronsunny007',
  linkedin: 'https://www.linkedin.com/in/aaron-prakash-gandi-9432bb223',
  // TODO(Sunny): add a public email and a CV (PDF in public/cv/, then './cv/...'). While these are empty, no email or CV control is shown anywhere.
  email: '',
  cv: '',
  licenceNo: 'Driver ID SA-007',
  licence: [
    ['Discipline', 'AI engineering · Security · MLOps'],
    ['Base', 'Belfast, Northern Ireland'],
    ['AI studies', 'MSc Artificial Intelligence, Ulster University'], // education context only: not stated as awarded
    ['Foundation', 'BTech, Computer Science and Cybersecurity'],
    ['Approach', 'Take ownership. Follow through.'],
    ['Off duty', 'Street cars and racing · Football · Biryani'],
  ],
  // Behind the Wheel (sections/PitCrew): a pass, a statement and three project references.
  // The pass photograph is easy to swap: change `src`, `alt` and the crop (`pos` is the focal point, `zoom` how far in).
  pass: { src: 'images/journey/02-security.webp', alt: 'Sunny Aaron smiling in a cream polo, with a blue-and-yellow macaw on his shoulder.', pos: '52% 30%', zoom: 1.45, reg: 'SA–007' },
  statement: {
    lead: 'The difficult bit has my attention.',
    body: [
      'I’m Sunny, an AI engineer in Belfast. I build the system and take responsibility for the awkward parts: an answer that sounds right but isn’t, a defence that blocks the wrong thing, a pipeline that fails halfway through.',
      'If the work needs a tool I haven’t used, I get into it. I build a working version, test the assumptions and work through the failures. I want to understand the problem well enough to finish the job.',
    ],
    off: 'Away from the keyboard: street cars, racing, football and biryani.',
  },
  // `slug` finds the project (and its repository) in projects.js.
  references: [
    { slug: 'ledger', question: 'Where did the answer come from?', line: 'Report citations and numerical checks.' },
    { slug: 'warden', question: 'What is this tool request carrying?', line: 'Taint tracking and defence validation.' },
    { slug: 'financial-nrf', question: 'What if the source is wrong?', line: 'Reliability scores under incorrect supporting material.' },
  ],
};

// The roles panel, shared by the hero and the Finish Line. Target roles only: not past titles, not a claim of seniority.
export const rolesPanel = {
  heading: 'Put me on the build.',
  intro: 'My focus is AI engineering, security and the software that connects them.',
  support: 'I’m looking for work I can take responsibility for, with a team that cares about the details.',
  label: 'Roles Sunny Aaron is targeting',
};

export const roles = [
  { group: 'Build', titles: ['AI Engineer', 'Applied AI Engineer', 'Machine Learning Engineer'] },
  { group: 'Test & defend', titles: ['AI Security Engineer', 'LLM Evaluation Engineer'] },
  { group: 'Run & deliver', titles: ['MLOps Engineer', 'Python Software Engineer', 'Data Engineer'] },
];

export const roleCount = roles.reduce((n, g) => n + g.titles.length, 0);

// `kind` drives the card's colour (Education, Internship or Project); `meta` is the line shown. Projects are never presented as jobs or degrees.
// `evidence` lists the projects (slugs in projects.js) behind a card. `point` is the detail behind "Read the details". `status` is a truthful qualifier.
// The journey: six chapters, each with one of Aaron's own photographs. `photo.pos` / `posM` are the focal points for the wide and the stacked layout;
// swap a photo by changing `src`, `alt` and the focal points here. Chapter 05's file is awaited: drop it in at the path below.
export const milestones = [
  { id: 'foundation', label: 'Foundation', kind: 'Education', meta: 'Education / Foundation', title: 'Software first. Security alongside it.', text: 'My BTech in Computer Science and Cybersecurity laid the groundwork in software, networks and how systems fail.',
    photo: { src: 'images/journey/01-foundation.webp', alt: 'Sunny Aaron in a green hoodie on a ferry deck, looking out over the water with a can in his hand.', pos: '47% 58%', posM: '47% 55%' } },
  { id: 'security', label: 'Security', kind: 'Internship', meta: 'Internship / 2024', title: 'From reconnaissance to tooling.', text: 'Reconnaissance and scanning work during my internship later informed my Web Security Scanner project.',
    notes: 'A Flask application bringing together Nmap scans on approved targets, subdomain enumeration and search-query generation.',
    evidence: [{ slug: 'web-security-scanner', label: 'Explore Web Security Scanner' }],
    photo: { src: 'images/journey/02-security.webp', alt: 'Sunny Aaron smiling in front of carved stone doors, with a blue-and-yellow macaw on his shoulder.', pos: '45% 30%', posM: '45% 25%' } },
  { id: 'ulster', label: 'Ulster', kind: 'Education', meta: 'Education / Artificial Intelligence', title: 'A wider field of problems.', text: 'My MSc work brought machine learning, robotics and AI ethics together, including a group warehouse patrol robot.',
    notes: 'The robot navigates in Gazebo using Bug2 or Q-learning, with fire and intruder detection. This was a group project.',
    evidence: [{ slug: 'warehouse-robot', label: 'Explore the patrol robot' }],
    photo: { src: 'images/journey/03-ulster.webp', alt: 'Sunny Aaron in a white shirt and sunglasses, leaning on a red motorcycle beside the water at sunset.', pos: '46% 14%', posM: '46% 12%' } },
  { id: 'financial-nrf', label: 'Financial-NRF', kind: 'Project', meta: 'Research project / 2026', title: 'A good score. A bad source.', text: 'My dissertation and paper draft examine whether reliability scores notice incorrect source material. Across the evaluated settings, they mostly missed it.',
    notes: 'The study covers two financial datasets and four open models, comparing how reliability scores respond when the supporting material changes.',
    evidence: [{ slug: 'financial-nrf', label: 'Explore Financial-NRF' }],
    photo: { src: 'images/journey/04-financial-nrf.webp', alt: 'Sunny Aaron laughing in sunglasses and a patterned shirt at a café table, with an iced drink.', pos: '50% 52%', posM: '50% 52%' } },
  { id: 'tom-and-ollie', label: 'Tom & Ollie', kind: 'Project', meta: 'Client relaunch / 2026', title: 'Built around a real business.', text: 'A storefront relaunch for a Belfast cheesemonger, covering the backend, chilled-delivery checkout and order administration.',
    status: 'Built · Not deployed',
    notes: 'The relaunch was built with a FastAPI backend but did not proceed to deployment. The repository documents the storefront and backend work.',
    evidence: [{ slug: 'tom-and-ollie', label: 'Explore Tom & Ollie' }],
    photo: { src: 'images/journey/05-tom-and-ollie.webp', alt: 'Sunny Aaron in a cream polo, looking to one side in front of a stone wall, with a castle on a rock behind him.', pos: '68% 47%', posM: '68% 46%' } },
  { id: 'warden-aegis', label: 'Warden & AEGIS', kind: 'Project', meta: 'Security projects / 2026', title: 'The defence gets tested too.', text: 'Warden validates candidate defences before enforcement. AEGIS checks generated blocking rules against traffic before deployment.',
    notes: 'Warden uses an eight-stage validation gate for candidate defences. AEGIS connects attack detection, rule generation and traffic checks before rule deployment.',
    evidence: [{ slug: 'warden', label: 'Explore Warden' }, { slug: 'aegis', label: 'Explore AEGIS' }],
    photo: { src: 'images/journey/06-warden-aegis.webp', alt: 'Sunny Aaron in a navy zip jacket and sunglasses, looking to one side on a bridge, with stone and painted houses behind.', pos: '50% 46%', posM: '50% 46%' } },
];

// Not a milestone: where the route is heading. Shown apart from the corners, never lit on the map.
export const journeyHead = { title: 'Behind the build.', intro: 'The foundations, the projects and the decisions that brought me here.' };
export const ahead = { meta: 'Ahead / Next move', title: 'Bring a harder problem.', text: 'I’m looking for an engineering team with work to own: systems to build, failures to investigate and decisions to follow through.', action: 'Let’s talk', label: 'Ahead: next career direction' };
