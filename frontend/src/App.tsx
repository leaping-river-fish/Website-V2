import { Routes, Route, useLocation } from "react-router-dom"
import { useState, useEffect } from "react";

import StartPage from "./pages/Start"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import About from "./pages/About"
import Projects from "./pages/Projects"
import Gallery from "./pages/Gallery"
import Contact from "./pages/Contact"

import GridTransition from "./components/transitions/GridTransition"
import VerticalWipeTransition from "./components/transitions/VerticalWipeTransition";

export default function App() {
    const location = useLocation();

    const [displayedPath, setDisplayedPath] = useState(location.pathname);

    const [triggerTransition, setTriggerTransition] = useState(false);

    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const isSmallScreen = window.innerWidth < 900;

    const useWipe = isPortrait || isSmallScreen;

    const [transitionKey, setTransitionKey] = useState(0);

    useEffect(() => {
        if (location.pathname != displayedPath) {
            setTriggerTransition(true);
        }
    }, [location.pathname, displayedPath])

    const handTransitionComplete = () => {
        setDisplayedPath(location.pathname);
        setTriggerTransition(false);    
    }

    useEffect(() => {
        if (location.pathname !== displayedPath) {
            setTriggerTransition(true);
            setTransitionKey((k) => k + 1);
        }
    }, [location.pathname, displayedPath]);

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (document.cookie.includes("anon_id=")) return;

        let anonId = localStorage.getItem("anon_id");

        if (!anonId) {
            anonId = crypto.randomUUID();
            localStorage.setItem("anon_id", anonId);
        }

        fetch(`${API_BASE}/identify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ anonId }),
        }).catch(() => {
            // silent fail in dev
        });
    }, []);

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
                <Route path="/" element={<StartPage />} />

                <Route path="/home" element={<> <Navbar /> <Home /> </>} />
                <Route path="/about" element={<> <Navbar /> <About /> </>} />
                <Route path="/projects" element={<> <Navbar /> <Projects /> </>} />
                <Route path="/gallery" element={<> <Navbar /> <Gallery /> </>} />
                <Route path="/contact" element={<> <Navbar /> <Contact /> </>} />
            </Routes>
        </div>
    )
}