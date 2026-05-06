import { useState } from "react";
import IntroSequence from "./components/IntroSequence";
import AboutPage from "./components/AboutPage";

export default function App() {
  const [showHome, setShowHome] = useState(false);

  return (
    <>
      {!showHome ? (
        <IntroSequence onFinish={() => setShowHome(true)} />
      ) : (
        <AboutPage />
      )}
    </>
  );
}