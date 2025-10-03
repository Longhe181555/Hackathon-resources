const fs = require('fs');

if (process.argv.length < 3) {
    console.error('Usage: node score-k6.js <summary-json-file>');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));


const avg = data.metrics.http_req_duration.avg;
const p95 = data.metrics.http_req_duration['p(95)'];
const rps = data.metrics.http_reqs.rate;
// Try to use checks.passes and checks.fails for success rate if available
let successRate;
if (data.metrics.checks && typeof data.metrics.checks.passes === 'number' && typeof data.metrics.checks.fails === 'number') {
    const total = data.metrics.checks.passes + data.metrics.checks.fails;
    successRate = total > 0 ? data.metrics.checks.passes / total : 1;
} else if (data.metrics.http_req_failed && typeof data.metrics.http_req_failed.value === 'number') {
    successRate = 1 - data.metrics.http_req_failed.value;
} else {
    successRate = 0;
}

let score = 0;
// 1. Response Time Metrics (25 pts) - Beginner-friendly bands
if (avg < 500 && p95 < 1000) score += 25;
else if (avg < 1000 && p95 < 2000) score += 20;
else if (avg < 2000 && p95 < 4000) score += 15;
else if (avg < 4000 && p95 < 8000) score += 10;
// 2. Throughput Metrics (25 pts) - Beginner-friendly bands
if (rps > 50) score += 25;
else if (rps > 20) score += 20;
else if (rps > 10) score += 15;
else if (rps > 5) score += 10;
// 3. Reliability Metrics (25 pts) - Beginner-friendly bands
if (successRate >= 0.99) score += 25;
else if (successRate >= 0.97) score += 20;
else if (successRate >= 0.95) score += 15;
else if (successRate >= 0.90) score += 10;
// 4. Scalability Metrics (25 pts) - Beginner-friendly bands
const vusMax = data.metrics.vus_max.max;
if (vusMax >= 50) score += 25;
else if (vusMax >= 30) score += 20;
else if (vusMax >= 20) score += 15;
else if (vusMax >= 10) score += 10;

console.log('--- Hackathon Automated Score ---');
console.log('Response Time (avg):', avg.toFixed(2), 'ms');
console.log('Response Time (p95):', p95.toFixed(2), 'ms');
console.log('Throughput (RPS):', rps.toFixed(2));
console.log('Success Rate:', (successRate * 100).toFixed(2), '%');
console.log('Max VUs:', vusMax);
console.log('Total Score:', score, '/ 100');
