import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ImageProvider } from "./contexts/ImageContext";
import { FlameThemeProvider } from "./contexts/FlameThemeContext";
import { EmberProvider } from "./contexts/EmberContext";
import FlameThemeDevSwitcher from "./components/reusable_misc/FlameThemeDevSwitcher";
import "./main.css"
import "./App.css"
import "./globals.css"
import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
        <BrowserRouter>
            <EmberProvider>
                <FlameThemeProvider>
                    <ImageProvider>
                        <App />
                        {process.env.NODE_ENV === "development" && <FlameThemeDevSwitcher />}
                    </ImageProvider>
                </FlameThemeProvider>
            </EmberProvider>
        </BrowserRouter>
  </StrictMode>,
)
