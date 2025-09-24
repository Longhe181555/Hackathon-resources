// score-jmeter.js
// Usage: node score-jmeter.js <results.jtl>
// Outputs summary: total requests, errors, avg response time, error rate

const fs = require('fs');
const path = process.argv[2];
if (!path) {
    console.error('Usage: node score-jmeter.js <results.jtl>');
    process.exit(1);
}

let total = 0, errors = 0, sumTime = 0;
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
    sumTime += parseInt(cols[elapsedIdx], 10);
});

rl.on('close', () => {
    if (total === 0) {
        console.log('No samples found.');
        return;
    }
    const avg = sumTime / total;
    const errorRate = (errors / total) * 100;
    console.log(`Total requests: ${total}`);
    console.log(`Errors: ${errors}`);
    console.log(`Average response time: ${avg.toFixed(2)} ms`);
    console.log(`Error rate: ${errorRate.toFixed(2)}%`);
    // Add scoring bands as needed
});
