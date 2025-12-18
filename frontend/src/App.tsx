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

    useEffect(() => {
        if (location.pathname != displayedPath) {
            setTriggerTransition(true);
        }
    }, [location.pathname, displayedPath])

    const handTransitionComplete = () => {
        setDisplayedPath(location.pathname);
        setTriggerTransition(false);    
    }

    return (
        <div className="bg-slate-900 min-h-screen text-white relative">
            {useWipe ? (
                <VerticalWipeTransition
                    trigger={triggerTransition}
                    onComplete={handTransitionComplete}
                />
            ) : (
                <GridTransition
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