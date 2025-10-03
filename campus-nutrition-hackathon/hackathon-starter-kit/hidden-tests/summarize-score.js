// summarize-score.js
// Usage: node summarize-score.js ../submission1/scripts/score.json

const fs = require('fs');
if (process.argv.length < 3) {
    console.error('Usage: node summarize-score.js <score.json>');
    process.exit(1);
}
const path = process.argv[2];

if (!fs.existsSync(path)) {
    console.error('score.json not found:', path);
    process.exit(1);
}

const raw = fs.readFileSync(path, 'utf8');
if (!raw.trim()) {
    console.error('score.json is empty:', path);
    process.exit(1);
}
let data;
try {
    data = JSON.parse(raw);
} catch (e) {
    // Try NDJSON (newline-delimited JSON)
    try {
        const lines = raw.split(/\r?\n/).filter(Boolean);
        data = lines.map(line => JSON.parse(line));
    } catch (e2) {
        console.error('score.json is not valid JSON or NDJSON:', path);
        console.error(e2.message);
        process.exit(1);
    }
}
const last = Array.isArray(data) ? data[data.length - 1] : data;

function printSummary(obj) {
    if (!obj || !obj.metrics) {
        console.error('No summary metrics found in score.json');
        process.exit(1);
    }
    const m = obj.metrics;
    console.log('--- k6 Test Summary ---');
    if (m.checks) {
        const total = m.checks.passes + m.checks.fails;
        const percent = total > 0 ? ((m.checks.passes / total) * 100).toFixed(2) : '0.00';
        console.log(`Score: ${m.checks.passes} / ${total} (${percent}%)`);
    }
    if (m.http_reqs) {
        console.log(`HTTP Requests: ${m.http_reqs.count}`);
    }
    if (m.http_req_duration) {
        console.log(`HTTP Req Duration (ms): avg ${m.http_req_duration.avg.toFixed(2)}, max ${m.http_req_duration.max.toFixed(2)}`);
    }
    if (m.http_req_failed) {
        const failRate = (m.http_req_failed.rate * 100).toFixed(2);
        console.log(`HTTP Req Failure Rate: ${failRate}%`);
    }
    if (m.iterations) {
        console.log(`Iterations: ${m.iterations.count}`);
    }
    console.log('-----------------------');
}

printSummary(last);
