"use client";
import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import Link from "next/link";

type SearchEntry = {
    title: string;
    url: string; 
    type: string;
    tags: string[];
    summary: string;
};

export default function Search(){
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchEntry[]>([]);
    const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);

    useEffect(() => { //this part runs once wheen components first load
        fetch("/search-index.json") // then fetches the search index JSON once the component loads
        .then((r) => r.json())
        .then((data) => {
            setFuse(new Fuse(data, {keys: ["title","summary", "tags"], threshold: 0.3})) // builds the Fuse search engine
        })
    }, [])

    useEffect(() => { // this part runs every time 'query' changes 
        if(!fuse || !query) return setResults([]); //every time the use types (query changes)
        setResults(fuse.search(query).map((r) => r.item)); //runs the search and updates results.
    }, [query,fuse]);
    
    return (
        <div>
            <input
                type = "text"
                placeholder = "Search..."
                value = {query}
                onChange = {(e) => setQuery(e.target.value)}
            />
            <ul>
                {results.map((r) => (
                    <li key = {r.url}>
                        <Link href = {r.url}>{r.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

 
// To understand how these react function works { useState, useEffect }
// 1. useState - stores a value that can change. When it changes, the component re-renders.
// 2. useEffect - runs code after the component loads, or when a value changes

