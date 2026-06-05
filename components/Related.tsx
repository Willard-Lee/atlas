import { relatedFor } from "@/lib/graph";
import  Link from "next/link";

export default function Related({ url }: {url:string }){
    const links = relatedFor(url);
    if (links.length === 0) return null;
    return (
        <section>
            <h2>Related</h2>
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