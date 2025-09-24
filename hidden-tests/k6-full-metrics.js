import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 50 },   // ramp-up
        { duration: '3m', target: 200 },  // sustained load
        { duration: '1m', target: 1000 }, // spike
        { duration: '2m', target: 0 },    // ramp-down
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.05'],
        http_reqs: ['count>1000'],
    },
};

const BASE_URL = 'http://localhost:8080/api';

export default function () {
    // User creation
    let userRes = http.post(`${BASE_URL}/users`, JSON.stringify({
        username: `user${__VU}_${__ITER}`,
        maxSpendingLimit: Math.floor(Math.random() * 10000),
        savings: Math.floor(Math.random() * 5000)
    }), { headers: { 'Content-Type': 'application/json' } });
    check(userRes, { 'user created': (r) => r.status === 201 });

    // Article creation
    let articleRes = http.post(`${BASE_URL}/articles`, JSON.stringify({
        title: `Article ${__VU}_${__ITER}`,
        content: 'Sample content'
    }), { headers: { 'Content-Type': 'application/json' } });
    check(articleRes, { 'article created': (r) => r.status === 201 });

    // Get articles
    let articlesRes = http.get(`${BASE_URL}/articles`);
    check(articlesRes, { 'articles fetched': (r) => r.status === 200 });

    // Expense creation
    let expenseRes = http.post(`${BASE_URL}/expenses`, JSON.stringify({
        category: 'test',
        amount: Math.floor(Math.random() * 1000),
        date: new Date().toISOString(),
        userId: JSON.parse(userRes.body)._id
    }), { headers: { 'Content-Type': 'application/json' } });
    check(expenseRes, { 'expense created': (r) => r.status === 201 });

    sleep(0.5);
}
