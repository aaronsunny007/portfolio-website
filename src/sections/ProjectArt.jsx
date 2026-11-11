// Project artwork. Every drawing is conceptual and built from what the project's own description says: no screenshots, no measurements.
// Each one is complete while static. Its one response (a request crossing gates, a bar filling, a packet blocked) plays once when it is
// selected or replayed, and the final frame is the resting state, so reduced motion simply shows the finished drawing.
// Colour: `--ac` comes from the project's accent (see .ac-* in styles/projects.css).

const at = (d, dur, delay, rest) => ({ offsetPath: `path('${d}')`, '--dur': `${dur}s`, '--d': `${delay}s`, ...(rest ? { '--rest': rest } : {}) });
const wait = (s) => ({ '--d': `${s}s` });

// ---------- flagship art, 400 x 200 ----------
const GATE_X = Array.from({ length: 8 }, (_, i) => 112 + i * 16);
const gateDelay = (x) => (0.6 + ((x - 112) / 112) * 1.4).toFixed(2);

const FLAGSHIP = {
  // Warden: ordinary requests pass the gateway to the tools; a candidate defence takes its own route through eight validation stages before enforcement
  gate: (
    <>
      <rect className="node" x="14" y="40" width="64" height="40" rx="3" />
      <text x="46" y="64">AGENT</text>
      <rect className="node hot" x="166" y="36" width="68" height="48" rx="3" />
      <text x="200" y="56">SECURITY</text>
      <text x="200" y="70">GATEWAY</text>
      <rect className="node" x="322" y="40" width="64" height="40" rx="3" />
      <text x="354" y="64">MCP TOOLS</text>
      <path className="dim" d="M78 60 H166 M234 60 H322" />
      <circle className="pkt trav" r="5" style={at('M78 60 H322', 1.8, 0.2, '100%')} />
      <rect className="node" x="14" y="122" width="72" height="40" rx="3" />
      <text x="50" y="140">CANDIDATE</text>
      <text x="50" y="154">DEFENCE</text>
      <path className="dim" d="M86 142 H258" />
      <text x="168" y="116">8-STAGE VALIDATION</text>
      {GATE_X.map((x) => (
        <g key={x}>
          <path className="ac lit" style={wait(gateDelay(x))} d={`M${x} 130 V136 M${x} 148 V154`} />
          <circle className="acf lit" style={wait(gateDelay(x))} cx={x} cy="142" r="3" />
        </g>
      ))}
      <circle className="pkt trav" r="5" style={at('M86 142 H258', 2, 0.6, '100%')} />
      <rect className="node hot" x="258" y="122" width="84" height="40" rx="3" />
      <text x="300" y="146">ENFORCEMENT</text>
      <path className="ac dashed" d="M300 122 V102 H200 V84" />
    </>
  ),
  // Ledger: a passage in the report is retrieved, recomputed, and cited in the answer
  curve: (
    <>
      <rect className="node" x="18" y="30" width="96" height="140" rx="3" />
      <path className="dim" d="M32 50 H100 M32 62 H100 M32 74 H88 M32 126 H100 M32 138 H92 M32 150 H100" />
      <rect className="acf passage in" style={wait(0.2)} x="28" y="88" width="76" height="26" rx="2" />
      <path className="dim" d="M32 96 H96 M32 106 H84" />
      <text x="66" y="188">ANNUAL REPORT</text>
      <path className="ln draw" style={wait(0.5)} pathLength="1" d="M114 101 H148" />
      <circle className="node" cx="170" cy="101" r="22" />
      <path className="ln" d="M186 117 L198 129" />
      <text x="170" y="150">RETRIEVE</text>
      <text x="271" y="93">CHECK</text>
      <path className="ln draw" style={wait(0.8)} pathLength="1" d="M192 101 H214" />
      <rect className="node" x="214" y="82" width="38" height="38" rx="3" />
      <text x="233" y="107" className="big">=</text>
      <text x="233" y="168">CALCULATE</text>
      <path className="ln draw" style={wait(1.1)} pathLength="1" d="M252 101 H290" />
      <rect className="node hot in" style={wait(1.3)} x="290" y="52" width="94" height="96" rx="3" />
      <path className="dim in" style={wait(1.4)} d="M302 112 H372 M302 124 H360 M302 136 H368" />
      <rect className="chip in" style={wait(1.5)} x="302" y="64" width="40" height="22" rx="2" />
      <text className="chipt in" style={wait(1.5)} x="322" y="79">[1] ✓</text>
      <text x="337" y="170">CITED ANSWER</text>
      <path className="ac dashed in" style={wait(1.6)} d="M322 64 C322 6 66 6 66 88" />
    </>
  ),
  // Financial-NRF (illustrative): the reliability score is compared between a correct and an incorrect source
  bars: (
    <>
      <g>
        <rect className="node" x="24" y="40" width="158" height="62" rx="3" />
        <path className="dim" d="M40 58 H160 M40 72 H150 M40 86 H156" />
        <path className="ac" d="M160 52 l6 7 l12 -14" />
        <text x="103" y="120">CORRECT SOURCE</text>
      </g>
      <g>
        <rect className="node" x="218" y="40" width="158" height="62" rx="3" />
        <path className="dim" d="M234 58 H354 M234 86 H350" />
        <path className="warn" d="M234 72 H342" />
        <path className="warn" d="M348 50 l14 14 m0 -14 l-14 14" />
        <text x="297" y="120">INCORRECT SOURCE</text>
      </g>
      <text x="24" y="146" className="l">RELIABILITY SCORE</text>
      <rect className="track" x="24" y="152" width="158" height="12" />
      <rect className="fill grow" style={wait(0.2)} x="24" y="152" width="126" height="12" />
      <text x="218" y="146" className="l">RELIABILITY SCORE</text>
      <rect className="track" x="218" y="152" width="158" height="12" />
      <rect className="fill grow" style={wait(0.5)} x="218" y="152" width="120" height="12" />
      <path className="warn dashed in" style={wait(1.1)} d="M150 148 V170 M338 148 V170" />
      <text x="200" y="188" className="in" style={wait(1.1)}>COMPARE THE RESPONSE</text>
    </>
  ),
  // AEGIS: traffic flows to a protected service; the written rule stops the attack and lets real traffic through
  shield: (
    <>
      <defs>
        <radialGradient id="pa-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#5dff3c" stopOpacity="0.4" />
          <stop offset="1" stopColor="#5dff3c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="344" cy="104" rx="58" ry="46" fill="url(#pa-pool)" />
      <path className="svc" d="M344 62 L378 74 V104 C378 126 362 140 344 148 C326 140 310 126 310 104 V74 Z" />
      <text x="344" y="108">DEPLOY</text>
      <path className="dim" d="M20 76 H312 M20 128 H314" />
      <path className="ln dashed" d="M20 100 H238" />
      <text x="20" y="62" style={{ textAnchor: 'start' }}>TRAFFIC CHECK</text>
      <text x="20" y="150" style={{ textAnchor: 'start' }}>VALIDATE</text>
      <circle className="pkt ok trav" r="5" style={at('M20 76 H312', 1.6, 0.1, '100%')} />
      <circle className="pkt ok trav" r="5" style={at('M20 128 H314', 1.9, 0.4, '100%')} />
      <circle className="threat trav stop" r="7" style={at('M20 100 H238', 1.7, 0.2, '100%')} />
      <path className="rule in" style={wait(1.4)} d="M254 78 V122" />
      <path className="rule in" style={wait(1.4)} d="M244 78 H264 M244 122 H264" />
      <circle className="burst" style={wait(1.7)} cx="244" cy="100" r="10" />
      <text x="254" y="68">CANDIDATE RULE</text>
      <text x="120" y="90">ATTACK CAMPAIGN</text>
    </>
  ),
  // Red Team: versioned attacks go to a judge; the verdict holds or releases the build at the CI gate
  grid: (
    <>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect className={i === 2 ? 'atk hot' : 'atk'} x="20" y={42 + i * 30} width="84" height="20" rx="2" />
          <text x="30" y={56 + i * 30} style={{ textAnchor: 'start' }}>ATTACK v{i + 1}</text>
          <path className={i === 2 ? 'ac draw' : 'dim'} style={wait(0.2 + i * 0.1)} pathLength="1" d={`M104 ${52 + i * 30} C140 ${52 + i * 30} 140 100 168 100`} />
        </g>
      ))}
      <text x="62" y="26">VERSIONED ATTACKS</text>
      <circle className="node hot" cx="196" cy="100" r="30" />
      <text className="big" x="196" y="109">AI</text>
      <text x="196" y="150">MODEL JUDGE</text>
      <text x="196" y="58">RUN EVALUATION</text>
      <text x="260" y="80">COMPARE</text>
      <text x="260" y="91">DEFENCES</text>
      <path className="ln draw" style={wait(0.9)} pathLength="1" d="M226 100 H296" />
      <circle className="pkt trav" r="6" style={at('M104 112 C140 112 140 100 168 100 H296', 2, 0.5, '100%')} />
      <path className="gatebar in" style={wait(1.6)} d="M320 62 L350 100 L320 138 L290 100 Z" />
      <text className="big in" style={wait(1.6)} x="320" y="109">CI</text>
      <text x="320" y="164">RELEASE GATE</text>
      <path className="dim" d="M350 100 H384 M376 94 l8 6 l-8 6" />
      <text x="372" y="84">SHIP</text>
    </>
  ),
  // PulseCity: three transport lines polled into one lakehouse
  pulse: (
    <>
      <path className="route r1" d="M20 52 C60 52 70 84 110 84 S160 100 214 100" />
      <path className="route r2" d="M20 100 C60 100 90 60 130 60 S170 100 214 100" />
      <path className="route r3" d="M20 148 C70 148 90 124 130 124 S180 100 214 100" />
      {[[20, 52], [20, 100], [20, 148], [70, 80], [130, 60], [110, 84], [130, 124]].map(([x, y]) => (
        <circle key={`${x}-${y}`} className="stn" cx={x} cy={y} r="3.5" />
      ))}
      <text x="40" y="38" style={{ textAnchor: 'start' }}>TUBE</text>
      <text x="24" y="122" style={{ textAnchor: 'start' }}>DLR</text>
      <text x="40" y="170" style={{ textAnchor: 'start' }}>OVERGROUND</text>
      <circle className="pkt trav" r="4.5" style={at('M20 52 C60 52 70 84 110 84 S160 100 214 100 H292', 2.2, 0.2, '100%')} />
      <circle className="pkt trav" r="4.5" style={at('M20 100 C60 100 90 60 130 60 S170 100 214 100 H292', 2.2, 0.6, '100%')} />
      <circle className="pkt trav" r="4.5" style={at('M20 148 C70 148 90 124 130 124 S180 100 214 100 H292', 2.2, 1, '100%')} />
      <path className="ac" d="M214 100 H292" />
      <text x="253" y="80">5-MINUTE</text>
      <text x="253" y="91">COLLECTION</text>
      <path className="ln" d="M292 70 v60 c0 12 60 12 60 0 v-60 M292 70 c0 -12 60 -12 60 0 c0 12 -60 12 -60 0 M292 92 c0 12 60 12 60 0 M292 112 c0 12 60 12 60 0" />
      <path className="ac" d="M292 70 c0 -12 60 -12 60 0" />
      <text x="322" y="156">LAKEHOUSE</text>
      <text x="322" y="168">RELIABILITY ANALYSIS</text>
    </>
  ),
};

export function FlagshipArt({ kind, run = 0 }) {
  return (
    <svg key={run} className="pa" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path className="g" d="M0 50H400M0 100H400M0 150H400M100 0V200M200 0V200M300 0V200" />
      {FLAGSHIP[kind]}
    </svg>
  );
}

// ---------- full-garage vignettes, 160 x 100 ----------
const dot = (d, dur = 1.3, delay = 0, r = 3) => <circle className="vdot" r={r} style={at(d, dur, delay)} />;

const VIGNETTE = {
  // Tom & Ollie: a cheesemonger's storefront with a chilled-aware checkout
  shop: (
    <>
      <path className="acf" d="M30 28 H130 L138 46 H22 Z" />
      <path className="ln" d="M30 28 H130 L138 46 H22 Z M54 28 L50 46 M80 28 V46 M106 28 L110 46" />
      <rect className="ln" x="32" y="46" width="96" height="40" />
      <path className="ac" d="M46 78 L72 78 L72 62 Z" />
      <rect className="dimr" x="92" y="58" width="26" height="28" />
      <circle className="cy" cx="106" cy="66" r="3" />
      {dot('M46 72 C70 50 96 50 106 66')}
    </>
  ),
  // Fair federated learning: sites send updates to a shared model, data stays at each site
  federated: (
    <>
      {[22, 50, 78].map((y) => (
        <g key={y}>
          <circle className="node" cx="26" cy={y} r="9" />
          <path className="dim" d={`M35 ${y} L98 50`} />
          {dot(`M35 ${y} L98 50`, 1.2, y / 200)}
        </g>
      ))}
      <circle className="ac" cx="118" cy="50" r="22" fill="none" />
      <circle className="ac dimac" cx="118" cy="50" r="14" fill="none" />
      <circle className="acfill" cx="118" cy="50" r="6" />
    </>
  ),
  // CI/CD MLOps: a build moves through train, evaluate and deploy
  pipeline: (
    <>
      <path className="dim" d="M20 50 H140" />
      {['TRAIN', 'EVAL', 'SHIP'].map((_, i) => (
        <rect key={i} className={i === 2 ? 'node hot' : 'node'} x={18 + i * 46} y="38" width="30" height="24" rx="3" />
      ))}
      <circle className="ln" cx="33" cy="50" r="4" />
      <path className="ln" d="M75 50 l4 4 l8 -8" />
      <path className="acfill" d="M120 44 l12 6 l-12 6 z" />
      <path className="ac" d="M20 76 H140" />
      {dot('M33 50 H125', 1.5)}
    </>
  ),
  // GitHub AI agent: an issue is read, analysed, and a change is proposed
  issue: (
    <>
      <circle className="node" cx="28" cy="50" r="14" />
      <path className="ac" d="M28 43 V52 M28 57 V58" />
      <path className="dim" d="M42 50 H58 M102 50 H116" />
      <rect className="node" x="58" y="34" width="44" height="32" rx="3" />
      <circle className="ln" cx="78" cy="48" r="7" fill="none" />
      <path className="ln" d="M83 53 L90 60" />
      <rect className="node hot" x="116" y="30" width="30" height="40" rx="2" />
      <path className="cy" d="M122 42 H140 M131 38 V46" />
      <path className="dim" d="M122 58 H140" />
      {dot('M42 50 H116', 1.4)}
    </>
  ),
  // Warehouse patrol robot: a route between shelving, a robot at its end
  patrol: (
    <>
      {[0, 1, 2].map((i) => (
        <rect key={i} className="dimr" x={20 + i * 44} y="22" width="30" height="14" />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={i} className="dimr" x={20 + i * 44} y="64" width="30" height="14" />
      ))}
      <path className="ac dashed" d="M16 50 H144 M144 50 V92 H16" />
      <path className="warn" d="M96 52 l6 -10 l6 10 z" />
      {dot('M16 50 H144 V92 H60', 2.2, 0, 4.5)}
    </>
  ),
  // ROS formation control: agents settle from scattered positions into a formation
  formation: (
    <>
      {[[80, 24, -30, 20], [58, 46, -26, -14], [102, 46, 30, -18], [36, 68, 20, 14], [124, 68, -22, 20]].map(([x, y, fx, fy]) => (
        <g key={`${x}-${y}`}>
          <circle className="ghost" cx={x + fx} cy={y + fy} r="5" />
          <circle className="agent" cx={x} cy={y} r="5" style={{ '--fx': `${fx}px`, '--fy': `${fy}px` }} />
        </g>
      ))}
      <path className="dim" d="M36 68 L80 24 L124 68 M58 46 H102" />
    </>
  ),
  // Smart AI agent: a conversation with memory, web search and a local model around it
  agent: (
    <>
      <circle className="node hot" cx="80" cy="50" r="16" />
      <path className="ln" d="M72 50 h16 M80 42 v16" />
      {[[28, 26, 'M64 42 L38 30'], [132, 26, 'M96 42 L122 30'], [28, 76, 'M64 58 L38 72'], [132, 76, 'M96 58 L122 72']].map(([x, y, d]) => (
        <g key={d}>
          <path className="dim" d={d} />
          <rect className="node" x={x - 11} y={y - 8} width="22" height="16" rx="3" />
        </g>
      ))}
      <path className="ac" d="M20 20 h16 M20 76 h16 M124 20 h16 M124 76 h16" />
      {dot('M38 30 L64 42', 1.1)}
    </>
  ),
  // Loan default prediction: three classic models compared on the same data
  models: (
    <>
      <path className="dim" d="M20 84 H140 M20 84 V16" />
      <path className="dim dashed" d="M20 84 L140 16" />
      <path className="ln" d="M20 84 C40 56 80 40 140 30" />
      <path className="ln" d="M20 84 C50 66 90 50 140 40" />
      <path className="ac draw" pathLength="1" d="M20 84 C34 50 70 26 140 20" />
    </>
  ),
  // Web security scanner: a sweep over the ports of an approved target
  scan: (
    <>
      <rect className="node" x="48" y="18" width="64" height="64" rx="3" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} className={i === 1 || i === 5 ? 'acfill' : 'dimr'} x={58 + (i % 3) * 16} y={28 + Math.floor(i / 3) * 16} width="10" height="10" />
      ))}
      <path className="ac sweep" d="M52 14 V86" />
      <path className="dim" d="M16 50 H48 M112 50 H144" />
    </>
  ),
  // DSM ontology: classes in a hierarchy, with one reasoned link
  ontology: (
    <>
      <path className="dim" d="M80 22 L40 50 M80 22 L120 50 M40 50 L20 80 M40 50 L60 80 M120 50 L100 80 M120 50 L140 80" />
      {[[80, 22], [40, 50], [120, 50], [20, 80], [60, 80], [100, 80], [140, 80]].map(([x, y]) => (
        <circle key={`${x}-${y}`} className="node" cx={x} cy={y} r="6" />
      ))}
      <path className="ac dashed vpop" d="M60 80 C72 92 88 92 100 80" />
    </>
  ),
  // Secure password manager: a vault, and a code that unlocks the second step
  vault: (
    <>
      <path className="ln" d="M56 44 V34 a16 16 0 0 1 32 0 V44" fill="none" />
      <rect className="node hot" x="48" y="44" width="48" height="36" rx="3" />
      <circle className="acfill" cx="72" cy="59" r="4" />
      <path className="ac" d="M72 62 V70" />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} className={i < 3 ? 'acfill vpop' : 'dimr'} style={wait(i * 0.12)} x={108 + (i % 2) * 18} y={38 + Math.floor(i / 2) * 20} width="14" height="14" />
      ))}
    </>
  ),
  // RL gridworld: an agent learns a path to the goal
  grid: (
    <>
      <path className="dim" d="M24 20 H136 M24 40 H136 M24 60 H136 M24 80 H136 M24 20 V80 M52 20 V80 M80 20 V80 M108 20 V80 M136 20 V80" />
      <rect className="dimr solid" x="52" y="40" width="28" height="20" />
      <rect className="acfill" x="108" y="20" width="28" height="20" />
      <path className="ac" d="M38 70 H66 V50 H94 V30 H122" />
      {dot('M38 70 H66 V50 H94 V30 H122', 1.8, 0, 4.5)}
    </>
  ),
};

export function Vignette({ kind }) {
  return (
    <svg className="vg" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {VIGNETTE[kind]}
    </svg>
  );
}
