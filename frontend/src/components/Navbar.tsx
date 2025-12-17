import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import Logo from "/images/weblogo.png"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement | null>(null)

    // close on tap outside of menu
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

    return (
        <nav className="bg-[#1A1410] text-white shadow-md relative">
            <div className="flex h-16 items-center px-4 md:px-8 justify-between relative">
                
                {/* DESKTOP */}
                <div className="flex items-center flex-1">
                    {/* Logo */}
                    <Link to="/home">
                        <img src={Logo} alt="Logo" className="h-16 w-auto" />
                    </Link>

                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-6 md:text-lg">
                        <Link to="/about" className="nav-link hover:text-slate-300 font-semibold">About</Link>
                        <Link to="/projects" className="nav-link hover:text-slate-300 font-semibold">Projects</Link>
                        <Link to="/gallery" className="nav-link hover:text-slate-300 font-semibold">Gallery</Link>
                        <Link to="/contact" className="nav-link hover:text-slate-300 font-semibold">Contact</Link>
                    </div>
                </div>

                {/* MOBILE */}
                <div className="md:hidden relative">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsOpen((prev) => !prev)
                        }}
                        className="focus:outline-none"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                        )}
                        </svg>
                    </button>

                    <div
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                        className={`
                            absolute right-0 top-full mt-2 w-56
                            bg-slate-800 text-white rounded-md shadow-lg z-50 overflow-hidden
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
                        ].map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsOpen(false)}
                                className="
                                    block w-full
                                    py-4 px-5
                                    border-b border-slate-700
                                    hover:bg-slate-700
                                    active:bg-slate-600
                                    transition-colors
                                    text-base
                                "
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}