import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl bg-black/20 border-b border-white/10"
    >

      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

        {/* LOGO */}
        <div>

          <h1 className="text-2xl font-black tracking-[4px]">
            AARON<span className="text-cyan-400">.</span>
          </h1>

        </div>

        {/* MENU */}
        <div className="hidden md:flex items-center gap-10 text-sm uppercase tracking-[3px] text-gray-300">

          <button className="hover:text-cyan-400 transition">
            Garage
          </button>

          <button className="hover:text-cyan-400 transition">
            Machines
          </button>

          <button className="hover:text-cyan-400 transition">
            Systems
          </button>

          <button className="hover:text-cyan-400 transition">
            Contact
          </button>

        </div>

        {/* STATUS */}
        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

          <p className="text-sm uppercase tracking-[3px] text-gray-400">
            Online
          </p>

        </div>

      </div>

    </motion.nav>
  );
}