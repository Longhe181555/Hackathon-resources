import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'test1234';

export let options = {
    vus: 30,
    duration: '1m',
};

function checkResponseStructure(r) {
    return r.json() && typeof r.json().status === 'string' && 'data' in r.json() && 'error' in r.json();
}

export default function () {
    let foodId;
    group('Login', function () {
        let loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        }), { headers: { 'Content-Type': 'application/json' } });
        check(loginRes, {
            'login status 200': (r) => r.status === 200,
            'login returns token': (r) => r.json().data && r.json().data.token,
            'login response structure': checkResponseStructure,
        });
        var token = loginRes.json().data ? loginRes.json().data.token : '';
        var authHeaders = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };

        group('Foods CRUD', function () {
            // Add food (valid)
            let foodPayload = {
                name: `Hidden Food ${Math.random()}`,
                calories: 200,
                protein: 10,
                carbs: 30,
                fat: 5,
            };
            let addFoodRes = http.post(`${BASE_URL}/foods`, JSON.stringify(foodPayload), authHeaders);
            check(addFoodRes, {
                'POST /foods status 201': (r) => r.status === 201,
                'POST /foods returns food': (r) => r.json().data && r.json().data.name === foodPayload.name,
                'POST /foods response structure': checkResponseStructure,
            });
            foodId = addFoodRes.json().data ? addFoodRes.json().data.id : '';

            // Add food (missing fields)
            let badFoodRes = http.post(`${BASE_URL}/foods`, JSON.stringify({ name: 'Bad Food' }), authHeaders);
            check(badFoodRes, {
                'POST /foods missing fields 400': (r) => r.status === 400,
                'POST /foods missing fields response structure': checkResponseStructure,
            });

            // GET /foods
            let foodsRes = http.get(`${BASE_URL}/foods`, authHeaders);
            check(foodsRes, {
                'GET /foods status 200': (r) => r.status === 200,
                'GET /foods returns array': (r) => Array.isArray(r.json().data),
                'GET /foods response structure': checkResponseStructure,
            });

            // GET /foods/:id (valid)
            if (foodId) {
                let foodDetailRes = http.get(`${BASE_URL}/foods/${foodId}`, authHeaders);
                check(foodDetailRes, {
                    'GET /foods/:id status 200': (r) => r.status === 200,
                    'GET /foods/:id returns food': (r) => r.json().data && r.json().data.id === foodId,
                    'GET /foods/:id response structure': checkResponseStructure,
                });
            }

            // GET /foods/:id (invalid)
            let badFoodIdRes = http.get(`${BASE_URL}/foods/invalidid`, authHeaders);
            check(badFoodIdRes, {
                'GET /foods/:id invalid returns error': (r) => r.status === 404 || r.status === 400,
                'GET /foods/:id invalid response structure': checkResponseStructure,
            });
        });

        group('Meal Planning', function () {
            // Add meal (valid)
            let mealPayload = {
                name: `Hidden Meal ${Math.random()}`,
                foods: [{ foodId: foodId, quantity: 2 }],
                date: '2025-10-03',
            };
            let addMealRes = http.post(`${BASE_URL}/meals`, JSON.stringify(mealPayload), authHeaders);
            check(addMealRes, {
                'POST /meals status 201': (r) => r.status === 201,
                'POST /meals returns meal': (r) => r.json().data && r.json().data.name === mealPayload.name,
                'POST /meals response structure': checkResponseStructure,
            });
            // Add meal (missing fields)
            let badMealRes = http.post(`${BASE_URL}/meals`, JSON.stringify({ name: 'Bad Meal' }), authHeaders);
            check(badMealRes, {
                'POST /meals missing fields 400': (r) => r.status === 400,
                'POST /meals missing fields response structure': checkResponseStructure,
            });
            // GET /meals
            let mealsRes = http.get(`${BASE_URL}/meals`, authHeaders);
            check(mealsRes, {
                'GET /meals status 200': (r) => r.status === 200,
                'GET /meals returns array': (r) => Array.isArray(r.json().data),
                'GET /meals response structure': checkResponseStructure,
            });
        });

        group('Food Log', function () {
            // Add log (valid)
            let logPayload = {
                foodId: foodId,
                quantity: 1,
                time: '12:00',
            };
            let addLogRes = http.post(`${BASE_URL}/logs`, JSON.stringify(logPayload), authHeaders);
            check(addLogRes, {
                'POST /logs status 201': (r) => r.status === 201,
                'POST /logs response structure': checkResponseStructure,
            });
            // Add log (missing fields)
            let badLogRes = http.post(`${BASE_URL}/logs`, JSON.stringify({ foodId: foodId }), authHeaders);
            check(badLogRes, {
                'POST /logs missing fields 400': (r) => r.status === 400,
                'POST /logs missing fields response structure': checkResponseStructure,
            });
            // GET /logs
            let logsRes = http.get(`${BASE_URL}/logs`, authHeaders);
            check(logsRes, {
                'GET /logs status 200': (r) => r.status === 200,
                'GET /logs returns array': (r) => Array.isArray(r.json().data),
                'GET /logs response structure': checkResponseStructure,
            });
        });

        group('Nutrition Insights', function () {
            let insightsRes = http.get(`${BASE_URL}/insights/summary`, authHeaders);
            check(insightsRes, {
                'GET /insights/summary status 200': (r) => r.status === 200,
                'GET /insights/summary response structure': checkResponseStructure,
            });
        });
    });
    sleep(1);
}
