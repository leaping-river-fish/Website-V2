// increase upgrade costs for dragons
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface DragonProps {
    imagePath: string;
    canFly: boolean;
    facesLeft: boolean;
    index: number;
}

export function Dragon({ imagePath, canFly, facesLeft, index }: DragonProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [direction, setDirection] = useState(facesLeft ? -1 : 1);
    const [isMoving, setIsMoving] = useState(false);

    // Generate random movement
    const moveToRandomPosition = useCallback(() => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Keep dragons in visible area with some padding
        const padding = 100;
        const newX = padding + Math.random() * (screenWidth - padding * 2);
        const newY = canFly 
            ? padding + Math.random() * (screenHeight * 0.6) // Flying dragons can go higher
            : screenHeight * 0.6 + Math.random() * (screenHeight * 0.3); // Walking dragons stay lower
        
        // Update direction based on movement
        setPosition(prev => {
            // Determine which way the dragon should face
            const movingRight = newX > prev.x;
            
            // If dragon naturally faces left, flip the logic
            const newDirection = facesLeft 
                ? (movingRight ? -1 : 1)  // Flip: moving right = -1 (flipped), moving left = 1 (normal)
                : (movingRight ? 1 : -1); // Normal: moving right = 1 (normal), moving left = -1 (flipped)
            
            setDirection(newDirection);
            return { x: newX, y: newY };
        });
        
        setIsMoving(true);
        
        // Stop moving after animation completes
        setTimeout(() => setIsMoving(false), canFly ? 8000 : 5000);
    }, [canFly]);

    // Initialize position with offset based on index
    useEffect(() => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Spread dragons out initially
        const initialX = (screenWidth / 6) * (index + 1);
        const initialY = canFly 
            ? screenHeight * 0.3 + (index * 50)
            : screenHeight * 0.7 + (index * 30);
        
        setPosition({ x: initialX, y: initialY });
        
        // Start random movement after a delay
        const initialDelay = 2000 + index * 1000;
        const timer = setTimeout(moveToRandomPosition, initialDelay);
        
        return () => clearTimeout(timer);
    }, [index, canFly, moveToRandomPosition]);

    // Move to new position periodically
    useEffect(() => {
        if (!isMoving) {
            const interval = setInterval(() => {
                moveToRandomPosition();
            }, 5000 + Math.random() * 5000); // Random interval between 5-10 seconds
            
            return () => clearInterval(interval);
        }
    }, [isMoving, moveToRandomPosition]);

    if (canFly) {
        // Flying dragon - flappy bird style
        return (
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    width: 120,
                    height: 120,
                    zIndex: 10,
                }}
                animate={{
                    x: position.x,
                    y: position.y,
                    scaleX: direction,
                    rotate: isMoving ? [0, -3, 0, 3, 0] : 0,
                }}
                transition={{
                    scaleX: { 
                        duration: 0.8,
                        ease: [0.43, 0.13, 0.23, 0.96],
                    },
                    rotate: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    },
                    x: { 
                        duration: 8, 
                        ease: [0.43, 0.13, 0.23, 0.96],
                    },
                    y: { 
                        duration: 8, 
                        ease: [0.43, 0.13, 0.23, 0.96],
                    },
                }}
            >
                <motion.div
                    animate={{
                        y: [0, -15, 0],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <motion.img
                        src={imagePath}
                        alt="Dragon"
                        className="w-full h-full object-contain drop-shadow-lg"
                        animate={{
                            filter: [
                                "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                                "drop-shadow(0 6px 12px rgba(0,0,0,0.4))",
                                "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                            ],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </motion.div>
            </motion.div>
        );
    } else {
        // Walking dragon - bouncing horizontally
        return (
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    width: 120,
                    height: 120,
                    zIndex: 10,
                }}
                animate={{
                    x: position.x,
                    y: position.y,
                    scaleX: direction,
                }}
                transition={{
                    scaleX: { 
                        duration: 0.8,
                        ease: [0.43, 0.13, 0.23, 0.96],
                    },
                    x: { 
                        duration: 5, 
                        ease: [0.43, 0.13, 0.23, 0.96],
                    },
                    y: { 
                        duration: 5, 
                        ease: [0.43, 0.13, 0.23, 0.96],
                    },
                }}
            >
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <motion.img
                        src={imagePath}
                        alt="Dragon"
                        className="w-full h-full object-contain drop-shadow-lg"
                        animate={{
                            rotate: [0, -2, 0, 2, 0],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </motion.div>
            </motion.div>
        );
    }
}
