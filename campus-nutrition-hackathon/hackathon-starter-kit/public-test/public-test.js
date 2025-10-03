import http from 'k6/http';
import { check, sleep } from 'k6';

// === CONFIGURABLE VARIABLES ===
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'test1234';

export let options = {
    vus: 5, // Number of virtual users
    duration: '30s',
};

export default function () {
    // 1. Login (if required)
    let loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
    }), { headers: { 'Content-Type': 'application/json' } });
    check(loginRes, {
        'login status 200': (r) => r.status === 200,
        'login returns token': (r) => r.json().data && r.json().data.token,
    });
    let token = loginRes.json().data ? loginRes.json().data.token : '';
    let authHeaders = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };

    // 2. GET /foods
    let foodsRes = http.get(`${BASE_URL}/foods`, authHeaders);
    check(foodsRes, {
        'GET /foods status 200': (r) => r.status === 200,
        'GET /foods returns array': (r) => Array.isArray(r.json().data),
    });

    // 3. POST /foods
    let foodPayload = {
        name: `Test Food ${Math.random()}`,
        calories: 100,
        protein: 5,
        carbs: 20,
        fat: 2,
    };
    let addFoodRes = http.post(`${BASE_URL}/foods`, JSON.stringify(foodPayload), authHeaders);
    check(addFoodRes, {
        'POST /foods status 201': (r) => r.status === 201,
        'POST /foods returns food': (r) => r.json().data && r.json().data.name === foodPayload.name,
    });
    let foodId = addFoodRes.json().data ? addFoodRes.json().data.id : '';

    // 4. GET /foods/:id
    if (foodId) {
        let foodDetailRes = http.get(`${BASE_URL}/foods/${foodId}`, authHeaders);
        check(foodDetailRes, {
            'GET /foods/:id status 200': (r) => r.status === 200,
            'GET /foods/:id returns food': (r) => r.json().data && r.json().data.id === foodId,
        });
    }

    sleep(1);
}
