import { Routes, Route, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback } from "react";

import StartPage from "./pages/Start"
import { Navbar } from "./components/navbar/Navbar"
import Home from "./pages/Home"
import About from "./pages/About"
import Projects from "./pages/Projects"
import Gallery from "./pages/Gallery"
import Contact from "./pages/Contact"

import LoadingScreen from "./components/reusable_misc/LoadingScreen";
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

    // ----------------------------------- Ember Logic --------------------------------------

    const [embers, setEmbers] = useState(0);
    const [emberGainTick, setEmberGainTick] = useState(0);

    // Load wallet
    useEffect(() => {
        fetch(`${API_BASE}/anon-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ action: "get-wallet" }),
        })
            .then(res => res.json())
            .then(data => {
                if (data?.wallet) {
                    setEmbers(data.wallet.embers);
                }
            })
            .catch(() => {});
    }, []);

    const earnEmber = useCallback((amount = 1) => {
        setEmbers(e => e + amount);
        setEmberGainTick(t => t + amount);

        fetch(`${API_BASE}/anon-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                action: "earn-embers",
                amount,
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (typeof data?.embers === "number") {
                    setEmbers(data.embers); 
                }
            })
            .catch(() => {
                setEmbers(e => Math.max(0, e - amount));
            });
    }, []);

    // ----------------------------------- Cookie Logic --------------------------------------

    const [profile, setProfile] = useState(null);
    const [profileReady, setProfileReady] = useState(false);

    useEffect(() => {
        async function identify() {
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
            }).then(res => res.json());

            const delay = new Promise(resolve => setTimeout(resolve, 2000));

            const [data] = await Promise.all([apiPromise, delay]);

            setProfile(data.profile);
            setProfileReady(true);
        }

        identify();
    }, []);


    // ----------------------------------- Other --------------------------------------

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

        fetch(`${API_BASE}/anon-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ action: "identify", anonId }),
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
                <Route
                    path="/"
                    element={
                        profileReady ? (
                            <StartPage profile={profile} />
                        ) : (
                            <LoadingScreen />
                        )
                    }
                />

                <Route
                    path="/home"
                    element={
                        <>
                            <Navbar embers={embers} gainTick={emberGainTick} />
                            <Home earnEmber={earnEmber} />
                        </>
                    }
                />

                <Route
                    path="/about"
                    element={
                        <>
                            <Navbar embers={embers} gainTick={emberGainTick} />
                            <About />
                        </>
                    }
                />

                <Route
                    path="/projects"
                    element={
                        <>
                            <Navbar embers={embers} gainTick={emberGainTick} />
                            <Projects />
                        </>
                    }
                />

                <Route
                    path="/gallery"
                    element={
                        <>
                            <Navbar embers={embers} gainTick={emberGainTick} />
                            <Gallery />
                        </>
                    }
                />

                <Route
                    path="/contact"
                    element={
                        <>
                            <Navbar embers={embers} gainTick={emberGainTick} />
                            <Contact />
                        </>
                    }
                />
            </Routes>
        </div>
    )
}