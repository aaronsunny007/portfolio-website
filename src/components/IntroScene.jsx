import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function DriftCar() {
  return (
    <group>

      {/* BODY */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.5, 0.8, 2]} />
        <meshStandardMaterial
          color="#050505"
          metalness={1}
          roughness={0.15}
        />
      </mesh>

      {/* TOP */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[2.2, 0.7, 1.7]} />
        <meshStandardMaterial
          color="#111827"
          metalness={1}
          roughness={0.1}
        />
      </mesh>

      {/* FRONT LIGHT */}
      <mesh position={[0, 0, 1.05]}>
        <boxGeometry args={[3.5, 0.08, 0.05]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={5}
        />
      </mesh>

      {/* WHEELS */}
      <mesh
        position={[-1.5, -0.6, 1]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.45, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={2}
        />
      </mesh>

      <mesh
        position={[1.5, -0.6, 1]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.45, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={2}
        />
      </mesh>

      <mesh
        position={[-1.5, -0.6, -1]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.45, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={2}
        />
      </mesh>

      <mesh
        position={[1.5, -0.6, -1]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.45, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={2}
        />
      </mesh>

    </group>
  );
}

export default function IntroScene() {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-screen bg-black overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-200px] left-[-100px] w-[800px] h-[800px] bg-cyan-500/20 blur-[200px] rounded-full" />

      <div className="absolute bottom-[-200px] right-[-100px] w-[800px] h-[800px] bg-blue-500/20 blur-[200px] rounded-full" />

      {/* 3D CAR */}
      <div className="absolute inset-0">

        <Canvas camera={{ position: [0, 2, 9], fov: 45 }}>

          <ambientLight intensity={2} />

          <directionalLight
            position={[5, 5, 5]}
            intensity={4}
          />

          <pointLight
            position={[-5, 0, 0]}
            intensity={5}
            color="#00d9ff"
          />

          <Float
            speed={3}
            rotationIntensity={0.5}
            floatIntensity={1}
          >

            <group rotation={[0.1, -0.4, 0]}>
              <DriftCar />
            </group>

          </Float>

        </Canvas>

      </div>

      {/* SMOKE */}
      <motion.div
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent blur-3xl"
      />

      {/* TEXT */}
      {showText && (

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-8"
        >

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-[9rem] font-black tracking-[-8px]"
          >
            WELCOME TO
            <br />
            MY PORTFOLIO
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 text-gray-300 text-xl max-w-3xl leading-relaxed"
          >
            AI Engineer • Cyber Security Specialist • Full Stack Developer
          </motion.p>

        </motion.div>

      )}

    </section>
  );
}