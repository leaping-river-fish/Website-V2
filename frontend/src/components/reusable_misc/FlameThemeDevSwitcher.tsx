import { useFlameTheme } from "../../contexts/FlameThemeContext";
import { useEffect } from "react";

const THEMES = [
    { id: "flame:crimson", label: "Crimson" },
    { id: "flame:gold", label: "Gold" },
    { id: "flame:emerald", label: "Emerald" },
    { id: "flame:azure", label: "Azure" },
    { id: "flame:violet", label: "Violet" },
    { id: "flame:pure", label: "Pure" },
];

export default function FlameThemeDevSwitcher() {
    const { themeId, setThemeId } = useFlameTheme();

    if (!import.meta.env.DEV) return null;

    useEffect(() => {
        if (import.meta.env.DEV) {
            localStorage.setItem("debug-flame-theme", themeId);
        }
    }, [themeId]);

    return (
        <div className="fixed bottom-4 right-4 z-9999">
            <div className="rounded-xl bg-black/80 backdrop-blur-md p-2 shadow-lg">
                <div className="mb-1 text-xs uppercase tracking-wide text-neutral-400">
                    Flame Theme
                </div>
                <div className="flex flex-col gap-1">
                    {THEMES.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => setThemeId(theme.id)}
                            className={`
                                px-3 py-1 rounded-md text-sm text-white
                                transition
                                ${
                                    themeId === theme.id
                                        ? "bg-white/20"
                                        : "hover:bg-white/10"
                                }
                            `}
                        >
                            {theme.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}