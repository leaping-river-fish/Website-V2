// ADD achievements/quests
import { useState, useRef, useEffect } from "react"
import { motion, useAnimation } from "framer-motion";
import { Link, useLocation } from "react-router-dom"
import Logo from "/images/weblogo.png"
import EmberCounter from "./EmberCounter";

type NavbarProps = {
    embers: number;
    gainTick: number;
};

export const Navbar = ({ embers, gainTick }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isCondensed, setIsCondensed] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    const menuRef = useRef<HTMLDivElement | null>(null)
    const lastScrollY = useRef(0)

    const location = useLocation();
    const currentRoute = location.pathname;

    const controls = useAnimation();

    useEffect(() => {
        if (!gainTick) return;

        controls.start({
            scale: [1, 1.25, 1],
            filter: [
                "drop-shadow(0 0 6px rgba(255,120,0,0.6))",
                "drop-shadow(0 0 16px rgba(255,160,0,1))",
                "drop-shadow(0 0 6px rgba(255,120,0,0.6))",
            ],
            transition: { duration: 0.4, ease: "easeOut" },
        });
    }, [gainTick]);

    // MOBILE: close on tap outside of menu

    useEffect(() => {
        function handleClickOutside(e: MouseEvent | TouchEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("click", handleClickOutside)
        }
        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [isOpen])

    // DESKTOP: scroll direction logic

    useEffect(() => {
        function handleScroll() {
            if (isCollapsed) return

            const currentY = window.scrollY

            if (currentY > lastScrollY.current && currentY > 50) {
                setIsCondensed(true)
            } else {
                setIsCondensed(false)
            }

            lastScrollY.current = currentY
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [isCollapsed])

    return (
        <>
            {/* Desktop */}
            <nav className="hidden md:block fixed top-6 left-6 z-50">
                <div
                    className="
                    flex items-center
                    bg-[#26221E]
                    shadow-[0_4px_10px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.1)]
                    rounded-3xl px-5 py-3
                    transition-shadow duration-200 ease-out
                    "
                >
                    {/* LOGO */}
                    <Link to="/home" className="shrink-0">
                        <motion.img
                            src={Logo}
                            alt="Logo"
                            className={`h-10 w-auto transition-all duration-300 ease-out ${
                            currentRoute === "/home" ? "drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]" : ""
                            }`}
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                        />
                    </Link>

                    {/* PAGE LINKS: collapse properly */}
                    <div
                        className={`
                            flex items-center overflow-hidden
                            transition-all duration-300 ease-out
                            ${isCollapsed
                            ? "max-w-0 opacity-0 ml-0"
                            : isCondensed
                                ? "max-w-[420px] ml-3 opacity-100"
                                : "max-w-[520px] ml-6 opacity-100"}
                        `}
                    >
                        <Link to="/about" className={`px-4 py-2 rounded-full font-semibold cursor-pointer ${currentRoute === "/about" ? "text-transparent bg-clip-text bg-linear-to-r from-[#333333] to-[#dd1818]" : "text-white hover:bg-gray-600"}`}>About</Link>
                        <Link to="/projects" className={`px-4 py-2 rounded-full font-semibold cursor-pointer ${currentRoute === "/projects" ? "text-transparent bg-clip-text bg-linear-to-r from-[#333333] to-[#dd1818]" : "text-white hover:bg-gray-600"}`}>Projects</Link>
                        <Link to="/gallery" className={`px-4 py-2 rounded-full font-semibold cursor-pointer ${currentRoute === "/gallery" ? "text-transparent bg-clip-text bg-linear-to-r from-[#333333] to-[#dd1818]" : "text-white hover:bg-gray-600"}`}>Gallery</Link>
                        <Link to="/contact" className={`px-4 py-2 rounded-full font-semibold cursor-pointer ${currentRoute === "/contact" ? "text-transparent bg-clip-text bg-linear-to-r from-[#333333] to-[#dd1818]" : "text-white hover:bg-gray-600"}`}>Contact</Link>
                    </div>

                    {/* EMBER COUNTER */}
                    <div className="ml-4 relative flex items-center z-0 overflow-visible">
                        <motion.div
                            animate={controls}
                            className="relative flex items-center"
                        >
                            <EmberCounter embers={embers} />

                            <motion.div
                                key={gainTick}
                                className="absolute inset-0 -z-10 rounded-full bg-orange-500/40 pointer-events-none"
                                initial={{ scale: 1, opacity: 0.6 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </motion.div>
                    </div>

                    {/* Collapse button */}
                    {!isCollapsed ? (
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="ml-4 text-lg font-bold hover:text-slate-300 relative z-10"
                            aria-label="Collapse navbar"
                        >
                            &lt;
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="ml-3 text-lg font-bold hover:text-slate-300 relative z-10"
                            aria-label="Expand navbar"
                        >
                            &gt;
                        </button>
                    )}
                </div>
            </nav>
            
            {/* Mobile */}
            <nav className="md:hidden bg-[#1A1410] text-white shadow-md relative">
                <div className="flex h-16 items-center px-4 justify-between">
                    <Link to="/home">
                        <img src={Logo} alt="Logo" className="h-16 w-auto" />
                    </Link>

                    <div className="flex items-center gap-3">
                        {/* EMBER COUNTER */}
                        <EmberCounter embers={embers} />

                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsOpen(prev => !prev)
                                }}
                                className="focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>

                            <div
                                ref={menuRef}
                                onClick={(e) => e.stopPropagation()}
                                className={`
                                    absolute right-0 top-full mt-2 w-56
                                    bg-slate-800 rounded-md shadow-lg z-50 overflow-hidden
                                    transform transition-all duration-200 ease-out
                                    ${isOpen
                                        ? "opacity-100 translate-y-0 pointer-events-auto"
                                        : "opacity-0 -translate-y-2 pointer-events-none"}
                                `}
                            >
                                {[
                                    { label: "Home", to: "/home" },
                                    { label: "About", to: "/about" },
                                    { label: "Projects", to: "/projects" },
                                    { label: "Gallery", to: "/gallery" },
                                    { label: "Contact", to: "/contact" },
                                ].map(item => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setIsOpen(false)}
                                        className="block py-4 px-5 border-b border-slate-700 hover:bg-slate-700 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}