import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialOverlayProps {
    targetId: string | null;
}

interface SpotlightPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

export function TutorialOverlay({ targetId }: TutorialOverlayProps) {
    const [spotlightPos, setSpotlightPos] = useState<SpotlightPosition | null>(null);
    const animationFrameRef = useRef<number>(0);

    const updateSpotlightPosition = (element: Element) => {
        const rect = element.getBoundingClientRect();
        const padding = 12; 
        
        setSpotlightPos({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
        });
    };

    useEffect(() => {
        if (!targetId) {
            setSpotlightPos(null);
            return;
        }
    
        // Try to find the element, checking both desktop and mobile versions
        let element = document.querySelector(`[data-tutorial-id="${targetId}"]`);
        
        // If not found, try mobile version
        if (!element) {
            element = document.querySelector(`[data-tutorial-id="${targetId}-mobile"]`);
        }
        
        // If we found an element, check if it's actually visible
        if (element) {
            const rect = element.getBoundingClientRect();
            // Check if element has dimensions (visible elements have width/height > 0)
            if (rect.width === 0 || rect.height === 0) {
                // Element is hidden, try the alternate version
                const alternateId = targetId.endsWith('-mobile') 
                    ? targetId.replace('-mobile', '') 
                    : `${targetId}-mobile`;
                element = document.querySelector(`[data-tutorial-id="${alternateId}"]`);
            }
        }
        
        if (!element) {
            console.warn(`Tutorial target not found: ${targetId}`);
            setSpotlightPos(null);
            return;
        }
    
        // Check if element is in viewport
        const rect = element.getBoundingClientRect();
        const isInViewport = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    
        if (!isInViewport) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
          
            setTimeout(() => {
                updateSpotlightPosition(element);
            }, 500);
        } else {
            updateSpotlightPosition(element);
        }
    
        // Update position on scroll and resize
        const handleUpdate = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(() => {
                // Try to find the element, checking both desktop and mobile versions
                let el = document.querySelector(`[data-tutorial-id="${targetId}"]`);
                
                // If not found, try mobile version
                if (!el) {
                    el = document.querySelector(`[data-tutorial-id="${targetId}-mobile"]`);
                }
                
                // If we found an element, check if it's actually visible
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // Check if element has dimensions (visible elements have width/height > 0)
                    if (rect.width === 0 || rect.height === 0) {
                        // Element is hidden, try the alternate version
                        const alternateId = targetId.endsWith('-mobile') 
                            ? targetId.replace('-mobile', '') 
                            : `${targetId}-mobile`;
                        el = document.querySelector(`[data-tutorial-id="${alternateId}"]`);
                    }
                }
                
                if (el) {
                    updateSpotlightPosition(el);
                }
            });
        };
    
        window.addEventListener('scroll', handleUpdate, true);
        window.addEventListener('resize', handleUpdate);
    
        return () => {
            window.removeEventListener('scroll', handleUpdate, true);
            window.removeEventListener('resize', handleUpdate);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [targetId]);

    return (
        <AnimatePresence>
            {spotlightPos && (
                <>
                    {/* Dark overlay - above navbar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 pointer-events-none z-55"
                        style={{
                            background: `radial-gradient(
                            circle at ${spotlightPos.left + spotlightPos.width / 2}px ${spotlightPos.top + spotlightPos.height / 2}px,
                            transparent ${Math.max(spotlightPos.width, spotlightPos.height) / 2}px,
                            rgba(0, 0, 0, 0.75) ${Math.max(spotlightPos.width, spotlightPos.height) / 2 + 100}px
                            )`
                        }}
                    />
                    
                    {/* Highlight border - above navbar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="fixed pointer-events-auto rounded-lg z-65"
                        style={{
                            top: spotlightPos.top,
                            left: spotlightPos.left,
                            width: spotlightPos.width,
                            height: spotlightPos.height,
                            boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)',
                            transition: 'all 0.3s ease-out'
                        }}
                    />
                </>
            )}
        </AnimatePresence>
    );
}
