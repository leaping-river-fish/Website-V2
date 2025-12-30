import type { ReactNode } from "react";

type ShopSectionProps = {
    title: string;
    description?: string;
    children: ReactNode;
};

export default function ShopSection({
    title,
    description,
    children,
}: ShopSectionProps) {
    return (
        <section className="mb-20">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">{title}</h2>
                {description && (
                    <p className="text-neutral-400 mt-1 max-w-2xl">
                        {description}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </section>
    );
}