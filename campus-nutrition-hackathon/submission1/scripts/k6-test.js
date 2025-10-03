import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 1,
    duration: '10s',
};

export default function () {
    let res = http.get('http://localhost:3000/foods');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'is JSON': (r) => r.headers['Content-Type'].includes('application/json'),
    });
    sleep(1);
}
