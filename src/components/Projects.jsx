import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const projects = [
  {
    id: 1,
    title: "GITHUB AI AGENT",
    model: "M5 CS",
    description:
      "Autonomous GitHub engineering assistant with AI workflow orchestration.",
    color: "from-cyan-500 via-blue-500 to-black",
  },

  {
    id: 2,
    title: "LLM EVAL REDTEAM",
    model: "M4 COMPETITION",
    description:
      "Advanced LLM adversarial evaluation platform.",
    color: "from-purple-500 via-red-500 to-black",
  },

  {
    id: 3,
    title: "AUTONOMOUS ROBOT",
    model: "XM",
    description:
      "AI-powered warehouse surveillance robotics system.",
    color: "from-blue-500 via-cyan-500 to-black",
  },

  {
    id: 4,
    title: "WEB SECURITY SCANNER",
    model: "M2",
    description:
      "Automated penetration testing and vulnerability scanning.",
    color: "from-cyan-400 via-blue-500 to-black",
  },
];

export default function Projects() {
  const [active, setActive] = useState(0);

  const nextProject = () => {
    setActive((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setActive((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center px-8 py-20">

      {/* BACKGROUND */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${projects[active].color} opacity-20`}
      />

      {/* HUGE TEXT */}
      <h1 className="absolute text-[20vw] font-black text-white/5 tracking-[-10px]">
        {projects[active].model}
      </h1>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center">

        {/* LEFT */}
        <AnimatePresence mode="wait">

          <motion.div
            key={projects[active].id}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.7 }}
          >

            <p className="uppercase tracking-[8px] text-cyan-400 mb-6">
              {projects[active].model}
            </p>

            <h2 className="text-6xl md:text-8xl font-black leading-none">
              {projects[active].title}
            </h2>

            <p className="mt-8 text-gray-300 text-xl leading-relaxed max-w-2xl">
              {projects[active].description}
            </p>

            <div className="flex gap-5 mt-12 flex-wrap">

              <button
                onClick={prevProject}
                className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5"
              >
                ← PREV
              </button>

              <button
                onClick={nextProject}
                className="px-8 py-4 rounded-2xl bg-cyan-400 text-black font-black"
              >
                NEXT →
              </button>

            </div>

          </motion.div>

        </AnimatePresence>

        {/* RIGHT */}
        <AnimatePresence mode="wait">

          <motion.div
            key={projects[active].id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.8 }}
          >

            <motion.div
              animate={{
                rotateY: [0, 10, -10, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
              }}
              className={`w-full h-[550px] rounded-[40px] bg-gradient-to-br ${projects[active].color} relative overflow-hidden shadow-2xl`}
            >

              {/* LIGHT */}
              <motion.div
                animate={{ x: [-400, 900] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-0 left-0 w-[250px] h-full bg-white/10 blur-3xl rotate-12"
              />

              {/* CAR */}
              <div className="absolute inset-0 flex items-center justify-center">

                <div className="relative w-[420px] h-[180px]">

                  {/* BODY */}
                  <div className="absolute bottom-0 w-full h-[90px] rounded-[40px] bg-black/70 border border-cyan-400/20" />

                  {/* TOP */}
                  <div className="absolute top-[30px] left-[90px] w-[240px] h-[70px] rounded-t-[40px] bg-black/60 border border-cyan-400/20" />

                  {/* WHEEL LEFT */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute bottom-[-20px] left-[40px] w-[90px] h-[90px] rounded-full border-[8px] border-cyan-400"
                  />

                  {/* WHEEL RIGHT */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute bottom-[-20px] right-[40px] w-[90px] h-[90px] rounded-full border-[8px] border-cyan-400"
                  />

                </div>

              </div>

            </motion.div>

          </motion.div>

        </AnimatePresence>

      </div>

    </section>
  );
}