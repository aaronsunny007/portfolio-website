# START HERE: How to rebuild the portfolio

You have 4 docs:

| File | Use it for |
|---|---|
| `01-PROJECT-RESEARCH.md` | Background: why each decision was made |
| `02-PRD.md` | The build spec. This is the one Claude builds from. |
| `03-GITHUB-PROJECTS-UPDATE.md` | Fixing your 19 GitHub repos |
| `ALL-DOCS-COMBINED.md` | All three in one file, for pasting into a chat in one go |

---

## Step 1: Answer the open questions (10 minutes)

Write your answers down. You'll paste them into the first session.

1. **Public name:** "Aaron Sunny" or "Aaron Prakash Gandi"?
2. **Years:** BSc (which university, start–end), MSc AI at Ulster (start–end), any jobs or internships (the 2024 internship from web-security-scanner?)
3. **Target roles and availability**, e.g. "AI Engineer / AI Security, available June 2027"
4. **Car model:** keep the current one (only if you know where it came from and its licence allows it) or replace it?
5. **Intro video:** drop it (recommended) or keep a compressed version?
6. **Wordmark text:** "AARON", your full name, or a handle?
7. **LinkedIn URL**, and a **CV PDF** (save it as `public/cv/Aaron-CV.pdf`)

## Step 2: Pick where to build

**Option A (recommended): Claude Code with your repo connected.** Claude can read the docs, edit files, run the site and push. The docs are already in your repo on the branch `claude/zen-knuth-1oqvrt`, so you don't need to paste anything. Use **Prompt 1A** below.

**Option B: A normal Claude chat (claude.ai).** Claude can't see your repo, so you paste the docs in and copy the code it gives you into your project yourself. Attach or paste `ALL-DOCS-COMBINED.md` and use **Prompt 1B** below.

## Step 3: Install the skills (Option A only, once)

In your project folder, run:

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

```bash
npx skills add https://github.com/greensock/gsap-skills
```

```bash
npx skills add https://github.com/emalorenzo/three-agent-skills --skill r3f-best-practices
```

```bash
npx skills add vercel-labs/agent-skills
```

Then inside Claude Code:

```
/plugin marketplace add pbakaus/impeccable
```

Read each skill's `SKILL.md` before you install it (they run with your permissions).

## Step 4: Build one phase per session

The PRD's §12 has 7 phases. Do **one phase per chat session**. Long sessions lose track; short ones stay sharp. After each phase: run the site, check it on your phone, commit, push.

| Session | Phase | You'll have at the end |
|---|---|---|
| 1 | Phase 0: Clean-up | Dead code gone, TypeScript, folders, live deploy on GitHub Pages |
| 2 | Phase 1: Content-first site | A complete, fast site with no 3D. **Recruiters can use it from here.** |
| 3 | Phase 2: Assets | Optimised car model (≤ 2.5 MB), project images |
| 4 | Phase 3: Stage + Ignition | The 3D hero: car drifts in front of your name |
| 5 | Phase 4: Drift + Track | Skid marks, smoke, the timeline track |
| 6 | Phase 5: Garage + Pit Crew + Finish | Project bays, toolkit, contact finale |
| 7 | Phase 6: Polish + QA | Sound, accessibility, Lighthouse, final copy |

Do the GitHub fixes in `03-GITHUB-PROJECTS-UPDATE.md` any time. They take about an hour by hand. Doing them before Phase 1 helps, because the portfolio links to those repos.

---

## Prompts to paste

### Prompt 1A: first session in Claude Code (repo connected)

```
I'm rebuilding my portfolio. The full plan is in docs/ on the branch
claude/zen-knuth-1oqvrt: read docs/02-PRD.md fully, and docs/01-PROJECT-RESEARCH.md
sections 1–2 for context.

Work on branch claude/zen-knuth-1oqvrt. Do Phase 0 from PRD §12 only, nothing from
later phases.

My answers to the open questions (PRD §15):
1. Name: ...
2. Years: ...
3. Roles/availability: ...
4. Car model: ...
5. Intro video: ...
6. Wordmark: ...
7. LinkedIn: ...   CV: in public/cv/

When Phase 0 is done: run lint and build, list what you changed, commit, push,
and tell me exactly what to check.
```

### Prompt 1B: first session in a normal Claude chat (no repo access)

```
I'm rebuilding my portfolio website (React + Vite + React Three Fiber + GSAP).
Attached/pasted below are my research doc, PRD and GitHub checklist.

Read the PRD fully. We'll build it one phase at a time (PRD §12). Today: Phase 0 only.

You can't see my repo, so:
- Give me complete files, not fragments, each with its full path.
- Give me the terminal commands to run, in order.
- Tell me which existing files to delete.
My current src/ has: App.jsx, main.jsx, index.css, App.css, pages/Home.jsx,
pages/Garage.jsx, components/{AboutPage,BMWScene,Hero,IntroScene,IntroSequence,
Navbar,Projects}.jsx.

My answers to the open questions (PRD §15):
1. Name: ...
2. Years: ...
3. Roles/availability: ...
4. Car model: ...
5. Intro video: ...
6. Wordmark: ...
7. LinkedIn: ...

[paste ALL-DOCS-COMBINED.md here, or attach it]
```

### Prompt for every later session (change the phase number)

```
Continue the portfolio rebuild. Read docs/02-PRD.md (and docs/PROGRESS.md if it
exists). Do Phase N only.

Before you finish:
- run lint and build
- screenshot the changed sections at 390px, 820px and 1440px wide
- check the matching items in PRD §13
- update docs/PROGRESS.md with what's done and what's left
- commit and push
```

In a normal chat (Option B), paste the PRD again at the start of each new chat, plus a short note of what's already done.

### Prompt for the GitHub clean-up (needs a session with access to all your repos)

```
Apply docs/03-GITHUB-PROJECTS-UPDATE.md to my GitHub repos (aaronsunny007):
set the descriptions and topics, fix the escaped \# headings in smart-ai-agent,
loan-default-prediction and ros-formation-control, and retitle the README in
autonomous-warehouse-surveillance-robot. Don't rename any repos without asking me.
Show me each change before you push it.
```

---

## Tips

- **Don't skip Phase 1.** A finished site with no 3D beats a half-finished 3D site.
- **One phase per session.** If a session starts drifting into the next phase, stop it and start a new one.
- **Check on your phone after every phase.** Most visitors will see it there first.
- **Run the copy through the humanizer skill** before Phase 6 ends. Recruiters notice AI-written text.
- **If something looks wrong**, take a screenshot and paste it in with "this section should match PRD §6.x; fix it".
