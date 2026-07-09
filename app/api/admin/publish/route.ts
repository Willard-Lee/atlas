import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const run = promisify(execFile);
const cwd = process.cwd();

// Paths whose changes are considered "content" and get committed by publish.
const TRACKED = ["content", "public/images"];

function devOnly() {
    return process.env.NODE_ENV !== "development";
}

async function git(args: string[]) {
    // execFile with an argv array — no shell, so nothing in `args` (e.g. the
    // commit message) is interpreted by a shell. Prevents injection.
    const { stdout } = await run("git", args, { cwd, maxBuffer: 1024 * 1024 });
    return stdout.trim();
}

// Raw (untrimmed) variant — porcelain status codes use a leading space column
// (e.g. " M path"), which a global trim() would strip from the first line.
async function gitRaw(args: string[]) {
    const { stdout } = await run("git", args, { cwd, maxBuffer: 1024 * 1024 });
    return stdout;
}

async function currentBranch() {
    return git(["rev-parse", "--abbrev-ref", "HEAD"]);
}

/** GET → working-tree status for tracked paths + ahead/behind vs upstream. */
export async function GET() {
    if (devOnly()) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
        const branch = await currentBranch();
        const porcelain = await gitRaw(["status", "--porcelain", "--", ...TRACKED]);
        const files = porcelain
            .split("\n")
            .filter((line) => line.length > 0)
            .map((line) => ({
                status: line.slice(0, 2).trim(),
                path: line.slice(3),
            }));

        // Ahead/behind vs the tracking branch (if one is configured).
        let ahead = 0;
        let behind = 0;
        let upstream: string | null = null;
        try {
            upstream = await git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
            const counts = await git(["rev-list", "--left-right", "--count", "@{u}...HEAD"]);
            const [b, a] = counts.split(/\s+/).map((n) => parseInt(n, 10) || 0);
            behind = b;
            ahead = a;
        } catch {
            /* no upstream configured — leave ahead/behind at 0, upstream null */
        }

        return NextResponse.json({ branch, upstream, ahead, behind, files });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

/** POST { message } → git add tracked paths, commit, push to origin/<branch>. */
export async function POST(req: NextRequest) {
    if (devOnly()) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { message } = (await req.json()) as { message?: string };
    const commitMessage = message?.trim();
    if (!commitMessage)
        return NextResponse.json({ error: "Commit message is required" }, { status: 400 });

    try {
        const branch = await currentBranch();

        // Only add tracked paths that actually exist. `git add` aborts on a
        // pathspec that matches nothing (e.g. public/images before the first
        // image upload), which would otherwise fail the whole publish.
        const existing = TRACKED.filter((p) => existsSync(path.join(cwd, p)));
        if (existing.length === 0) {
            return NextResponse.json({ committed: false, message: "Nothing to commit" });
        }

        await git(["add", "--", ...existing]);

        // Nothing staged? Report cleanly instead of failing the commit.
        const staged = await git(["diff", "--cached", "--name-only", "--", ...existing]);
        if (!staged) {
            return NextResponse.json({ committed: false, message: "Nothing to commit" });
        }

        await git(["commit", "-m", commitMessage]);
        const pushOut = await git(["push", "origin", branch]);

        const head = await git(["rev-parse", "--short", "HEAD"]);
        return NextResponse.json({
            committed: true,
            pushed: true,
            branch,
            commit: head,
            files: staged.split("\n").filter(Boolean),
            output: pushOut,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
