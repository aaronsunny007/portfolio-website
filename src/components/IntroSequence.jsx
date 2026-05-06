import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntroSequence({ onFinish }) {
  const videoRef = useRef(null);

  const [videoEnded, setVideoEnded] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showLine, setShowLine] = useState(false);

  useEffect(() => {
    if (videoEnded) {
      setTimeout(() => {
        setShowName(true);
      }, 500);

      setTimeout(() => {
        setShowLine(true);
      }, 3500);

      setTimeout(() => {
        onFinish();
      }, 6000);
    }
  }, [videoEnded]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">

      {/* VIDEO */}
      {!videoEnded && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          onEnded={() => setVideoEnded(true)}
        >
          <source
            src="/videos/Video Project 3.mp4"
            type="video/mp4"
          />
        </video>
      )}

      {/* BLACK SCREEN */}
      <AnimatePresence>

        {videoEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black flex items-center justify-center"
          >

            {/* NAME */}
            {showName && (
              <motion.h1
                initial={{
                  opacity: 0,
                  letterSpacing: "0px",
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  letterSpacing: "18px",
                  scale: 1,
                }}
                transition={{
                  duration: 2,
                }}
                className="
                  text-white
                  text-5xl
                  md:text-8xl
                  font-thin
                  tracking-[18px]
                  drop-shadow-[0_0_25px_#FF3CAC]
                "
                style={{
                  fontFamily: "Orbitron",
                  color: "#FF6FD8",
                }}
              >
                AARON SUNNY
              </motion.h1>
            )}

            {/* TRANSITION LINE */}
            {showLine && (
              <motion.div
                initial={{
                  width: 0,
                  opacity: 0,
                }}
                animate={{
                  width: "100%",
                  opacity: 1,
                }}
                transition={{
                  duration: 1.5,
                }}
                className="
                  absolute
                  h-[2px]
                  bg-pink-500
                  shadow-[0_0_20px_#FF3CAC]
                "
              />
            )}

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}