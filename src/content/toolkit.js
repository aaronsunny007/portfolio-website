// The toolkit's one source of truth: departments, technologies, and the projects each one is evidenced in.
// Sourced from "Every tool and technology in your GitHub" (a supplied inventory, not an audit) and checked against the
// local checkouts where they exist (AEGIS, llm-eval-redteam, cicd-mlops, web-security-scanner, fair-federated-learning, this site).
//
// Rules this file keeps:
//  - Relationships use project slugs (content/projects.js), never display strings. toolkit.test.js fails on any unknown slug.
//  - One record per technology. Aliases are search-only. Planned services (Neon, Supabase) and private repos are not here.
//  - A use has a `kind` so a test target, a benchmark or a config file is never shown as the same claim as shipped code.
//  - Notes say what the tool did in that project, nothing more. Tom & Ollie is built but not deployed, so its notes say so.
//  - Technologies only declared as dependencies (this site's Tailwind and React Router) are left out: nothing imports them.

export const KINDS = {
  implemented: 'Implemented',
  test: 'Test tooling',
  infra: 'Infrastructure configuration',
  demo: 'Demo interface',
  method: 'Evaluation method',
  dataset: 'Dataset / benchmark',
  evaluated: 'Model evaluated',
  target: 'Test target',
  optional: 'Optional integration',
};

// Public evidence that is not a gallery project. The gallery and the toolkit have different jobs.
export const supportProjects = {
  portfolio: { slug: 'portfolio', title: 'This portfolio', area: 'Interface / 3D', pitch: 'The Drift run you’re in: a React interface, a Three.js scene and animation timelines built around the drive.', repo: 'https://github.com/aaronsunny007/portfolio-website' },
};

// name: the Drift department; subtitle: what it covers; sections: the subsections shown when a department is expanded
export const groups = [
  { id: 'models', name: 'Power Unit', subtitle: 'Models, training and inference.', sections: [['foundations', 'Foundations'], ['training', 'Model training'], ['quant', 'Quantisation'], ['serving', 'Model serving']] },
  { id: 'agents', name: 'Control Systems', subtitle: 'Retrieval, model connections and tool workflows.', sections: [['agents', 'Orchestration'], ['retrieval', 'Retrieval'], ['apis', 'Model APIs'], ['local', 'Local runtimes'], ['families', 'Models evaluated']] },
  { id: 'backend', name: 'Drivetrain', subtitle: 'Services, storage and data processing.', sections: [['apis', 'APIs and validation'], ['languages', 'Languages'], ['storage', 'Storage and streaming'], ['data', 'Data pipelines']] },
  { id: 'security', name: 'Safety Cell', subtitle: 'Enforcement, security testing and access controls.', sections: [['engines', 'Enforcement'], ['rules', 'Rule sets'], ['bench', 'Attack benchmarks'], ['targets', 'Test targets'], ['fairness', 'Fairness'], ['crypto', 'Authentication and encryption'], ['recon', 'Reconnaissance']] },
  { id: 'evaluation', name: 'Telemetry', subtitle: 'Measurements behind the claims.', sections: [['tracking', 'Tracking and monitoring'], ['datasets', 'Benchmarks and datasets'], ['methods', 'Evaluation methods']] },
  { id: 'cloud', name: 'Pit Lane', subtitle: 'Tests, infrastructure and delivery.', sections: [['containers', 'Containers and clusters'], ['iac', 'Infrastructure configuration'], ['delivery', 'CI and hosting'], ['testing', 'Testing']] },
  { id: 'interfaces', name: 'Cockpit', subtitle: 'Interfaces, dashboards and motion.', sections: [['web', 'Web interfaces'], ['demo', 'Data and demo interfaces'], ['motion', '3D and animation']] },
  { id: 'specialist', name: 'Test Track', subtitle: 'Robotics, simulation and knowledge systems.', sections: [['robotics', 'Robotics'], ['kr', 'Knowledge representation']] },
];

const u = (p, kind, note) => ({ p, kind, note });

// id, name, group, section, type; featured tools open first; aliases are search-only.
export const tools = [
  // ---------- Power Unit ----------
  { id: 'python', name: 'Python', group: 'models', section: 'foundations', type: 'Language', featured: true, aliases: ['py'], uses: [
    u('warden', 'implemented', 'Implements the detection service exposed through FastAPI.'),
    u('ledger', 'implemented', 'Powers the answer API and retrieval pipeline in Python 3.12.'),
    u('aegis', 'implemented', 'Implements the scikit-learn detection baseline.'),
    u('llm-eval-redteam', 'implemented', 'Powers the command-line evaluation harness.'),
  ] },
  { id: 'pytorch', name: 'PyTorch', group: 'models', section: 'training', type: 'Framework', featured: true, aliases: ['torch'], uses: [
    u('warden', 'implemented', 'Trains the DeBERTa classifier used in the second detection layer.'),
    u('financial-nrf', 'implemented', 'Runs quantised open models for evaluation. These runs evaluate the models; they do not fine-tune them.'),
  ] },
  { id: 'transformers', name: 'Transformers', group: 'models', section: 'training', type: 'Library', featured: true, aliases: ['hugging face transformers', 'huggingface'], uses: [
    u('warden', 'implemented', 'Loads DeBERTa for the second-layer classifier’s fine-tuning workflow.'),
    u('financial-nrf', 'implemented', 'Loads the open models used in the evaluation.'),
  ] },
  { id: 'deberta', name: 'DeBERTa fine-tuning', group: 'models', section: 'training', type: 'Technique', featured: true, aliases: ['deberta', 'fine-tuning', 'finetuning', 'classifier'], uses: [
    u('warden', 'implemented', 'Adapts DeBERTa for the second detection layer.'),
  ] },
  { id: 'scikit-learn', name: 'scikit-learn', group: 'models', section: 'training', type: 'Library', featured: true, aliases: ['sklearn'], uses: [
    u('aegis', 'implemented', 'Provides the ML baseline alongside the rule-based defence.'),
    u('cicd-mlops', 'implemented', 'Builds the model for predicting failures in CI/CD stages.'),
    u('fair-fl', 'implemented', 'Provides classical models for the federated fairness experiments.'),
  ] },
  { id: 'flower', name: 'Flower', group: 'models', section: 'training', type: 'Framework', aliases: ['flwr', 'federated learning'], uses: [
    u('fair-fl', 'implemented', 'Coordinates federated training across participating sites.'),
  ] },
  { id: 'ray', name: 'Ray', group: 'models', section: 'training', type: 'Framework', uses: [
    u('fair-fl', 'implemented', 'Supports the federated experiment setup alongside Flower.'),
  ] },
  { id: 'bitsandbytes', name: 'bitsandbytes', group: 'models', section: 'quant', type: 'Library', aliases: ['quantisation', 'quantization', '4-bit'], uses: [
    u('financial-nrf', 'implemented', 'Loads open models with 4-bit quantisation for the evaluation runs.'),
  ] },
  { id: 'onnx', name: 'ONNX', group: 'models', section: 'serving', type: 'Model format', uses: [
    u('warden', 'implemented', 'Provides the classifier format used by the serving path.'),
  ] },
  { id: 'onnxruntime', name: 'ONNX Runtime', group: 'models', section: 'serving', type: 'Runtime', featured: true, aliases: ['onnxruntime', 'ort'], uses: [
    u('warden', 'implemented', 'Executes the exported classifier during inference.'),
  ] },

  // ---------- Control Systems ----------
  { id: 'mcp', name: 'MCP SDK', group: 'agents', section: 'agents', type: 'Protocol SDK', featured: true, aliases: ['mcp', 'model context protocol'], uses: [
    u('warden', 'implemented', 'Implements the TypeScript client and server connections used to proxy requests between agents and MCP tool servers.'),
  ] },
  { id: 'langgraph', name: 'LangGraph', group: 'agents', section: 'agents', type: 'Framework', featured: true, uses: [
    u('warden', 'test', 'Defines the test-agent workflow used to exercise the gateway.'),
  ] },
  { id: 'langchain', name: 'LangChain', group: 'agents', section: 'agents', type: 'Framework', aliases: ['langchain-ollama'], uses: [
    u('warden', 'test', 'Connects the test agent to its local model through langchain-ollama.'),
  ] },
  { id: 'tavily', name: 'Tavily', group: 'agents', section: 'agents', type: 'Search API', aliases: ['web search'], uses: [
    u('smart-ai-agent', 'implemented', 'Supplies web search to the conversational workflow.'),
  ] },
  { id: 'pgvector', name: 'pgvector', group: 'agents', section: 'retrieval', type: 'Vector store', featured: true, aliases: ['vector database', 'vector store', 'postgres vector'], uses: [
    u('ledger', 'implemented', 'Stores passage embeddings for retrieval.'),
    u('warden', 'implemented', 'Supports the first detection layer’s similarity search.'),
  ] },
  { id: 'faiss', name: 'FAISS', group: 'agents', section: 'retrieval', type: 'Vector index', featured: true, aliases: ['vector search', 'indexflatip'], uses: [
    u('financial-nrf', 'implemented', 'Searches retrieval embeddings with the exact IndexFlatIP index.'),
    u('smart-ai-agent', 'implemented', 'Indexes PDF content for retrieval during question answering.'),
  ] },
  { id: 'sentence-transformers', name: 'sentence-transformers', group: 'agents', section: 'retrieval', type: 'Library', aliases: ['sbert', 'embeddings'], uses: [
    u('ledger', 'implemented', 'Creates passage embeddings for retrieval.'),
    u('warden', 'implemented', 'Creates embeddings for the first detection layer.'),
    u('financial-nrf', 'implemented', 'Creates the embeddings used by the retrieval experiments.'),
    u('smart-ai-agent', 'implemented', 'Embeds PDF chunks for document search.'),
  ] },
  { id: 'bge', name: 'BGE embeddings', group: 'agents', section: 'retrieval', type: 'Embedding models', aliases: ['bge small', 'bge base'], uses: [
    u('ledger', 'implemented', 'Uses BGE small and base models to embed report passages.'),
  ] },
  { id: 'rerank', name: 'Cross-encoder reranking', group: 'agents', section: 'retrieval', type: 'Technique', featured: true, aliases: ['reranker', 'bge reranker', 'cross encoder', 'rerank'], uses: [
    u('ledger', 'implemented', 'Uses a BGE cross-encoder to reorder retrieved passages before answer generation.'),
  ] },
  { id: 'anthropic', name: 'Anthropic API', group: 'agents', section: 'apis', type: 'Model API', aliases: ['claude'], uses: [
    u('financial-nrf', 'test', 'Runs Claude as an evaluation judge.'),
  ] },
  { id: 'gemini', name: 'Gemini API', group: 'agents', section: 'apis', type: 'Model API', aliases: ['google gemini'], uses: [
    u('ledger', 'implemented', 'Provides an interchangeable answer-generation option.'),
    u('llm-eval-redteam', 'test', 'Runs as both an evaluated model and a judge, depending on the configuration.'),
  ] },
  { id: 'groq', name: 'Groq API', group: 'agents', section: 'apis', type: 'Model API', uses: [
    u('ledger', 'implemented', 'Provides an interchangeable answer-generation option.'),
    u('github-ai-agent', 'implemented', 'Serves Llama 3.1 8B for GitHub issue analysis.'),
  ] },
  { id: 'openai', name: 'OpenAI API', group: 'agents', section: 'apis', type: 'Model API', aliases: ['gpt-4o-mini', 'gpt'], uses: [
    u('smart-ai-agent', 'implemented', 'Runs GPT-4o mini for the conversational workflow.'),
  ] },
  { id: 'openai-compatible', name: 'OpenAI-compatible endpoints', group: 'agents', section: 'apis', type: 'Protocol', aliases: ['openai style', 'openai-style http'], uses: [
    u('ledger', 'implemented', 'Connects to generators that expose the OpenAI-style HTTP interface. This describes protocol support, not necessarily use of OpenAI’s service.'),
  ] },
  { id: 'ollama', name: 'Ollama', group: 'agents', section: 'local', type: 'Local runtime', featured: true, aliases: ['local llm'], uses: [
    u('ledger', 'implemented', 'Provides a local answer-generation option.'),
    u('warden', 'test', 'Runs the local model used by the test agent.'),
    u('aegis', 'implemented', 'Runs the local model that drafts blocking rules.'),
    u('llm-eval-redteam', 'test', 'Runs local models for target evaluation and judging.'),
  ] },
  { id: 'llamacpp', name: 'llama.cpp / GGUF', group: 'agents', section: 'local', type: 'Runtime and model format', aliases: ['gguf', 'llama cpp', 'llamacpp'], uses: [
    u('financial-nrf', 'implemented', 'Runs GGUF models on CPU.'),
  ] },
  { id: 'qwen', name: 'Qwen', group: 'agents', section: 'families', type: 'Model family', aliases: ['qwen 2.5', 'qwen 3'], uses: [
    u('financial-nrf', 'evaluated', 'Evaluates Qwen 2.5 and Qwen 3 as answer generators.'),
  ] },
  { id: 'llama', name: 'Llama', group: 'agents', section: 'families', type: 'Model family', aliases: ['llama 3.1', 'meta llama'], uses: [
    u('financial-nrf', 'evaluated', 'Evaluates Llama 3.1 as an answer generator.'),
    u('github-ai-agent', 'implemented', 'Uses Llama 3.1 8B through Groq to analyse issues.'),
  ] },

  // ---------- Drivetrain ----------
  { id: 'fastapi', name: 'FastAPI', group: 'backend', section: 'apis', type: 'Framework', featured: true, aliases: ['uvicorn'], uses: [
    u('warden', 'implemented', 'Exposes the detection service through an API.'),
    u('ledger', 'implemented', 'Serves the question-answering API.'),
    u('tom-and-ollie', 'implemented', 'Implements the storefront relaunch backend. Built; not deployed.'),
    u('cicd-mlops', 'implemented', 'Serves the failure-prediction model.'),
  ] },
  { id: 'fastify', name: 'Fastify', group: 'backend', section: 'apis', type: 'Framework', featured: true, uses: [
    u('warden', 'implemented', 'Runs the TypeScript gateway, with request schemas defined in Zod.'),
  ] },
  { id: 'flask', name: 'Flask', group: 'backend', section: 'apis', type: 'Framework', uses: [
    u('web-security-scanner', 'implemented', 'Provides the web interface around the scanning tools.'),
    u('password-manager', 'implemented', 'Provides the application around the encrypted vault.'),
  ] },
  { id: 'spring-boot', name: 'Spring Boot', group: 'backend', section: 'apis', type: 'Framework / test target', aliases: ['maven', 'spring'], uses: [
    u('warden', 'target', 'Runs the simulated backend used to test the gateway. This is a test target built with Java 21 and Maven.'),
  ] },
  { id: 'pydantic', name: 'Pydantic', group: 'backend', section: 'apis', type: 'Library', aliases: ['validation'], uses: [
    u('ledger', 'implemented', 'Defines parsing and validation models.'),
    u('llm-eval-redteam', 'implemented', 'Defines data models for the command-line evaluation harness.'),
    u('tom-and-ollie', 'implemented', 'Defines request and response models for the relaunch backend. Built; not deployed.'),
  ] },
  { id: 'zod', name: 'Zod', group: 'backend', section: 'apis', type: 'Library', aliases: ['schemas'], uses: [
    u('warden', 'implemented', 'Validates requests at the TypeScript gateway.'),
  ] },
  { id: 'typescript', name: 'TypeScript', group: 'backend', section: 'languages', type: 'Language', aliases: ['ts', 'javascript'], uses: [
    u('warden', 'implemented', 'Implements the gateway and its Fastify and Zod integration.'),
  ] },
  { id: 'go', name: 'Go', group: 'backend', section: 'languages', type: 'Language', aliases: ['golang'], uses: [
    u('aegis', 'implemented', 'Implements the enforcement gateway around Coraza in Go 1.24.'),
  ] },
  { id: 'java', name: 'Java', group: 'backend', section: 'languages', type: 'Language', uses: [
    u('warden', 'target', 'Implements the simulated test backend in Java 21.'),
  ] },
  { id: 'postgresql', name: 'PostgreSQL', group: 'backend', section: 'storage', type: 'Database', featured: true, aliases: ['postgres', 'psql', 'sql'], uses: [
    u('ledger', 'implemented', 'Stores the data behind pgvector retrieval.'),
    u('warden', 'implemented', 'Stores relational state alongside the Redis and Kafka services.'),
  ] },
  { id: 'mysql', name: 'MySQL', group: 'backend', section: 'storage', type: 'Database', uses: [
    u('password-manager', 'implemented', 'Stores encrypted vault records.'),
  ] },
  { id: 'sqlalchemy', name: 'SQLAlchemy', group: 'backend', section: 'storage', type: 'ORM', featured: true, aliases: ['orm'], uses: [
    u('warden', 'implemented', 'Handles database access for the detection service.'),
    u('tom-and-ollie', 'implemented', 'Handles database access for the storefront backend. Built; not deployed.'),
  ] },
  { id: 'alembic', name: 'Alembic', group: 'backend', section: 'storage', type: 'Migration tool', aliases: ['migrations'], uses: [
    u('warden', 'implemented', 'Manages database schema migrations for the detection service.'),
  ] },
  { id: 'redis', name: 'Redis', group: 'backend', section: 'storage', type: 'Data store', uses: [
    u('warden', 'implemented', 'Holds service state.'),
  ] },
  { id: 'kafka', name: 'Kafka', group: 'backend', section: 'storage', type: 'Event streaming', uses: [
    u('warden', 'implemented', 'Carries events between parts of the system.'),
  ] },
  { id: 'azure-databricks', name: 'Azure Databricks', group: 'backend', section: 'data', type: 'Data platform', featured: true, aliases: ['databricks', 'lakehouse'], uses: [
    u('pulsecity', 'implemented', 'Hosts the transport-data lakehouse.'),
  ] },
  { id: 'pyspark', name: 'PySpark', group: 'backend', section: 'data', type: 'Processing library', featured: true, aliases: ['spark'], uses: [
    u('pulsecity', 'implemented', 'Processes transport data on Databricks.'),
  ] },
  { id: 'delta-lake', name: 'Delta Lake', group: 'backend', section: 'data', type: 'Table format', aliases: ['delta', 'medallion', 'bronze silver gold'], uses: [
    u('pulsecity', 'implemented', 'Stores the bronze, silver and gold data layers.'),
  ] },
  { id: 'unity-catalog', name: 'Unity Catalog', group: 'backend', section: 'data', type: 'Data governance', uses: [
    u('pulsecity', 'implemented', 'Governs the lakehouse tables.'),
  ] },
  { id: 'dbt', name: 'dbt', group: 'backend', section: 'data', type: 'Transformation tool', aliases: ['data build tool'], uses: [
    u('warden', 'implemented', 'Defines analytics models within the project.'),
  ] },
  { id: 'pandas', name: 'pandas', group: 'backend', section: 'data', type: 'Library', uses: [
    u('loan-default', 'implemented', 'Prepares and explores the Lending Club data in notebooks.'),
  ] },
  { id: 'powerbi', name: 'Power BI', group: 'backend', section: 'data', type: 'BI tool', aliases: ['pbix'], uses: [
    u('pulsecity', 'demo', 'Provides the dashboard file for exploring the lakehouse data.'),
  ] },

  // ---------- Safety Cell ----------
  { id: 'coraza', name: 'Coraza WAF', group: 'security', section: 'engines', type: 'Enforcement engine', featured: true, aliases: ['waf', 'web application firewall'], uses: [
    u('aegis', 'implemented', 'Enforces blocking rules at the Go gateway.'),
  ] },
  { id: 'modsecurity', name: 'ModSecurity', group: 'security', section: 'engines', type: 'Baseline WAF', uses: [
    u('aegis', 'test', 'Provides the comparison WAF in the lab, using nginx, ModSecurity v3 and the Core Rule Set.'),
  ] },
  { id: 'crs', name: 'OWASP Core Rule Set', group: 'security', section: 'rules', type: 'Rule set', featured: true, aliases: ['crs', 'owasp crs'], uses: [
    u('aegis', 'implemented', 'Supplies the baseline web-security rules used by Coraza and ModSecurity.'),
  ] },
  { id: 'agentdojo', name: 'AgentDojo', group: 'security', section: 'bench', type: 'Attack benchmark', featured: true, uses: [
    u('warden', 'test', 'Provides attack scenarios used to evaluate the gateway.'),
  ] },
  { id: 'juice-shop', name: 'OWASP Juice Shop', group: 'security', section: 'targets', type: 'Test target', featured: true, aliases: ['juiceshop'], uses: [
    u('aegis', 'target', 'Provides a deliberately vulnerable application for the lab’s attack traffic. It is an external test target.'),
  ] },
  { id: 'aif360', name: 'AIF360', group: 'security', section: 'fairness', type: 'Fairness toolkit', featured: true, aliases: ['fairness', 'ai fairness 360'], uses: [
    u('fair-fl', 'implemented', 'Measures fairness in the federated healthcare experiments.'),
  ] },
  { id: 'bcrypt', name: 'bcrypt', group: 'security', section: 'crypto', type: 'Library', aliases: ['hashing'], uses: [
    u('password-manager', 'implemented', 'Hashes account passwords.'),
  ] },
  { id: 'pyotp', name: 'pyotp', group: 'security', section: 'crypto', type: 'Library', aliases: ['2fa', 'totp', 'otp'], uses: [
    u('password-manager', 'implemented', 'Generates and checks one-time passwords for two-factor authentication.'),
  ] },
  { id: 'cryptography', name: 'cryptography', group: 'security', section: 'crypto', type: 'Library', aliases: ['encryption'], uses: [
    u('password-manager', 'implemented', 'Encrypts stored vault contents.'),
  ] },
  { id: 'nmap', name: 'Nmap', group: 'security', section: 'recon', type: 'Scanner', featured: true, aliases: ['port scanning', 'reconnaissance'], uses: [
    u('web-security-scanner', 'implemented', 'Scans approved targets from the application.'),
  ] },
  { id: 'dnspython', name: 'dnspython', group: 'security', section: 'recon', type: 'Library', aliases: ['dns', 'subdomain'], uses: [
    u('web-security-scanner', 'implemented', 'Performs DNS lookups during domain reconnaissance.'),
  ] },
  { id: 'python-whois', name: 'python-whois', group: 'security', section: 'recon', type: 'Library', aliases: ['whois'], uses: [
    u('web-security-scanner', 'implemented', 'Retrieves WHOIS records during domain reconnaissance.'),
  ] },

  // ---------- Telemetry ----------
  { id: 'mlflow', name: 'MLflow', group: 'evaluation', section: 'tracking', type: 'Experiment tracking', featured: true, aliases: ['experiment tracking'], uses: [
    u('llm-eval-redteam', 'optional', 'Offers optional tracking for evaluation runs.'),
    u('cicd-mlops', 'implemented', 'Tracks model runs within the pipeline.'),
  ] },
  { id: 'langfuse', name: 'Langfuse', group: 'evaluation', section: 'tracking', type: 'Request tracing', featured: true, aliases: ['tracing'], uses: [
    u('ledger', 'implemented', 'Traces requests through retrieval and answer generation.'),
  ] },
  { id: 'opentelemetry', name: 'OpenTelemetry', group: 'evaluation', section: 'tracking', type: 'Instrumentation', featured: true, aliases: ['otel'], uses: [
    u('warden', 'implemented', 'Instruments the services for monitoring.'),
  ] },
  { id: 'prometheus', name: 'Prometheus', group: 'evaluation', section: 'tracking', type: 'Metrics', featured: true, aliases: ['metrics'], uses: [
    u('warden', 'implemented', 'Collects service metrics.'),
  ] },
  { id: 'grafana', name: 'Grafana', group: 'evaluation', section: 'tracking', type: 'Dashboards', aliases: ['monitoring'], uses: [
    u('warden', 'implemented', 'Displays metrics from the monitoring stack.'),
  ] },
  { id: 'financebench', name: 'FinanceBench', group: 'evaluation', section: 'datasets', type: 'Benchmark', featured: true, uses: [
    u('ledger', 'dataset', 'Contributes questions to the evaluation sets for cited answers.'),
  ] },
  { id: 'finqa', name: 'FinQA', group: 'evaluation', section: 'datasets', type: 'Benchmark', uses: [
    u('financial-nrf', 'dataset', 'Provides one of the study’s two financial datasets.'),
  ] },
  { id: 'tatqa', name: 'TAT-QA', group: 'evaluation', section: 'datasets', type: 'Benchmark', aliases: ['tat qa'], uses: [
    u('financial-nrf', 'dataset', 'Provides one of the study’s two financial datasets.'),
  ] },
  { id: 'sec-edgar', name: 'SEC EDGAR filings', group: 'evaluation', section: 'datasets', type: 'Source data', aliases: ['edgar', 'xbrl', 'sec'], uses: [
    u('ledger', 'dataset', 'Supplies company filings and XBRL data used in the evaluation material.'),
  ] },
  { id: 'csic', name: 'CSIC dataset', group: 'evaluation', section: 'datasets', type: 'Dataset', aliases: ['csic 2010'], uses: [
    u('aegis', 'dataset', 'Supplies attack and benign HTTP traffic for evaluation.'),
  ] },
  { id: 'kappa', name: 'Cohen’s kappa', group: 'evaluation', section: 'methods', type: 'Evaluation method', featured: true, aliases: ['kappa', 'inter-rater agreement', 'judge validation'], uses: [
    u('llm-eval-redteam', 'method', 'Measures agreement between the model judge and reference labels.'),
  ] },
  { id: 'wilson', name: 'Wilson intervals', group: 'evaluation', section: 'methods', type: 'Statistical method', aliases: ['confidence intervals', 'wilson score'], uses: [
    u('llm-eval-redteam', 'method', 'Quantifies uncertainty in judge-validation results.'),
  ] },

  // ---------- Pit Lane ----------
  { id: 'docker', name: 'Docker', group: 'cloud', section: 'containers', type: 'Containers', featured: true, aliases: ['containers'], uses: [
    u('ledger', 'implemented', 'Packages the application for the container setup used with pgvector.'),
    u('warden', 'implemented', 'Packages the project’s services.'),
    u('cicd-mlops', 'implemented', 'Packages the model API.'),
    u('aegis', 'implemented', 'Packages components of the security lab.'),
    u('llm-eval-redteam', 'implemented', 'Packages the evaluation harness for CI and release.'),
  ] },
  { id: 'docker-compose', name: 'Docker Compose', group: 'cloud', section: 'containers', type: 'Container orchestration', aliases: ['docker-compose', 'compose'], uses: [
    u('ledger', 'implemented', 'Runs the application alongside pgvector.'),
    u('aegis', 'implemented', 'Runs the lab stack, including Juice Shop behind the ModSecurity baseline.'),
  ] },
  { id: 'helm', name: 'Helm', group: 'cloud', section: 'containers', type: 'Kubernetes packaging', uses: [
    u('warden', 'infra', 'Defines the application’s Kubernetes deployment package.'),
  ] },
  { id: 'kind', name: 'Kubernetes / kind', group: 'cloud', section: 'containers', type: 'Local cluster', featured: true, aliases: ['k8s', 'kubernetes', 'kind'], uses: [
    u('warden', 'test', 'Runs a local cluster to test the Helm package.'),
  ] },
  { id: 'terraform', name: 'Terraform', group: 'cloud', section: 'iac', type: 'Infrastructure configuration', featured: true, aliases: ['aws', 'ecr', 'iac'], uses: [
    u('warden', 'infra', 'Defines AWS resources, including an ECR repository and a budget alarm. This is infrastructure configuration; it does not establish production operation.'),
  ] },
  { id: 'github-actions', name: 'GitHub Actions', group: 'cloud', section: 'delivery', type: 'CI', featured: true, aliases: ['ci', 'workflows', 'cicd'], uses: [
    u('ledger', 'implemented', 'Runs the evaluation gate, nightly checks and other repository workflows.'),
    u('warden', 'implemented', 'Runs verification, security and Pages workflows.'),
    u('aegis', 'implemented', 'Runs CI checks, including Go tests.'),
    u('llm-eval-redteam', 'implemented', 'Runs the evaluation gate and release workflow.'),
    u('financial-nrf', 'implemented', 'Runs CI and the documentation-site workflow.'),
    u('pulsecity', 'implemented', 'Runs CI, collection and deployment workflows.'),
    u('tom-and-ollie', 'implemented', 'Runs the relaunch project’s tests. The storefront was not deployed.'),
    u('cicd-mlops', 'implemented', 'Connects training, evaluation and deployment steps.'),
  ] },
  { id: 'github-pages', name: 'GitHub Pages', group: 'cloud', section: 'delivery', type: 'Hosting / workflow', uses: [
    u('warden', 'infra', 'Provides the target for the repository’s Pages workflow.'),
    u('llm-eval-redteam', 'infra', 'Hosts the release site.'),
    u('financial-nrf', 'infra', 'Hosts the documentation site.'),
  ] },
  { id: 'huggingface-spaces', name: 'Hugging Face Spaces', group: 'cloud', section: 'delivery', type: 'Demo hosting', aliases: ['hf spaces', 'spaces'], uses: [
    u('ledger', 'demo', 'Provides the Docker Space setup for the demo.'),
    u('financial-nrf', 'demo', 'Hosts the Gradio demo.'),
  ] },
  { id: 'pytest', name: 'pytest', group: 'cloud', section: 'testing', type: 'Testing', featured: true, uses: [
    u('ledger', 'test', 'Runs the Python test suite.'),
    u('tom-and-ollie', 'test', 'Tests the storefront backend. Built; not deployed.'),
  ] },
  { id: 'playwright', name: 'Playwright', group: 'cloud', section: 'testing', type: 'Browser testing', featured: true, aliases: ['browser tests', 'e2e'], uses: [
    u('ledger', 'test', 'Runs interface smoke tests.'),
    u('warden', 'test', 'Supports browser testing.'),
    u('aegis', 'test', 'Generates benign browsing traffic for rule checks.'),
  ] },
  { id: 'vitest', name: 'Vitest', group: 'cloud', section: 'testing', type: 'Testing', uses: [
    u('warden', 'test', 'Tests the TypeScript components.'),
  ] },
  { id: 'hypothesis', name: 'Hypothesis', group: 'cloud', section: 'testing', type: 'Property-based testing', aliases: ['property tests', 'property-based'], uses: [
    u('warden', 'test', 'Exercises properties across generated test inputs.'),
  ] },
  { id: 'go-test', name: 'Go tests', group: 'cloud', section: 'testing', type: 'Testing', aliases: ['go test'], uses: [
    u('aegis', 'test', 'Tests the Go gateway in CI.'),
  ] },

  // ---------- Cockpit ----------
  { id: 'react', name: 'React', group: 'interfaces', section: 'web', type: 'UI library', featured: true, aliases: ['jsx'], uses: [
    u('portfolio', 'implemented', 'Builds the site’s interface in React 19.'),
    u('warden', 'implemented', 'Builds the operator dashboard with React 19 and Next.js.'),
  ] },
  { id: 'nextjs', name: 'Next.js', group: 'interfaces', section: 'web', type: 'Framework', featured: true, aliases: ['nextjs', 'next'], uses: [
    u('warden', 'implemented', 'Provides the framework for the operator dashboard.'),
  ] },
  { id: 'vite', name: 'Vite', group: 'interfaces', section: 'web', type: 'Build tool', uses: [
    u('portfolio', 'implemented', 'Runs the development server and builds the site.'),
  ] },
  { id: 'tailwind', name: 'Tailwind CSS', group: 'interfaces', section: 'web', type: 'CSS framework', aliases: ['tailwind'], uses: [
    u('warden', 'implemented', 'Styles the operator dashboard.'),
  ] },
  { id: 'streamlit', name: 'Streamlit', group: 'interfaces', section: 'demo', type: 'Interface framework', featured: true, uses: [
    u('ledger', 'demo', 'Provides the question-answering demo.'),
    u('llm-eval-redteam', 'demo', 'Displays evaluation results.'),
    u('smart-ai-agent', 'demo', 'Provides the chat interface.'),
  ] },
  { id: 'gradio', name: 'Gradio', group: 'interfaces', section: 'demo', type: 'Interface framework', featured: true, uses: [
    u('financial-nrf', 'demo', 'Provides the interactive demo.'),
  ] },
  { id: 'recharts', name: 'Recharts', group: 'interfaces', section: 'demo', type: 'Charting library', aliases: ['charts'], uses: [
    u('warden', 'implemented', 'Displays charts in the operator dashboard.'),
  ] },
  { id: 'threejs', name: 'Three.js', group: 'interfaces', section: 'motion', type: '3D library', featured: true, aliases: ['three.js', 'threejs', 'three', 'react three fiber', 'r3f', 'webgl', 'drei', '3d'], uses: [
    u('portfolio', 'implemented', 'Renders the drift scene through React Three Fiber and drei.'),
  ] },
  { id: 'gsap', name: 'GSAP', group: 'interfaces', section: 'motion', type: 'Animation library', featured: true, aliases: ['animation', 'greensock'], uses: [
    u('portfolio', 'implemented', 'Sequences the animation timelines.'),
  ] },
  { id: 'lenis', name: 'Lenis', group: 'interfaces', section: 'motion', type: 'Scrolling library', aliases: ['smooth scroll'], uses: [
    u('portfolio', 'implemented', 'Controls smooth scrolling.'),
  ] },

  // ---------- Test Track ----------
  { id: 'ros', name: 'ROS 1', group: 'specialist', section: 'robotics', type: 'Robotics framework', featured: true, aliases: ['ros', 'ros1', 'robot operating system'], uses: [
    u('warehouse-robot', 'implemented', 'Connects the robot’s navigation components.'),
    u('ros-formation', 'implemented', 'Coordinates leader–follower formation control.'),
  ] },
  { id: 'gazebo', name: 'Gazebo', group: 'specialist', section: 'robotics', type: 'Simulator', featured: true, uses: [
    u('warehouse-robot', 'implemented', 'Provides the simulated warehouse environment.'),
  ] },
  { id: 'opencv', name: 'OpenCV', group: 'specialist', section: 'robotics', type: 'Computer vision library', featured: true, aliases: ['computer vision'], uses: [
    u('warehouse-robot', 'implemented', 'Processes visual input for the patrol robot’s detection features.'),
  ] },
  { id: 'turtlesim', name: 'turtlesim', group: 'specialist', section: 'robotics', type: 'Simulator', uses: [
    u('ros-formation', 'implemented', 'Provides the simulation used to demonstrate formation control.'),
  ] },
  { id: 'tf', name: 'TF', group: 'specialist', section: 'robotics', type: 'ROS library', aliases: ['transforms'], uses: [
    u('ros-formation', 'implemented', 'Manages coordinate frames for leader–follower control.'),
  ] },
  { id: 'bug2', name: 'Bug2', group: 'specialist', section: 'robotics', type: 'Navigation algorithm', uses: [
    u('warehouse-robot', 'implemented', 'Provides one navigation strategy for moving around obstacles.'),
  ] },
  { id: 'qlearning', name: 'Q-learning', group: 'specialist', section: 'robotics', type: 'Learning algorithm', featured: true, aliases: ['reinforcement learning', 'rl'], uses: [
    u('warehouse-robot', 'implemented', 'Provides the alternative learning-based navigation strategy.'),
  ] },
  { id: 'protege', name: 'Protégé', group: 'specialist', section: 'kr', type: 'Ontology editor', aliases: ['protege'], uses: [
    u('dsm-ontology', 'implemented', 'Edits the deep-sea mining compliance ontology.'),
  ] },
  { id: 'owl', name: 'OWL', group: 'specialist', section: 'kr', type: 'Ontology language', featured: true, aliases: ['ontology'], uses: [
    u('dsm-ontology', 'implemented', 'Represents the compliance concepts and their relationships.'),
  ] },
  { id: 'hermit', name: 'HermiT', group: 'specialist', section: 'kr', type: 'Reasoner', featured: true, aliases: ['reasoner'], uses: [
    u('dsm-ontology', 'implemented', 'Reasons over the encoded ontology.'),
  ] },
];
