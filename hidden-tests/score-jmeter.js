// score-jmeter.js
// Usage: node score-jmeter.js <results.jtl>
// Outputs summary and score using adjusted bands

const fs = require('fs');
const path = process.argv[2];
if (!path) {
    console.error('Usage: node score-jmeter.js <results.jtl>');
    process.exit(1);
}

let total = 0, errors = 0, sumTime = 0, max = 0;
let times = [];
const readline = require('readline');
const rl = readline.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity
});

let isHeader = true;
let labelIdx, successIdx, elapsedIdx;
rl.on('line', (line) => {
    if (isHeader) {
        // Parse header to get column indices
        const headers = line.split(',');
        labelIdx = headers.indexOf('label');
        successIdx = headers.indexOf('success');
        elapsedIdx = headers.indexOf('elapsed');
        isHeader = false;
        return;
    }
    if (!line.trim()) return;
    const cols = line.split(',');
    total++;
    if (cols[successIdx] !== 'true') errors++;
    const t = parseInt(cols[elapsedIdx], 10);
    sumTime += t;
    times.push(t);
    if (t > max) max = t;
});

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

rl.on('close', () => {
    if (total === 0) {
        console.log('No samples found.');
        return;
    }
    times.sort((a, b) => a - b);
    const avg = sumTime / total;
    const p95 = times[Math.floor(0.95 * total)] || 0;
    const rps = total / ((times[times.length - 1] - times[0]) / 1000 || 1);
    const successRate = (total - errors) / total;
    // For scalability, use total requests as a proxy for VUs (not perfect, but consistent with score.js)
    const vus = total;
    const respScore = scoreResponseTime(avg, p95);
    const thrScore = scoreThroughput(rps);
    const relScore = scoreReliability(successRate);
    const scaScore = scoreScalability(vus);
    const totalScore = respScore + thrScore + relScore + scaScore;
    console.log('--- Hackathon Automated Score (JMeter) ---');
    console.log(`Total requests: ${total}`);
    console.log(`Errors: ${errors}`);
    console.log(`Average response time: ${avg.toFixed(2)} ms | Score: ${respScore}/25`);
    console.log(`P95 response time: ${p95.toFixed(2)} ms`);
    console.log(`Throughput (RPS): ${rps.toFixed(2)} | Score: ${thrScore}/25`);
    console.log(`Success Rate: ${(successRate * 100).toFixed(2)} % | Score: ${relScore}/25`);
    console.log(`Proxy VUs (requests): ${vus} | Score: ${scaScore}/25`);
    console.log(`Total Score: ${totalScore} / 100`);
});
