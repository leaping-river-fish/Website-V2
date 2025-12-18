import { useEffect, useState } from "react";
import "./transition.css";

interface VerticalWipeTransitionProps {
    trigger: boolean;
    onComplete?: () => void;
}

const VerticalWipeTransition: React.FC<VerticalWipeTransitionProps> = ({
    trigger,
    onComplete,
}) => {
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (!trigger) return;

        setActive(true);

        const closeDuration = 400;

        const completeTimeout = setTimeout(() => {
            onComplete?.();
        }, closeDuration);

        const totalDuration = closeDuration + 400;

        const resetTimeout = setTimeout(() => {
            setActive(false);
        }, totalDuration);

        return () => {
            clearTimeout(completeTimeout);
            clearTimeout(resetTimeout);
        };
    }, [trigger, onComplete]);

    if (!active) return null;

    return (
        <div className="wipe-container">
            <div className="wipe-top" />
            <div className="wipe-bottom" />
        </div>
    );
};

export default VerticalWipeTransition;