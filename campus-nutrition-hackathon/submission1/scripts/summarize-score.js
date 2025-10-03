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
    // Correctness
    let total = 0, passes = 0, percent = 0;
    if (m.checks) {
        total = m.checks.passes + m.checks.fails;
        passes = m.checks.passes;
        percent = total > 0 ? ((passes / total) * 100) : 0;
    }
    // Performance
    let avg = m.http_req_duration ? m.http_req_duration.avg : null;
    let failRate = m.http_req_failed ? (m.http_req_failed.rate * 100) : null;
    let perfScore = 0, perfMsg = '', perfMax = 10;
    if (avg !== null && failRate !== null) {
        if (failRate > 1) {
            perfScore = 0;
            perfMsg = `Performance: 0/${perfMax} (HTTP failure rate > 1%)`;
        } else if (avg < 200) {
            perfScore = perfMax;
            perfMsg = `Performance: ${perfMax}/${perfMax} (avg < 200ms, fail rate ≤ 1%)`;
        } else if (avg < 500) {
            perfScore = Math.round(perfMax / 2);
            perfMsg = `Performance: ${perfScore}/${perfMax} (avg 200–500ms, fail rate ≤ 1%)`;
        } else {
            perfScore = 0;
            perfMsg = `Performance: 0/${perfMax} (avg > 500ms)`;
        }
    } else {
        perfMsg = 'Performance: N/A (missing metrics)';
    }
    // Final score
    let correctnessScore = total > 0 ? Math.round((passes / total) * 90) : 0;
    let finalScore = correctnessScore + perfScore;
    let maxScore = 90 + perfMax;
    // Output
    console.log('--- k6 Test Summary ---');
    console.log(`Correctness: ${passes} / ${total} (${percent.toFixed(2)}%)`);
    console.log(`Correctness Score: ${correctnessScore}/90`);
    if (m.http_reqs) {
        console.log(`HTTP Requests: ${m.http_reqs.count}`);
    }
    if (m.http_req_duration) {
        console.log(`HTTP Req Duration (ms): avg ${avg.toFixed(2)}, max ${m.http_req_duration.max.toFixed(2)}`);
    }
    if (m.http_req_failed) {
        console.log(`HTTP Req Failure Rate: ${failRate.toFixed(2)}%`);
    }
    if (m.iterations) {
        console.log(`Iterations: ${m.iterations.count}`);
    }
    console.log(perfMsg);
    console.log(`Final Score: ${finalScore} / ${maxScore} (${((finalScore / maxScore) * 100).toFixed(2)}%)`);
    if (perfScore < perfMax && avg !== null && failRate !== null) {
        if (failRate > 1) {
            console.log('WARNING: High HTTP request failure rate (>1%). Optimize error handling and backend stability.');
        } else if (avg >= 200 && avg < 500) {
            console.log('NOTE: Average response time is moderate (200–500ms). Optimize for better performance.');
        } else if (avg >= 500) {
            console.log('WARNING: Average response time is high (>500ms). Significant optimization needed.');
        }
    }
    console.log('-----------------------');
}

printSummary(last);
