import { createContext, useContext, useState, useEffect } from "react";
import type { FlameThemeTypes } from "../components/themes/flameThemeTypes";
import { FLAME_THEMES } from "../components/themes/flameThemes";

type FlameThemeContextValue = {
    theme: FlameThemeTypes;
    themeId: string;
    setThemeId: (id: string) => void;
};

const FlameThemeContext = createContext<FlameThemeContextValue | null>(null);

export function FlameThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeId, setThemeId] = useState(FLAME_THEMES[0].id);

    const theme = FLAME_THEMES.find(t => t.id === themeId)!;

    useEffect(() => {
        const root = document.documentElement;

        root.style.setProperty("--flame-text-base", "#333333");
        root.style.setProperty("--flame-primary", theme.primary);
        root.style.setProperty("--flame-accent", theme.accent);
        root.style.setProperty("--flame-glow", theme.glow);

        root.style.setProperty("--flame-icon-primary", theme.iconPrimary);
        root.style.setProperty("--flame-icon-accent", theme.iconAccent);
        root.style.setProperty("--flame-icon-glow", theme.iconGlow);

        root.style.setProperty("--flare-color-0", theme.flareColor0);
        root.style.setProperty("--flare-color-35", theme.flareColor35);
        root.style.setProperty("--flare-color-60", theme.flareColor60);
        root.style.setProperty("--flare-glow-1", theme.flareGlow1);
        root.style.setProperty("--flare-glow-2", theme.flareGlow2);
        root.style.setProperty("--flare-shockwave", theme.flareShockwave);
        root.style.setProperty("--flare-particles", theme.flareParticles);
        root.style.setProperty("--flare-anim-glow", theme.flareAnimGlow);
    }, [theme]);

    return (
        <FlameThemeContext.Provider value={{ theme, themeId, setThemeId }}>
            {children}
        </FlameThemeContext.Provider>
    );
}

export function useFlameTheme() {
    const ctx = useContext(FlameThemeContext);
    if (!ctx) throw new Error("useFlameTheme must be used within FlameThemeProvider");
    return ctx;
}
