import {getEntries } from '@/lib/content';
import type { ResourceFrontmatter } from '@/lib/types';
import Link from 'next/link';

export default async function ResourcePage() {
    const resources = getEntries<ResourceFrontmatter>("resource");
    return (
        <main className = "px-16 py-24">
            <h1> Resource Page </h1>
            <ul>
                {resources.map((resource) => (
                    <li key = {resource.slug}>
                        <Link href = {resource.url}>
                            {resource.frontmatter.title}
                        </Link>
                        <span>
                            {resource.frontmatter.type}
                        </span>
                        <span>
                            {resource.frontmatter.authors}
                        </span>
                        <span>
                            {resource.frontmatter.year}
                        </span>
                    </li>
                ))}
            </ul>
        </main>
    )
}