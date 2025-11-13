import { Routes, Route } from 'react-router-dom'
import StartPage from './pages/Start'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'

export default function App() {
    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <Routes>
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