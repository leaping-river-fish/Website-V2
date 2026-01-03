import { motion } from "framer-motion";

const clouds = [
    { src: "/images/clouds/dense-cloud.png", left: -100, scale: 0.7, opacity: 1 },
    { src: "/images/clouds/tall-cloud.png", left: -500, scale: 0.6, opacity: 1 },
    { src: "/images/clouds/wide-cloud.png", left: 400, scale: 0.9, opacity: 1 },
    { src: "/images/clouds/dense-cloud.png", left: 400, scale: 0.8, opacity: 1 },
];

export default function StaticFogOfWar({ height = 300 }: { height?: number }) {
    return (
        <div
            className="bottom-0 relative w-full"
            style={{ height }}
        >
            {clouds.map((cloud, i) => (
                <motion.img
                    key={i}
                    src={cloud.src}
                    alt="cloud"
                    className="absolute bottom-0 select-none z-30"
                    style={{
                        left: cloud.left,
                        bottom: -160,
                        scale: cloud.scale,
                        opacity: cloud.opacity,
                    }}
                />
            ))}
        </div>
    );
}