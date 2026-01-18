import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import StartPage from "./pages/Start";
import { Navbar } from "./components/navbar/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import Achievements from "./pages/Achievements";

import { useFlameTheme } from "./contexts/FlameThemeContext";
import LoadingScreen from "./components/reusable_misc/LoadingScreen";
import GridTransition from "./components/transitions/GridTransition";
import VerticalWipeTransition from "./components/transitions/VerticalWipeTransition";
import { useQuestTracker } from "./components/quests/useQuestTracker";
import { useQuestContext } from "./contexts/QuestContext";

export default function App() {
  const location = useLocation();

  const [displayedPath, setDisplayedPath] = useState(location.pathname);
  const [triggerTransition, setTriggerTransition] = useState(false);

  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  const isSmallScreen = window.innerWidth < 900;

  const useWipe = isPortrait || isSmallScreen;

  const [transitionKey, setTransitionKey] = useState(0);

  const { hydrateTheme } = useFlameTheme();
  const { processCompletedQuests } = useQuestTracker();
  const { setIsAuthenticated } = useQuestContext();
  const [profile, setProfile] = useState(null);
  const [profileReady, setProfileReady] = useState(false);
  const [hasIdentified, setHasIdentified] = useState(false);
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  async function identify() {
    if (hasIdentified) return profile;
    
    let anonId = document.cookie.includes("anon_id")
      ? document.cookie.split("anon_id=")[1].split(";")[0]
      : localStorage.getItem("anon_id");

    if (!anonId) {
      anonId = crypto.randomUUID();
      localStorage.setItem("anon_id", anonId);
    }

    const apiPromise = fetch(`${API_BASE}/anon-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "identify", anonId }),
    }).then((res) => res.json());

    const delay = new Promise((resolve) => setTimeout(resolve, 2000));

    const [data] = await Promise.all([apiPromise, delay]);

    setProfile(data.profile);
    setProfileReady(true);
    setHasIdentified(true);
    setIsAuthenticated(true);
    
    if (data.completedQuests && data.completedQuests.length > 0) {
      await processCompletedQuests(data.completedQuests);
    }

    return data.profile;
  }

  // ----------------------------------- Initial setup --------------------------------------
  
  useEffect(() => {
    if (!hasIdentified) {
      identify().then((profile) => {
        if (profile?.equipped?.flameTheme) {
          hydrateTheme(profile.equipped.flameTheme);
        }
      });
    }
  }, []);
  


  // ----------------------------------- Other --------------------------------------

  useEffect(() => {
    if (location.pathname != displayedPath) {
      setTriggerTransition(true);
    }
  }, [location.pathname, displayedPath]);

  const handTransitionComplete = () => {
    setDisplayedPath(location.pathname);
    setTriggerTransition(false);
  };

  useEffect(() => {
    if (location.pathname !== displayedPath) {
      setTriggerTransition(true);
      setTransitionKey((k) => k + 1);
    }
  }, [location.pathname, displayedPath]);

  return (
    <div className="bg-slate-900 min-h-screen text-white relative">
      {useWipe ? (
        <VerticalWipeTransition
          key={transitionKey}
          trigger={triggerTransition}
          onComplete={handTransitionComplete}
        />
      ) : (
        <GridTransition
          key={transitionKey}
          trigger={triggerTransition}
          onComplete={handTransitionComplete}
        />
      )}
      
      <Routes location={{ pathname: displayedPath }}>
        <Route
          path="/"
          element={
            profileReady ? <StartPage profile={profile} /> : <LoadingScreen />
          }
        />
       
        <Route
          path="/home"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />
       
        <Route
          path="/start"
          element={
            profileReady ? <StartPage profile={profile} /> : <LoadingScreen />
          }
        />

        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
            </>
          }
        />

        <Route
          path="/projects"
          element={
            <>
              <Navbar />
              <Projects />
            </>
          }
        />

        <Route
          path="/gallery"
          element={
            <>
              <Navbar />
              <Gallery />
            </>
          }
        />

        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <Contact />
            </>
          }
        />

        <Route
          path="/achievements"
          element={
            <>
              <Navbar />
              <Achievements />
            </>
          }
        />

        <Route
          path="/shop"
          element={
            <>
              <Navbar />
              <Shop />
            </>
          }
        />
      </Routes>
    </div>
  );
}
