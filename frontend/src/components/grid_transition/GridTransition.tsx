import { useEffect, useRef, useState } from "react";
import "./transition.css";

interface GridTransitionProps {
    trigger: boolean;
    onComplete?: () => void;
}

const GridTransition: React.FC<GridTransitionProps> = ({ trigger, onComplete }) => {
    const gridRef = useRef<HTMLDivElement | null>(null);
    const [gridSize, setGridSize] = useState({ rows: 8, cols: 12 });
    const { rows, cols } = gridSize;

    useEffect(() => {
        const updateGridSize = () => {
            const width = window.innerWidth;

            if (width < 640) {
                setGridSize({ rows: 5, cols: 6 });
            } else if (width < 1024) {
                setGridSize({ rows: 6, cols: 8 });
            } else {
                setGridSize({ rows: 8, cols: 12 });
            }
        };

        updateGridSize();
        window.addEventListener("resize", updateGridSize);

        return () => window.removeEventListener("resize", updateGridSize);
    }, []);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        grid.innerHTML = "";

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                tile.dataset.row = String(row);
                tile.dataset.col = String(col);
                grid.appendChild(tile);
            }
        }
    }, [rows, cols])

    useEffect(() => {
        if(!trigger || !gridRef.current) return;

        const tiles = Array.from(
            gridRef.current.querySelectorAll<HTMLDivElement>(".tile")
        );

        tiles.forEach((tile) => {
            const row = Number(tile.dataset.row);
            const col = Number(tile.dataset.col);
            const delay = ((rows - row) + (cols - col)) * (window.innerWidth < 640 ? 30 : 40);

            setTimeout(() => tile.classList.add("bubble-up"), delay);
        });

        const maxDelay = ((rows + cols) * (window.innerWidth < 640 ? 30 : 40)) + 600;

        setTimeout(() => {
            onComplete?.();
        }, maxDelay);

        const totalDuration = maxDelay + 100;

        setTimeout(() => {
            tiles.forEach((tile) => {
                const row = Number(tile.dataset.row);
                const col = Number(tile.dataset.col);
                const delay = (row + col) * (window.innerWidth < 640 ? 30 : 40);

                setTimeout(() => {
                    tile.classList.remove("bubble-up");
                    tile.classList.add("bubble-down");
                }, delay);
            });
        }, totalDuration);

        setTimeout(() => {
            tiles.forEach((tile) => tile.classList.remove("bubble-down"));
        }, totalDuration + 1000);
    }, [trigger, onComplete]);

    return <div ref={gridRef} className="transition-grid"></div>;
};

export default GridTransition;