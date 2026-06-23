import Hero from "@/components/Hero";
import GlitchBurst from "@/components/GlitchBurst";
import FeaturedProjects from "@/components/FeaturedProjects";
import ContentFeed from "@/components/ContentFeed";
import NavigationGuide from "@/components/NavigationGuide";
import QuoteBlock from "@/components/QuoteBlock";

export default function Home() {
    return (
        <main>
            <Hero />
            <GlitchBurst />
            <FeaturedProjects />
            <ContentFeed />
            <NavigationGuide />
            {/* Floating — position:fixed, does not affect page flow */}
            <QuoteBlock />
        </main>
    );
}
