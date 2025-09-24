// score.js
// Usage: node score.js <k6_summary.json> <jmeter_results.jtl>
// Combines k6 and JMeter metrics, averages scores for fairness

const fs = require('fs');
const readline = require('readline');

if (process.argv.length < 4) {
    console.error('Usage: node score.js <k6_summary.json> <jmeter_results.jtl>');
    process.exit(1);
}

const k6Path = process.argv[2];
const jmeterPath = process.argv[3];

// --- K6 METRICS ---
function getK6Metrics(path) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    const httpReqs = data.metrics["http_reqs"]?.count || 0;
    const avg = data.metrics["http_req_duration"]?.avg || 0;
    const p95 = data.metrics["http_req_duration"]?.["p(95)"] || 0;
    const p99 = data.metrics["http_req_duration"]?.["p(99)"] || 0;
    const max = data.metrics["http_req_duration"]?.max || 0;
    const rps = data.metrics["http_reqs"]?.rate || 0;
    const successRate = 1 - (data.metrics["http_req_failed"]?.rate || 0);
    return { avg, p95, p99, max, rps, successRate, httpReqs };
}

// --- JMETER METRICS ---
async function getJMeterMetrics(path) {
    return new Promise((resolve) => {
        let total = 0, errors = 0, sumTime = 0, max = 0;
        let times = [];
        let isHeader = true;
        let successIdx, elapsedIdx;
        const rl = readline.createInterface({
            input: fs.createReadStream(path),
            crlfDelay: Infinity
        });
        rl.on('line', (line) => {
            if (isHeader) {
                const headers = line.split(',');
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
        rl.on('close', () => {
            times.sort((a, b) => a - b);
            const avg = sumTime / total;
            const p95 = times[Math.floor(0.95 * total)] || 0;
            const p99 = times[Math.floor(0.99 * total)] || 0;
            const rps = total / ((times[times.length - 1] - times[0]) / 1000 || 1);
            const successRate = (total - errors) / total;
            resolve({ avg, p95, p99, max, rps, successRate, httpReqs: total });
        });
    });
}

// --- SCORING RUBRIC (adjust as needed) ---
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

(async () => {
    const k6 = getK6Metrics(k6Path);
    const jmeter = await getJMeterMetrics(jmeterPath);

    // Average the scores for fairness
    const respScore = (scoreResponseTime(k6.avg, k6.p95) + scoreResponseTime(jmeter.avg, jmeter.p95)) / 2;
    const thrScore = (scoreThroughput(k6.rps) + scoreThroughput(jmeter.rps)) / 2;
    const relScore = (scoreReliability(k6.successRate) + scoreReliability(jmeter.successRate)) / 2;
    // For scalability, use httpReqs as a proxy for VUs (or adjust as needed)
    const scaScore = (scoreScalability(k6.httpReqs) + scoreScalability(jmeter.httpReqs)) / 2;

    const total = respScore + thrScore + relScore + scaScore;

    console.log('--- Combined k6 + JMeter Scoring ---');
    console.log(`Response Time Score: ${respScore}`);
    console.log(`Throughput Score:    ${thrScore}`);
    console.log(`Reliability Score:   ${relScore}`);
    console.log(`Scalability Score:   ${scaScore}`);
    console.log(`TOTAL:               ${total} / 100`);
})();
