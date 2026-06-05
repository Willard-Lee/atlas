import { backlinksFor } from "@/lib/graph";
import  Link from "next/link";

export default function Backlinks({ url }: {url:string }){
    const links = backlinksFor(url);
    if (links.length === 0) return null;
    return (
        <section>
            <h2>Backlinks</h2>
            <ul>
                {links.map((entry) => (
                <li key={entry.url}>
                    <Link href = {entry.url}>{entry.frontmatter.title}</Link>
                </li>
                ))}
            </ul>
        </section>
    )
}