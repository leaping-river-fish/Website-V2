import { motion, MotionValue, useTransform } from "framer-motion";

const clouds = [
    // Left side clouds
    { src: "/images/clouds/wide-cloud.png", side: "left", top: 100, speed: 300, scale: 0.8, opacity: 1 },
    { src: "/images/clouds/dense-cloud.png", side: "left", top: 300, speed: 400, scale: 0.8, opacity: 1 },

    // Right side clouds
    { src: "/images/clouds/tall-cloud.png", side: "right", top: 150, speed: 300, scale: 0.8, opacity: 1 },
    { src: "/images/clouds/dense-cloud.png", side: "right", top: 350, speed: 400, scale: 0.8, opacity: 1 },

]

interface FogLayerProps {
    scrollYProgress: MotionValue<number>;
}

export default function FogOfWar({ scrollYProgress }: FogLayerProps) {
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

    return ( 
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
            {clouds.map((cloud, i) => {

                const initialLeft = cloud.side === "left" ? screenWidth / 2 - 100 : undefined;
                const initialRight = cloud.side === "right" ? screenWidth / 2 - 100 : undefined;

                const x = useTransform(
                    scrollYProgress,
                    [0.2, 1],
                    cloud.side === "left" ? [0, -cloud.speed] : [0, cloud.speed]
                );

                return (
                    <motion.img 
                        key={i}
                        src={cloud.src}
                        alt="fog cloud"
                        className="absolute select-none"
                        style={{
                            top: cloud.top,
                            left: cloud.side === "left" ? initialLeft : undefined,
                            right: cloud.side === "right" ? initialRight : undefined,
                            x,
                            scale: cloud.scale,
                            opacity: cloud.opacity,
                        }}
                    />
                )
            })}
        </div>
    );
}

