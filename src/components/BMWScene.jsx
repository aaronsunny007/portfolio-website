import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";

import { motion } from "framer-motion";

import { useEffect, useRef, useState } from "react";

function BMW() {
  const car = useRef();

  const { scene } = useGLTF("/models/MDL14063_reversed.glb");

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // FAST ENTRY
    if (t < 3) {
      car.current.position.x = 20 - t * 8;

      car.current.position.z = -5;

      car.current.rotation.y = -1.2;
    }

    // REAL DRIFT PHASE
    else {
      const driftTime = t - 3;

      car.current.position.x =
        Math.sin(driftTime * 0.7) * 5;

      car.current.position.z =
        Math.sin(driftTime * 1.4) * 2;

      // aggressive drift angle
      car.current.rotation.y =
        -Math.cos(driftTime * 0.7) * 1.2;

      // body lean
      car.current.rotation.z =
        Math.sin(driftTime * 2) * 0.08;

      // suspension
      car.current.position.y =
        Math.sin(driftTime * 8) * 0.04;
    }
  });

  return (
    <primitive
      ref={car}
      object={scene}
      scale={1.6}
      position={[0, -1.8, 0]}
    />
  );
}

export default function BMWScene() {
  const [showTitle, setShowTitle] = useState(false);

  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowTitle(true);
    }, 6000);

    setTimeout(() => {
      setShowButton(true);
    }, 8000);
  }, []);

  return (
    <section className="relative h-screen bg-black overflow-hidden">

      {/* LIGHTING */}

      <div className="absolute inset-0 z-10">

        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-cyan-500/20 blur-[180px] rounded-full" />

        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-red-500/20 blur-[180px] rounded-full" />

      </div>

      {/* SMOKE */}

      <motion.div
        animate={{
          opacity: [0.1, 0.4, 0.1],
          scale: [1, 1.3, 1],
          x: [-100, 100, -100],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="absolute bottom-[-100px] left-[-200px] w-[140%] h-[400px] bg-white/10 blur-[160px] z-10"
      />

      {/* 3D */}

      <Canvas camera={{ position: [0, 2, 10], fov: 35 }}>

        <ambientLight intensity={1.2} />

        <directionalLight
          position={[10, 10, 5]}
          intensity={5}
        />

        <spotLight
          position={[-10, 15, 10]}
          intensity={4}
          angle={0.3}
        />

        <BMW />

        <Environment preset="night" />

        <OrbitControls
          enableZoom={false}
          autoRotate={false}
        />

      </Canvas>

      {/* TITAN TITLE */}

      {showTitle && (

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">

          <motion.h1
            initial={{
              opacity: 0,
              scale: 4,
              y: 200,
              filter: "blur(30px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 1.8,
              ease: "easeOut",
            }}
            className="text-[11vw] font-black uppercase text-white tracking-[-10px]"
            style={{
              fontFamily: "Impact, sans-serif",
              textShadow:
                "0px 0px 40px rgba(255,255,255,0.35)",
            }}
          >
            AARON
          </motion.h1>

          <motion.h1
            initial={{
              opacity: 0,
              scale: 4,
              y: 200,
              filter: "blur(30px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              delay: 0.3,
              duration: 1.8,
              ease: "easeOut",
            }}
            className="text-[11vw] font-black uppercase text-white tracking-[-10px]"
            style={{
              fontFamily: "Impact, sans-serif",
              textShadow:
                "0px 0px 40px rgba(255,255,255,0.35)",
            }}
          >
            SUNNY
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 1.5,
              duration: 1.5,
            }}
            className="mt-6 text-gray-300 tracking-[8px] uppercase"
          >
            AI ENGINEER • CYBERSECURITY • ROBOTICS
          </motion.p>

        </div>

      )}

      {/* GARAGE BUTTON */}

      {showButton && (

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30"
        >

          <button className="px-10 py-5 rounded-2xl bg-white text-black font-black tracking-[4px] hover:scale-105 transition duration-300 shadow-2xl">

            ENTER GARAGE

          </button>

        </motion.div>

      )}

      {/* CINEMATIC VIGNETTE */}

      <div className="absolute inset-0 bg-black/30 pointer-events-none z-30" />

    </section>
  );
}