import { Suspense } from "react";
import { Tweet as ReactTweet } from "react-tweet";
import EmbedFrame from "./EmbedFrame";

/**
 * Twitter / X embed via react-tweet (SSR-friendly, no client script).
 * Accepts a tweet id or a full status URL.
 *
 *   <Tweet id="1629307668568633344" />
 *   <Tweet url="https://x.com/user/status/1629307668568633344" />
 */

function idFrom(input?: string): string | null {
    if (!input) return null;
    const trimmed = input.trim();
    if (/^\d+$/.test(trimmed)) return trimmed;
    const m = trimmed.match(/status(?:es)?\/(\d+)/);
    return m ? m[1] : null;
}

function Fallback({ raw }: { raw: string }) {
    return (
        <div
            className="p-4 font-mono text-xs"
            style={{ color: "var(--on-surface-variant)", border: "1px solid var(--outline-variant)" }}
        >
            TWEET UNAVAILABLE —{" "}
            <a href={raw} style={{ color: "var(--secondary-container)" }}>
                view on X ↗
            </a>
        </div>
    );
}

export default function Tweet({ id, url }: { id?: string; url?: string }) {
    const tweetId = idFrom(id) ?? idFrom(url);
    const raw = url ?? (id ? `https://x.com/i/status/${id}` : "#");

    if (!tweetId) {
        return (
            <EmbedFrame label="X / TWITTER">
                <Fallback raw={raw} />
            </EmbedFrame>
        );
    }

    return (
        <EmbedFrame label="X / TWITTER">
            <div className="flex justify-center" data-theme="dark">
                <Suspense fallback={<Fallback raw={raw} />}>
                    {/* react-tweet renders its own not-found state if the id is invalid */}
                    <ReactTweet id={tweetId} fallback={<Fallback raw={raw} />} />
                </Suspense>
            </div>
        </EmbedFrame>
    );
}
