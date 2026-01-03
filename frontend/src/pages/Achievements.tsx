import { Trophy } from "lucide-react";

export default function Achievements() {
    return (
        <div className="bg-[#1A1410] flex flex-col items-center justify-center min-h-screen text-center px-4">
            <Trophy size={64} className="text-yellow-400 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Achievements</h1>
            <p className="text-lg text-gray-300">Coming Soon!</p>
        </div>
    );
}