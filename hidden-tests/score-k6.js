const fs = require('fs');

if (process.argv.length < 3) {
    console.error('Usage: node score-k6.js <summary-json-file>');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const avg = data.metrics.http_req_duration.avg;
const p95 = data.metrics.http_req_duration['p(95)'];
const rps = data.metrics.http_reqs.rate;
const successRate = 1 - data.metrics.http_req_failed.rate;

let score = 0;
// 1. Response Time Metrics (25 pts)
if (avg < 100 && p95 < 200) score += 25;
else if (avg < 300 && p95 < 500) score += 20;
else if (avg < 500 && p95 < 1000) score += 15;
else if (avg < 1000 && p95 < 2000) score += 10;
// 2. Throughput Metrics (25 pts)
if (rps > 500) score += 25;
else if (rps > 200) score += 20;
else if (rps > 100) score += 15;
else if (rps > 50) score += 10;
// 3. Reliability Metrics (25 pts)
if (successRate >= 0.999) score += 25;
else if (successRate >= 0.995) score += 20;
else if (successRate >= 0.99) score += 15;
else if (successRate >= 0.95) score += 10;
// 4. Scalability Metrics (25 pts)
const vusMax = data.metrics.vus_max.max;
if (vusMax >= 1000) score += 25;
else if (vusMax >= 500) score += 20;
else if (vusMax >= 200) score += 15;
else if (vusMax >= 50) score += 10;

console.log('--- Hackathon Automated Score ---');
console.log('Response Time (avg):', avg.toFixed(2), 'ms');
console.log('Response Time (p95):', p95.toFixed(2), 'ms');
console.log('Throughput (RPS):', rps.toFixed(2));
console.log('Success Rate:', (successRate * 100).toFixed(2), '%');
console.log('Max VUs:', vusMax);
console.log('Total Score:', score, '/ 100');
