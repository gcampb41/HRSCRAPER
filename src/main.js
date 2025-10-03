import { Actor } from "apify";

await Actor.main(async () => {
    console.log("🚀 HRSCRAPER Actor started successfully.");
    await Actor.pushData({ status: "ok", message: "Initial Actor scaffold working." });
});
