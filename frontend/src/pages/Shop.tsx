import { motion } from "framer-motion";
import EmberIcon from "../components/navbar/EmberIcon";
import ShopCard from "../components/shop/ShopCard";
import ShopSection from "../components/shop/ShopSection";
import { NavbarSpacer } from "../components/reusable_misc/tempname";

export default function Shop() {
    return (
        <motion.div
            className="min-h-screen px-6 py-24 bg-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <NavbarSpacer />

            {/* HEADER */}
            <div className="max-w-6xl mx-auto mb-16">
                <div className="flex items-center gap-3 mb-2">
                    <EmberIcon size={28} />
                    <h1 className="text-4xl font-bold">Ember Shop</h1>
                </div>
                <p className="text-neutral-400 max-w-xl">
                    Spend embers to customize your flame, cursor, and effects.
                </p>
            </div>

            {/* SECTIONS */}
            <div className="max-w-6xl mx-auto">
                <ShopSection
                    title="Flame Color Themes"
                    description="Change the color of your embers and flame effects."
                >
                    <ShopCard title="Crimson Flame" description="A deep red flame that burns hot and steady. Reliable, powerful, and everburning" comingSoon />
                    <ShopCard title="Gold Flame" description="A radiant golden flame that burns hotter than crimson, concentrating intense heat into a refined, searing core." comingSoon />
                    <ShopCard title="Emerald Flame" description="A vivid emerald flame that burns with unstable intensity, radiating searing heat that strains the limits of combustion." comingSoon />
                    <ShopCard title="Azure Flame" description="A piercing azure flame that burns with relentless intensity, emitting heat so severe it feels almost unnatural." comingSoon />
                    <ShopCard title="Violet Flame" description="A luminous violet flame infused with arcane energy, radiating heat so powerful it bends the fabric of reality." comingSoon />
                    <ShopCard title="Pure Flame" description="A blinding white flame of absolute purity, burning at the highest possible temperature. Nothing burns hotter." comingSoon />
                </ShopSection>

                <ShopSection
                    title="Custom Cursors"
                    description="Animated cursors forged from embers."
                >
                    <ShopCard title="Ember Cursor" description="A glowing ember follows your pointer." comingSoon />
                </ShopSection>

                <ShopSection
                    title="Special Effects"
                    description="Trails, particles, and enhanced flame physics."
                >
                    <ShopCard title="Ember Trails" description="Leave fire in your wake." comingSoon />
                </ShopSection>
            </div>
        </motion.div>
    );
}
