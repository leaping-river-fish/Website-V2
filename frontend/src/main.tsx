import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ImageProvider } from "./contexts/ImageContext";
import { FlameThemeProvider } from "./contexts/FlameThemeContext";
import { EmberProvider } from "./contexts/EmberContext";
import { DynamicFavicon } from "./components/reusable_misc/DynamicFavicon";
import FlameThemeDevSwitcher from "./components/reusable_misc/FlameThemeDevSwitcher";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./main.css"
import "./App.css"
import "./globals.css"
import App from "./App"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <EmberProvider>
                    <FlameThemeProvider>
                        <ImageProvider>
                            <DynamicFavicon />
                            <App />
                            {process.env.NODE_ENV === "development" && <FlameThemeDevSwitcher />}
                        </ImageProvider>
                    </FlameThemeProvider>
                </EmberProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
)
