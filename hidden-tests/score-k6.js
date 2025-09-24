// score-k6.js
// Usage: node score-k6.js <summary.json>
// Outputs summary and score

const fs = require('fs');
const path = process.argv[2];
if (!path) {
    console.error('Usage: node score-k6.js <summary.json>');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const avg = data.metrics["http_req_duration"]?.avg || 0;
const p95 = data.metrics["http_req_duration"]?.["p(95)"] || 0;
const rps = data.metrics["http_reqs"]?.rate || 0;
const successRate = 1 - (data.metrics["http_req_failed"]?.rate || 0);
const vus = data.metrics["vus_max"]?.value || 0;

function scoreResponseTime(avg, p95) {
    if (avg < 500) return 25;
    if (avg < 1000 || p95 < 2000) return 20;
    if (avg < 2000 || p95 < 4000) return 15;
    if (avg < 4000 || p95 < 8000) return 10;
    return 0;
}
function scoreThroughput(rps) {
    if (rps > 50) return 25;
    if (rps > 20) return 20;
    if (rps > 10) return 15;
    if (rps > 5) return 10;
    return 0;
}
function scoreReliability(successRate) {
    if (successRate >= 0.999) return 25;
    if (successRate >= 0.995) return 20;
    if (successRate >= 0.99) return 15;
    if (successRate >= 0.95) return 10;
    return 0;
}
function scoreScalability(vus) {
    if (vus >= 50) return 25;
    if (vus >= 30) return 20;
    if (vus >= 20) return 15;
    if (vus >= 10) return 10;
    return 0;
}

const respScore = scoreResponseTime(avg, p95);
const thrScore = scoreThroughput(rps);
const relScore = scoreReliability(successRate);
const scaScore = scoreScalability(vus);
const total = respScore + thrScore + relScore + scaScore;

console.log('--- Hackathon Automated Score (K6)---');
console.log(`Response Time (avg): ${avg.toFixed(2)} ms | Score: ${respScore}/25`);
console.log(`Response Time (p95): ${p95.toFixed(2)} ms`);
console.log(`Throughput (RPS): ${rps.toFixed(2)} | Score: ${thrScore}/25`);
console.log(`Success Rate: ${(successRate * 100).toFixed(2)} % | Score: ${relScore}/25`);
console.log(`Max VUs: ${vus} | Score: ${scaScore}/25`);
console.log(`Total Score: ${total} / 100`);
