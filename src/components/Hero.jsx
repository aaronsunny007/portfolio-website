import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function FloatingCore() {
  return (
    <Float
      speed={4}
      rotationIntensity={2}
      floatIntensity={2}
    >

      {/* OUTER RING */}
      <mesh rotation={[0.5, 0.2, 0]}>
        <torusGeometry args={[2.8, 0.08, 32, 200]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={3}
          metalness={1}
          roughness={0.1}
        />
      </mesh>

      {/* INNER CORE */}
      <mesh rotation={[0.2, 0.4, 0]}>
        <octahedronGeometry args={[1.5]} />
        <meshStandardMaterial
          color="#111827"
          metalness={1}
          roughness={0.2}
        />
      </mesh>

    </Float>
  );
}

export default function Hero() {
  return (
    <section className="relative h-screen bg-black overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0">

        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-cyan-500/20 blur-[180px] rounded-full" />

        <div className="absolute bottom-[-200px] right-[-100px] w-[600px] h-[600px] bg-blue-500/20 blur-[180px] rounded-full" />

      </div>

      {/* HUGE TEXT */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 flex items-center justify-center text-[18vw] font-black text-white whitespace-nowrap tracking-[-12px]"
      >
        M PERFORMANCE
      </motion.h1>

      {/* 3D OBJECT */}
      <div className="absolute inset-0 z-10">

        <Canvas camera={{ position: [0, 0, 7] }}>

          <ambientLight intensity={2} />

          <directionalLight
            position={[5, 5, 5]}
            intensity={3}
          />

          <pointLight
            position={[-5, -5, -5]}
            intensity={4}
            color="#00d9ff"
          />

          <FloatingCore />

        </Canvas>

      </div>

      {/* CONTENT */}
      <div className="relative z-20 h-full flex items-center px-8">

        <div className="max-w-7xl mx-auto w-full">

          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >

            <p className="uppercase tracking-[8px] text-cyan-400 mb-6">
              BMW M SERIES
            </p>

            <h1 className="text-7xl md:text-[9rem] font-black leading-[0.9]">
              AARON
              <br />
              SUNNY
            </h1>

            <div className="h-[4px] w-[220px] bg-cyan-400 mt-8 shadow-lg shadow-cyan-400/50" />

            <p className="text-gray-400 mt-8 text-xl max-w-2xl leading-relaxed">
              Full-stack engineer crafting immersive,
              cinematic AI systems inspired by BMW M
              precision engineering and futuristic design.
            </p>

            <div className="flex gap-5 mt-12 flex-wrap">

              <button className="px-8 py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-105 transition">
                ENTER GARAGE
              </button>

              <button className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                VIEW MACHINES
              </button>

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}