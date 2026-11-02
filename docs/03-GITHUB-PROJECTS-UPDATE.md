# GitHub Projects Update Checklist

**Date:** 2 Nov 2026 · Checked against the 19 public repos on `github.com/aaronsunny007`.

The portfolio links to these repos, so the repos are part of the portfolio. A recruiter who clicks through to a repo with no description and a broken README heading loses the impression the site just made.

---

## 1. What's wrong today

| Issue | Repos affected |
|---|---|
| Strong recent projects **missing from the portfolio** | Warden, ledger, Financial-NRF, AI-CySec-defence-system (AEGIS), pulsegrid-belfast-smart-city-intelligence, tom.n.ollie |
| **No GitHub description** (the one-liner under the repo name) | Warden, portfolio-website, AI-CySec-defence-system, cicd-mlops-pipeline, tom.n.ollie, pulsegrid-belfast-smart-city-intelligence, web-security-scanner, ledger, Financial-NRF, rl-gridworld, github-ai-agent, autonomous-warehouse-surveillance-robot, smart-ai-agent, loan-default-prediction |
| **README headings show a literal `\#`** (escaped markdown, so the title renders as text, not a heading) | smart-ai-agent, loan-default-prediction, ros-formation-control |
| **No README at all** | rl-gridworld |
| README title is a coursework code, not a project name | autonomous-warehouse-surveillance-robot (`# com760cw2_group9`) |
| Repo name doesn't match the project name | AI-CySec-defence-system (README says AEGIS), pulsegrid-belfast-smart-city-intelligence (README says PulseCity SmartGrid, and it covers London first) |
| Description is just the repo name | dsm-regulatory-compliance-ontology |
| portfolio-website README is the Vite template | portfolio-website |

## 2. Profile-level fixes

- [ ] **Pin 6 repos** on your profile, the Pro class below: Warden, ledger, Financial-NRF, AI-CySec-defence-system, llm-eval-redteam, pulsegrid-belfast-smart-city-intelligence.
- [ ] **Profile README:** create a repo named exactly `aaronsunny007` with a `README.md`. Three lines: who you are, what you're looking for, link to the portfolio. Optionally a small table of the 6 pinned projects.
- [ ] **Profile bio, location, website** fields: set website to the portfolio URL.
- [ ] **Social preview image** (Settings → Social preview, 1280×640) for each Pro and Competition repo. Make these in the portfolio's style (dark asphalt, class badge, project name). The same images, cropped to 1600×1000, become the Garage bay images, so you only design them once.

## 3. Per-repo plan

Class meanings are in PRD §7.5. "Description" is a draft for the GitHub About box (≤ 350 chars). "Topics" go in the About box too; they help search.

### PRO (featured bays, pinned)

| Repo | Description (draft) | Topics | To do |
|---|---|---|---|
| **Warden** | Security gateway between AI agents and MCP tool servers. Inspects tool descriptions, arguments and outputs, tracks taint, and only enforces new defences after an 8-stage validation gate. | `mcp` `ai-security` `llm-agents` `prompt-injection` `red-team` | Add description + topics; add a diagram or GIF at the top of README |
| **ledger** | Ask questions about company annual reports and get cited answers. Every number is recomputed by a calculator before you see it. 85.5% on 207 scored test questions. | `rag` `llm` `finance` `sec-filings` `evaluation` | Add description; add a screenshot of a cited answer |
| **Financial-NRF** | Do LLM "reliability scores" notice when the source document is wrong? Tested on two finance datasets and four open models: mostly no. Paper draft and live demo. | `llm-evaluation` `rag` `hallucination` `finqa` `research` | Add description; set website field to the live demo |
| **AI-CySec-defence-system** (AEGIS) | Autonomous web-app defence agent: spots an attack campaign, writes a new blocking rule, proves it won't break legitimate traffic, then deploys it without a restart. | `ai-security` `waf` `autonomous-agents` `intrusion-detection` | Consider renaming the repo to `aegis` (GitHub redirects old URLs); add description |
| **llm-eval-redteam** | (has one) Shorten to: "Red-team an LLM app with versioned attacks and a validated AI judge, compare defences statistically, and gate releases in CI." | `llm` `red-teaming` `prompt-injection` `ci` `github-action` | Add topics |
| **pulsegrid-belfast-smart-city-intelligence** (PulseCity) | Transport reliability lakehouse on Azure Databricks: polls every London Underground, DLR and Overground line every 5 minutes and measures how reliably each line actually ran. Belfast next. | `databricks` `lakehouse` `azure` `data-engineering` `tfl` | Consider renaming to `pulsecity-smartgrid`; add description |

### COMPETITION

| Repo | Description (draft) | Topics | To do |
|---|---|---|---|
| **tom.n.ollie** | Storefront relaunch for Tom & Ollie, Belfast cheesemongers: FastAPI backend with chilled-aware checkout and order admin, plus a no-build storefront. | `fastapi` `ecommerce` `client-work` | Add description; screenshot of the storefront; say "client project" in README |
| **fair-federated-learning-healthcare-ai** | (has one) Fine as is. | `federated-learning` `fairness` `flower` `aif360` `healthcare` | Add topics; add the baseline vs fair-FL results chart to README |
| **cicd-mlops-pipeline** | Predicts CI/CD stage failures from run features; model served with FastAPI and packaged in Docker, with an automated train-evaluate-deploy pipeline. | `mlops` `fastapi` `docker` `ci-cd` | Add description |
| **github-ai-agent** | Fetches real GitHub issues and uses an LLM (Groq) to analyse them and suggest likely fixes. | `llm` `github-api` `ai-agent` `groq` | Add description; remove the emoji from the H1 (optional) |
| **autonomous-warehouse-surveillance-robot** | Gazebo warehouse patrol robot: Bug2 or Q-learning navigation plus motion, fire and intruder detection on its camera. Group coursework (COM760). | `ros` `gazebo` `q-learning` `robotics` `computer-vision` | Change README title from `com760cw2_group9` to the project name; credit teammates; add description |

### SPORT

| Repo | Description (draft) | Topics | To do |
|---|---|---|---|
| **ros-formation-control** | (has one) Fine. | `ros` `multi-agent` `turtlesim` | **Fix escaped `\#` headings** in README |
| **smart-ai-agent** | Conversational agent with RAG, memory, entity tracking, web search and local LLM support, in a Streamlit UI. | `rag` `llm` `streamlit` `ai-agent` | **Fix escaped `\#` headings**; add description |
| **loan-default-prediction** | Predicts loan default risk on the Lending Club dataset with logistic regression, decision tree and random forest. | `machine-learning` `classification` `scikit-learn` | **Fix escaped `\#` headings**; add description; put the results table at the top |
| **web-security-scanner** | Educational rebuild of a 2024 internship project: Flask app for Nmap scans on approved demo targets, Google dork generation and subdomain enumeration. | `security` `flask` `nmap` `reconnaissance` | Add description; keep the authorised-use disclaimer prominent |
| **dsm-regulatory-compliance-ontology** | OWL ontology that models regulatory compliance for deep-sea mining, with HermiT reasoning over harm and compensation rules. | `ontology` `owl` `protege` `knowledge-representation` | Replace the description (currently just the repo name) |

### STREET (list view only, not pinned)

| Repo | Description (draft) | Topics | To do |
|---|---|---|---|
| **secure-password-manager** | (has one) Fine. | `flask` `security` `2fa` `encryption` | Add topics |
| **rl-gridworld** | Reinforcement learning agents in a GridWorld environment. | `reinforcement-learning` `gridworld` | **Write a README** (what it does, how to run, one results plot) or archive it |
| **portfolio-website** | 3D drift-themed portfolio built with React Three Fiber and GSAP. | `portfolio` `threejs` `react-three-fiber` `gsap` | Replace Vite template README once the rebuild starts |

## 4. README template for Pro and Competition repos

Keep it short at the top; a recruiter reads the first screen only.

```markdown
# Project Name

One sentence: what it does and for whom.

![screenshot or GIF](docs/hero.png)

**Result:** the headline number or outcome, in plain words.

## How it works
3–5 bullets or one diagram.

## Run it
The fewest commands that work.

## Stack
Python · FastAPI · …

## Limitations
What it doesn't do yet. (You already do this well in Warden and Ledger; keep it.)
```

## 5. How to apply this

I can't edit these repos from this session (access here is limited to `portfolio-website`). Two ways to do it:

1. **By hand** on github.com: About box (gear icon) for description, website and topics; Settings → Social preview for the image; edit README in the browser for the `\#` fixes.
2. **With the GitHub CLI**, one command per repo:

```bash
gh repo edit aaronsunny007/Warden --description "Security gateway between AI agents and MCP tool servers. Inspects tool descriptions, arguments and outputs, tracks taint, and only enforces new defences after an 8-stage validation gate." --add-topic mcp,ai-security,llm-agents,prompt-injection,red-team
```

Or start a Claude session with access to all your repos and ask it to apply this file.
