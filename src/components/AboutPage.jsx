import { motion } from "framer-motion";

const projects = [
  {
    tier: "M8 COMPETITION",
    color: "#C77DFF",
    title: "github-ai-agent",
    description:
      "An intelligent GitHub-integrated AI agent engineered to automate developer workflows, analyze repositories, and streamline software engineering operations. The system combines large language models with real-world repository interaction to create a scalable developer assistant capable of understanding context, generating solutions, and improving engineering productivity.",
  },

  {
    tier: "M5 COMPETITION",
    color: "#C77DFF",
    title: "cicd-mlops-pipeline",
    description:
      "A production-focused MLOps pipeline designed to automate model training, evaluation, validation, and deployment through CI/CD practices. Built with reproducibility and scalability in mind, this system demonstrates the transition from experimentation to fully operational AI infrastructure.",
  },

  {
    tier: "M5",
    color: "#C77DFF",
    title: "autonomous-warehouse-surveillance-robot",
    description:
      "An autonomous robotic surveillance platform designed for intelligent warehouse monitoring and industrial automation scenarios. The project integrates perception systems, robotic navigation, and real-time decision making to simulate scalable AI-driven operational security.",
  },

  {
    tier: "M4",
    color: "#FF3CAC",
    title: "llm-eval-redteam",
    description:
      "A comprehensive red-teaming framework for evaluating the robustness, safety, and vulnerability surface of large language models. Focused on adversarial testing, prompt attacks, and edge-case exploration to improve model trustworthiness and resilience.",
  },

  {
    tier: "M3",
    color: "#FF3CAC",
    title: "web-security-scanner",
    description:
      "An automated web application security scanner built to identify vulnerabilities, assess attack surfaces, and streamline practical security testing workflows. Designed with a focus on scalable vulnerability detection and real-world security assessment practices.",
  },

  {
    tier: "M4 COMPETITION",
    color: "#FF3CAC",
    title: "fair-federated-learning-healthcare-ai",
    description:
      "A federated learning framework for healthcare-focused AI systems emphasizing fairness, privacy preservation, and distributed intelligence. Demonstrates collaborative model training while addressing ethical AI concerns and bias mitigation.",
  },

  {
    tier: "M3",
    color: "#FF3CAC",
    title: "dsm-regulatory-compliance-ontology",
    description:
      "An ontology-driven regulatory compliance system designed to structure and model complex DSM frameworks. Focuses on enterprise knowledge representation, interpretability, and intelligent decision support systems.",
  },

  {
    tier: "M340i",
    color: "#6C63FF",
    title: "loan-default-prediction",
    description:
      "A machine learning system for predicting loan default risk using structured financial datasets. The project focuses on feature engineering, predictive modeling, and risk analysis using practical real-world data science workflows.",
  },

  {
    tier: "M440i",
    color: "#6C63FF",
    title: "smart-ai-agent",
    description:
      "A modular AI agent framework focused on intelligent task execution through LLM reasoning and dynamic tool integration. Built with adaptability and extensibility in mind to support evolving AI-driven workflows.",
  },

  {
    tier: "M SPORT",
    color: "#A8A8B3",
    title: "secure-password-manager",
    description:
      "A secure credential management application emphasizing encryption, authentication safety, and secure storage principles. Demonstrates practical implementation of foundational cybersecurity concepts.",
  },

  {
    tier: "M SPORT",
    color: "#A8A8B3",
    title: "rl-gridworld",
    description:
      "A reinforcement learning simulation environment implementing GridWorld mechanics to explore intelligent agent behavior, policy learning, and autonomous decision-making strategies.",
  },

  {
    tier: "M340i",
    color: "#6C63FF",
    title: "ros-formation-control",
    description:
      "A ROS-based multi-agent robotic coordination system focused on formation control, communication strategies, and distributed robotic intelligence in collaborative environments.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#0B0B0F] text-white overflow-hidden">

      {/* HERO SECTION */}
      <section className="min-h-screen px-8 py-24 relative">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,60,172,0.08),transparent_40%)]" />

        <div className="max-w-6xl mx-auto relative z-10">

          <motion.h1
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-8xl font-black mb-10"
            style={{
              fontFamily: "Orbitron",
              background:
                "linear-gradient(to right,#FF3CAC,#9D4DFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Aaron Prakash Gandi
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl text-[#CFCFEA] mb-14"
            style={{
              fontFamily: "Exo 2",
            }}
          >
            Building intelligent systems that think,
            adapt, and deliver.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-lg leading-[2] max-w-4xl text-[#A8A8B3] space-y-8"
            style={{
              fontFamily: "Inter",
            }}
          >
            <p>
              I’m an AI postgraduate at Ulster University
              with a foundation in Computer Science and
              Cybersecurity, focused on creating real-world
              solutions using machine learning, data,
              and modern software systems.
            </p>

            <p>
              My work spans intelligent agents,
              machine learning systems, AI infrastructure,
              cybersecurity workflows, and scalable
              software engineering.
            </p>

            <p>
              I’m especially interested in combining
              LLMs, retrieval systems, tools, and modern
              engineering pipelines to build usable AI
              products that solve practical problems.
            </p>

            <p>
              Outside of tech, you’ll probably find me
              watching football or hunting down the
              best biriyani in town.
            </p>

          </motion.div>

        </div>

      </section>

      {/* GARAGE SECTION */}
      <section className="min-h-screen px-8 py-24 relative">

        <div className="max-w-7xl mx-auto">

          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-6xl md:text-7xl mb-20"
            style={{
              fontFamily: "Orbitron",
            }}
          >
            GARAGE
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-10">

            {projects.map((project, index) => (

              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 100,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                whileHover={{
                  scale: 1.03,
                  y: -10,
                }}
                transition={{
                  duration: 0.6,
                }}
                className="
                  relative
                  rounded-[30px]
                  border
                  border-white/10
                  bg-[#111115]
                  overflow-hidden
                  p-10
                  group
                "
              >

                {/* GLOW */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 blur-3xl"
                  style={{
                    background: project.color,
                  }}
                />

                {/* CONTENT */}
                <div className="relative z-10">

                  <p
                    className="text-sm tracking-[5px] mb-6"
                    style={{
                      color: project.color,
                      fontFamily: "Orbitron",
                    }}
                  >
                    {project.tier}
                  </p>

                  <h3
                    className="text-3xl mb-6"
                    style={{
                      fontFamily: "Orbitron",
                    }}
                  >
                    {project.title}
                  </h3>

                  <p
                    className="text-[#B8B8C5] leading-[1.9]"
                    style={{
                      fontFamily: "Inter",
                    }}
                  >
                    {project.description}
                  </p>

                  {/* BUTTONS */}
                  <div className="flex gap-5 mt-10">

                    <button
                      className="
                        px-6
                        py-3
                        rounded-xl
                        transition
                        hover:scale-105
                      "
                      style={{
                        background: project.color,
                        color: "#000",
                        fontFamily: "Orbitron",
                      }}
                    >
                      ENTER MACHINE
                    </button>

                    <button
                      className="
                        px-6
                        py-3
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        hover:bg-white/10
                        transition
                      "
                      style={{
                        fontFamily: "Orbitron",
                      }}
                    >
                      SOURCE
                    </button>

                  </div>

                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </section>

    </div>
  );
}