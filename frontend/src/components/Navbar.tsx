import { useState } from "react"
import { Link } from "react-router-dom"
import Logo from "../assets/weblogo.png"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="bg-slate-800 text-white shadow-md relative">
            <div className="flex h-16 items-center px-4 md:px-8 justify-between">
                
                {/* DESKTOP */}
                <div className="flex items-center space-x-6">
                    {/* Logo */}
                    <Link to="/home">
                        <img src={Logo} alt="Logo" className="h-12 w-auto" />
                    </Link>

                    <div className="hidden md:flex space-x-6">
                        <Link to="/about" className="hover:text-slate-300">About</Link>
                        <Link to="/projects" className="hover:text-slate-300">Projects</Link>
                        <Link to="/gallery" className="hover:text-slate-300">Gallery</Link>
                        <Link to="/contact" className="hover:text-slate-300">Contact</Link>
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
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 text-white p-4 flex flex-col space-y-2 rounded-md shadow-lg z-50">
                            <Link to="/home" className="hover:text-slate-300">Home</Link>
                            <Link to="/about" className="hover:text-slate-300">About</Link>
                            <Link to="/projects" className="hover:text-slate-300">Projects</Link>
                            <Link to="/gallery" className="hover:text-slate-300">Gallery</Link>
                            <Link to="/contact" className="hover:text-slate-300">Contact</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}