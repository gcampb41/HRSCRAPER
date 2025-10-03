import { Actor } from "apify";
import * as cheerio from "cheerio";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, { timeoutMs, maxRetries }) {
    let attempt = 0;
    while (true) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    "user-agent": "HRSCRAPER/0.0.2 (+https://github.com/)",
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
            });
            clearTimeout(timeout);
            return response;
        } catch (error) {
            clearTimeout(timeout);
            attempt += 1;
            if (attempt > maxRetries) throw error;
            await sleep(500 * attempt);
        }
    }
}

await Actor.main(async () => {
    const input = (await Actor.getInput()) ?? {};
    const {
        dryRun = true,
        startUrls = [],
        selectors = [],
        requestTimeoutMs = 15000,
        maxRetries = 2,
    } = input;

    const env = Actor.getEnv();
    const runId = env.actorRunId;
    const startedAt = new Date().toISOString();

    console.log(
        JSON.stringify({
            level: "info",
            msg: "HRSCRAPER run started",
            runId,
            startedAt,
            dryRun,
            startUrlsCount: startUrls.length,
        }),
    );

    if (dryRun || startUrls.length === 0) {
        await Actor.pushData({
            status: "ok",
            mode: "dry",
            message: dryRun
                ? "Dry run: no requests made."
                : "No startUrls provided; nothing to fetch.",
            runId,
            startedAt,
            selectors,
        });

        console.log(
            JSON.stringify({ level: "info", msg: "Dry path finished", runId }),
        );
        return;
    }

    for (const url of startUrls) {
        const began = Date.now();
        try {
            const response = await fetchWithRetry(url, {
                timeoutMs: requestTimeoutMs,
                maxRetries,
            });
            const contentType = response.headers.get("content-type") ?? "";
            const status = response.status;
            const ok = response.ok;

            let title = null;
            let metaDescription = null;
            const selectedText = [];

            if (ok && contentType.includes("text/html")) {
                const html = await response.text();
                const $ = cheerio.load(html);

                title = ($("title").first().text() || null)?.trim() || null;
                const metaDesc = $('meta[name="description"]').attr("content") || null;
                metaDescription = metaDesc ? metaDesc.trim() : null;

                if (Array.isArray(selectors) && selectors.length > 0) {
                    for (const selector of selectors) {
                        try {
                            const text = $(selector).first().text()?.trim();
                            if (text) {
                                selectedText.push({ selector, text });
                            }
                        } catch (error) {
                            // Ignore selector errors
                        }
                    }
                }
            }

            await Actor.pushData({
                url,
                status,
                ok,
                contentType,
                fetchedMs: Date.now() - began,
                title,
                metaDescription,
                selectedText,
            });

            console.log(
                JSON.stringify({
                    level: "info",
                    msg: "Fetched",
                    url,
                    status,
                    ok,
                    titlePreview: title ? title.slice(0, 80) : null,
                }),
            );
        } catch (error) {
            await Actor.pushData({
                url,
                error: String(error?.message ?? error),
                fetchedMs: Date.now() - began,
            });

            console.log(
                JSON.stringify({
                    level: "error",
                    msg: "Fetch failed",
                    url,
                    error: String(error?.message ?? error),
                }),
            );
        }
    }

    console.log(
        JSON.stringify({
            level: "info",
            msg: "HRSCRAPER run finished",
            runId,
            endedAt: new Date().toISOString(),
        }),
    );
});
