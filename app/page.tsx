import Hero from "@/components/Hero";
import FeaturedProject from "@/components/FeaturedProjects";
import LatestPosts from "@/components/LatestPosts";
import GardenTeaser from "@/components/GardenTeaser";

export default function Home() {
    return (
        <main>
            <Hero />

            <div className="border-t" style={{ borderColor: "var(--outline-variant)" }}>
                <FeaturedProject />
            </div>

            {/* Split-pane: transmission log (3/5) + garden nodes (2/5) */}
            <div className="border-t grid grid-cols-1 lg:grid-cols-5"
                 style={{ borderColor: "var(--outline-variant)" }}>
                <div className="lg:col-span-3">
                    <LatestPosts />
                </div>
                <div className="lg:col-span-2">
                    <GardenTeaser />
                </div>
            </div>
        </main>
    );
}
