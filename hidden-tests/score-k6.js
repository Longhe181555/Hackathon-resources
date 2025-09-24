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

const SCORING_BANDS = {
    responseTime: [
        { score: 25, avg: 500, p95: 500 },
        { score: 20, avg: 1000, p95: 2000 },
        { score: 15, avg: 2000, p95: 4000 },
        { score: 10, avg: 4000, p95: 8000 },
        { score: 0 }
    ],
    throughput: [
        { score: 25, rps: 50 },
        { score: 20, rps: 20 },
        { score: 15, rps: 10 },
        { score: 10, rps: 5 },
        { score: 0 }
    ],
    reliability: [
        { score: 25, rate: 0.999 },
        { score: 20, rate: 0.995 },
        { score: 15, rate: 0.99 },
        { score: 10, rate: 0.95 },
        { score: 0 }
    ],
    scalability: [
        { score: 25, vus: 50 },
        { score: 20, vus: 30 },
        { score: 15, vus: 20 },
        { score: 10, vus: 10 },
        { score: 0 }
    ]
};

function scoreResponseTime(avg, p95) {
    for (const band of SCORING_BANDS.responseTime) {
        if ((avg < band.avg || band.avg === undefined) && (p95 < band.p95 || band.p95 === undefined)) {
            return band.score;
        }
    }
    return 0;
}
function scoreThroughput(rps) {
    for (const band of SCORING_BANDS.throughput) {
        if (rps > band.rps || band.rps === undefined) {
            return band.score;
        }
    }
    return 0;
}
function scoreReliability(successRate) {
    for (const band of SCORING_BANDS.reliability) {
        if (successRate >= band.rate || band.rate === undefined) {
            return band.score;
        }
    }
    return 0;
}
function scoreScalability(vus) {
    for (const band of SCORING_BANDS.scalability) {
        if (vus >= band.vus || band.vus === undefined) {
            return band.score;
        }
    }
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
