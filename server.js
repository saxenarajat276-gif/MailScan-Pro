// ==========================================
// MAILSCAN PRO - COMPLETE BACKEND
// ==========================================

// Load environment variables
require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");

// ==========================================
// APP CONFIGURATION
// ==========================================

const app = express();

const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, "public");

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({
    extended: true,
    limit: "10kb"
}));

// Serve frontend files
app.use(express.static(PUBLIC_DIR));

// ==========================================
// EMAIL VALIDATION
// ==========================================

function validEmail(email) {

    if (typeof email !== "string") {
        return false;
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    return emailRegex.test(email);
}

// ==========================================
// REQUEST ID GENERATOR
// ==========================================

function hashForRequest(email) {

    return crypto
        .createHash("sha256")
        .update(email)
        .digest("hex")
        .substring(0, 12);
}

// ==========================================
// BASIC RATE LIMITER
// ==========================================

const requestTracker = new Map();

function rateLimit(req, res, next) {

    const ip =
        req.ip || req.socket.remoteAddress;

    const now = Date.now();

    const windowTime = 15 * 60 * 1000;

    const maxRequests = 20;

    let record = requestTracker.get(ip);

    if (!record || now > record.resetTime) {

        record = {
            count: 0,
            resetTime: now + windowTime
        };
    }

    record.count++;

    requestTracker.set(ip, record);

    if (record.count > maxRequests) {

        return res.status(429).json({

            error:
                "Too many scan requests. Please try again later."

        });
    }

    next();
}

// ==========================================
// XPOSEDORNOT API CONFIGURATION
// ==========================================

const XON_API =
    "https://api.xposedornot.com/v1/check-email/";

// ==========================================
// EXTRACT BREACH NAMES
// ==========================================

function extractBreaches(data) {

    if (!data || !Array.isArray(data.breaches)) {
        return [];
    }

    const names = data.breaches.flat(Infinity);

    return [
        ...new Set(
            names.filter(
                item =>
                    typeof item === "string" &&
                    item.trim().length > 0
            )
        )
    ];
}

// ==========================================
// MAIN EMAIL SCANNER API
// ==========================================

app.post("/api/scan", rateLimit, async (req, res) => {

    const email = String(
        req.body?.email || ""
    )
        .trim()
        .toLowerCase();

    // Validate email
    if (!validEmail(email)) {

        return res.status(400).json({

            error: "Please enter a valid email address."

        });
    }

    const requestId = hashForRequest(email);

    let controller;

    try {

        console.log("New MailScan request:", requestId);

        // ======================================
        // CALL XPOSEDORNOT API
        // ======================================

        const apiUrl =
            XON_API + encodeURIComponent(email);

        controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 15000);

        let upstream;

        try {

            upstream = await fetch(apiUrl, {

                method: "GET",

                headers: {

                    "Accept": "application/json",

                    "User-Agent": "MailScan-Pro/1.0"

                },

                signal: controller.signal

            });

        } finally {

            clearTimeout(timeout);

        }

        // ======================================
        // HANDLE RATE LIMIT
        // ======================================

        if (upstream.status === 429) {

            return res.status(429).json({

                error:
                    "XposedOrNot API rate limit reached. Please try again later."

            });
        }

        // ======================================
        // HANDLE NOT FOUND
        // ======================================

        if (upstream.status === 404) {

            return res.json({

                requestId,

                email,

                found: false,

                riskScore: null,

                riskLevel: "Not assessed",

                summary: {

                    breaches: 0,

                    exposures: null,

                    uniquePlatforms: 0,

                    uniqueDomains: 0,

                    affectedRecords: null

                },

                platforms: [],

                breaches: [],

                source: "XposedOrNot",

                disclaimer:
                    "No matching breach records were returned by the provider."

            });
        }

        // ======================================
        // HANDLE OTHER API ERRORS
        // ======================================

        if (!upstream.ok) {

            const errorText =
                await upstream.text();

            console.error(
                "XposedOrNot API error:",
                upstream.status,
                errorText.substring(0, 500)
            );

            return res.status(502).json({

                error:
                    "The breach-data provider is temporarily unavailable."

            });
        }

        // ======================================
        // READ API RESPONSE
        // ======================================

        const data = await upstream.json();

        console.log(
            "XposedOrNot response status:",
            data.status || "received"
        );

        // ======================================
        // EXTRACT PLATFORM NAMES
        // ======================================

        const breachNames =
            extractBreaches(data);

        // ======================================
        // FORMAT PLATFORM DATA
        // ======================================

        const platforms = breachNames.map(name => {

            return {

                // Platform information
                platform: name,

                name: name,

                title: name,

                domain: null,

                // Breach information
                breachDate: null,

                addedDate: null,

                // Exposure information
                exposedData: [],

                dataClasses: [],

                affectedRecords: null,

                // Risk information
                riskPoints: null,

                risk: "Not assessed",

                riskLevel: "Not assessed",

                // Source information
                source: "XposedOrNot",

                status: "Known breach exposure"

            };

        });

        // ======================================
        // STATISTICS
        // ======================================

        const totalPlatforms = platforms.length;

        const uniquePlatforms = new Set(
            platforms.map(item => item.platform)
        ).size;

        // ======================================
        // FINAL RESPONSE
        // ======================================

        return res.json({

            requestId,

            email,

            found: totalPlatforms > 0,

            riskScore: null,

            riskLevel: "Not assessed",

            summary: {

                breaches: totalPlatforms,

                exposures: null,

                uniquePlatforms,

                uniqueDomains: null,

                affectedRecords: null

            },

            platforms,

            // Frontend compatibility
            breaches: platforms,

            source: "XposedOrNot",

            disclaimer:
                "These are known breach records associated with this email. They do not prove that an account is currently active on the listed platform."

        });

    } catch (error) {

        console.error(
            "MailScan error:",
            error.name,
            error.message
        );

        if (error.name === "AbortError") {

            return res.status(504).json({

                error:
                    "The breach-data provider took too long to respond. Please try again."

            });
        }

        return res.status(500).json({

            error:
                "Unable to complete the email scan. Please try again later."

        });

    }
});

// ==========================================
// UNKNOWN API ROUTES
// ==========================================

app.use("/api", (req, res) => {

    res.status(404).json({

        error: "API endpoint not found."

    });

});

// ==========================================
// SERVER START
// ==========================================

app.listen(PORT, () => {

    console.log("-----------------------------------");

    console.log("       MAILSCAN PRO SERVER");

    console.log("-----------------------------------");

    console.log(
        `Server running at http://localhost:${PORT}`
    );

    console.log("API: /api/scan");

    console.log("Provider: XposedOrNot");

    console.log("-----------------------------------");

});