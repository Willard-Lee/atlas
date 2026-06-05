import Hero from '@/components/Hero';
import FeaturedProject from "@/components/FeaturedProjects";
import LatestPosts from "@/components/LatestPosts";
import GardenTeaser from "@/components/GardenTeaser";
export default function Home() {
  return (
    <main>
      <Hero/>
      <FeaturedProject/>
      <LatestPosts/>
      <GardenTeaser/>
    </main>
  );
}
