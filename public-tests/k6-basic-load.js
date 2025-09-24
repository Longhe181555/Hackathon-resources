import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 10,
    duration: '1m',
};

const BASE_URL = 'http://localhost:8080/api';

export default function () {
    // Test user creation
    let userRes = http.post(`${BASE_URL}/users`, JSON.stringify({
        username: 'testuser',
        maxSpendingLimit: 1000,
        savings: 500
    }), { headers: { 'Content-Type': 'application/json' } });
    check(userRes, { 'user created': (r) => r.status === 201 });

    // Test get articles
    let articlesRes = http.get(`${BASE_URL}/articles`);
    check(articlesRes, { 'articles fetched': (r) => r.status === 200 });

    sleep(1);
}
