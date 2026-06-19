import { getGardenTree } from "@/lib/garden-tree";
import GardenTree from "./GardenTree";

export default async function GardenSidebar() {
    const tree = getGardenTree();
    return <GardenTree tree={tree} />;
}
