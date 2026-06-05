import type { Entry } from "./types";
import { getAllEntries } from "./content";
import { visit } from "unist-util-visit";


let _slug: Map<string, string> | null = null;
export function slugMap() {
    return (_slug ??= new Map(getAllEntries().map((e) => [e.slug, e.url])));
}

//Rewrites [[slug | label ]] into real link nodes during compilation
export function remarkWikiLink(){
    const map = slugMap();
    return (tree: any) => visit(tree, "text", (node: any, i: number, parent:any) => {
        const re = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
        if (!re.test(node.value)) 
            return;
        const out: any[] = [];
        let last = 0;
        node.value.replace(re, (m: string, slug: string, label: string, off: number) => {
            if(off > last) out.push({ type: "text", value: node.value.slice(last,off)});
            const url = map.get(slug.trim());
            out.push(url
                ? {type: "link", url, children: [{type:"text", value: (label ?? slug).trim() }]}
                : {type: "text", value: m } // unlinked text if slug not found
            );
            last = off + m.length;
            return m;
        });
        if(last < node.value.length) out.push({type: "text", value: node.value.slice(last)});
        parent.children.splice(i,1, ...out);
    })
}

const WIKI = /\[\[([^\]|]+)/g;
const MD = /\]\((\/(?:projects|blog|garden|resources)\/[^)\s]+)\)/g;
let _graph: { forward: Map<string,string[]>; back: Map<string,string[]> } | null = null;

export function graph() {
  if (_graph) return _graph;
  const map = slugMap(); const forward = new Map<string,string[]>();
  for (const e of getAllEntries()) {
    const t = new Set<string>();
    for (const m of e.raw.matchAll(WIKI)) { const u = map.get(m[1].trim()); if (u) t.add(u); }
    for (const m of e.raw.matchAll(MD)) t.add(m[1]);
    forward.set(e.url, [...t]);
  }
  const back = new Map<string,string[]>();
  for (const [from, tos] of forward) for (const to of tos)
    back.set(to, [...(back.get(to) ?? []), from]);
  return (_graph = { forward, back });
}

export const backlinksFor = (url: string): Entry[] => {
  const s = new Set(graph().back.get(url) ?? []);
  return getAllEntries().filter((e) => s.has(e.url));
};

export const relatedFor = (url: string, limit = 5): Entry[] => {
  const all = getAllEntries(); const self = all.find((e) => e.url === url);
  if (!self) return [];
  const my = new Set(self.frontmatter.tags ?? []);
  return all.filter((e) => e.url !== url)
    .map((e) => ({ e, s: (e.frontmatter.tags ?? []).filter((t) => my.has(t)).length }))
    .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.e);
};