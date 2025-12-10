import { useState } from "react"
import { Link } from "react-router-dom"
import Logo from "/images/weblogo.png"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

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
                    <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                        )}
                        </svg>
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 text-white rounded-md shadow-lg z-50 overflow-hidden">
                            <Link 
                                to="/home" 
                                className="block w-full py-2 px-3 border-b border-slate-700 hover:bg-slate-700"
                            >
                                Home
                            </Link>
                            <Link 
                                to="/about" 
                                className="block w-full py-2 px-3 border-b border-slate-700 hover:bg-slate-700"
                            >
                                About
                            </Link>
                            <Link 
                                to="/projects" 
                                className="block w-full py-2 px-3 border-b border-slate-700 hover:bg-slate-700"
                            >
                                Projects
                            </Link>
                            <Link 
                                to="/gallery" 
                                className="block w-full py-2 px-3 border-b border-slate-700 hover:bg-slate-700"
                            >
                                Gallery
                            </Link>
                            <Link 
                                to="/contact" 
                                className="block w-full py-2 px-3 border-b border-slate-700 hover:bg-slate-700"
                            >
                                Contact
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}