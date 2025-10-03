# Campus Nutrition Hack - Starter Kit

Welcome to the Campus Nutrition Hack! This starter kit includes everything you need to get started:

## Contents

- `api-spec.md`: Official API specification. Required endpoints must match this spec for automated testing.
- `hidden-tests/`: Placeholder for hidden test scripts (used for official scoring).
- `public-test/`: Sample k6 test script to check your endpoints.
- `Dockerfile` and `docker-compose.yml`: For containerized development and testing.

## Rules & Flexibility

- You must implement all required endpoints as described in `api-spec.md`.
- You are encouraged to add extra features/endpoints, but required endpoints must remain compatible with the test scripts.
- Automated tests (k6/JMeter) will check correctness, performance, and reliability. These results count for 20% of your total score. The public test script is provided for your reference, but official scoring will also use hidden tests to ensure fairness and prevent hardcoding.
- Manual judging will assess code quality, user experience, usefulness, innovation, and documentation.

This starter kit is designed to be both realistic and achievable for a school hackathon. The metrics and limits are chosen to reflect what a real-world system should handle, but are not so strict as to be discouraging for new developers. Focus on building a robust, functional solution—perfection is not required!

## How to Test

1. Build and run your app with Docker Compose:
   ```
   docker-compose up --build
   ```
2. In another terminal, run the public k6 test:
   ```
   k6 run public-test/k6-test.js
   ```
   The public test simulates 5–10 Virtual Users (VUs) making requests at the same time, to check how your system performs under realistic load. Performance and reliability are measured under this concurrency. Hidden tests may use higher VU counts to further check scalability and robustness.
3. Check the output for pass/fail results. Passing the public test means your endpoints are on the right track, but remember: hidden tests will be used for official scoring.

## Automated Test Plan (k6)

Automated tests (using k6) will measure and score your project on the following realistic, automatable metrics (20% of your total score):

### What Will Be Tested

- **Endpoint Coverage:** All required endpoints from `api-spec.md` (e.g., /foods, /meals, /logs, /insights/summary, /auth/login).
- **Test Scenarios:**
  - Valid requests (should succeed and return correct data)
  - Invalid requests (missing/wrong data, should return clear errors)
  - Unauthorized requests (if applicable, should return 401/403)
  - Edge cases (e.g., non-existent IDs)
- **User Flow Simulation:**
  - Simulate a real user journey: login → add food → add meal → log meal → get summary
- **Concurrency & Load:**
  - Run the above flows with 5–10 Virtual Users (VUs) for 1–3 minutes
  - Measure average and 95th percentile response time, and success rate
- **Data Cleanup:**
  - Ensure test data is unique or cleaned up after tests

### Scoring Table

| Metric      | Max Points | How to Score                                                                                                       |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Correctness | 10         | 1 point per required endpoint/flow passed (all must pass for full points)                                          |
| Performance | 5          | Average and 95th percentile response time: ≤500ms = 5, 501–800ms = 4, 801–1200ms = 3, 1201–2000ms = 2, >2000ms = 0 |
| Reliability | 3          | Success rate: 100% = 3, 99–99.9% = 2, 95–98.9% = 1, <95% = 0                                                       |
| Robustness  | 2          | 0.5 point per error/edge case handled correctly (all must pass for full points)                                    |

**Full points** are awarded only if all required endpoints, flows, and error cases pass and the system is fast and reliable under load.

These metrics reflect what matters for a real campus nutrition app: correct API responses, reasonable speed, reliability under light load, and clear error handling. The test plan covers all endpoints, realistic user flows, error handling, and concurrency. The hidden tests will check for generalizability and prevent hardcoding.

## How to Run and Capture the Automatic Score

1. Build and run your app with Docker Compose:

```
docker-compose up --build
```

2. In another terminal, run the k6 hidden test (for official scoring) using Docker Compose:

```
docker-compose run --rm k6 run /scripts/hidden-test.js --out json=score.json
```

This will execute the comprehensive test and output all results to `score.json`.

3. The scoring worker should parse `score.json` to extract:

- Number of successful/failed requests per endpoint
- Average and 95th percentile response times
- Success rate and error rate
- Pass/fail for each required and error case
- Calculate the final score according to the table above

**Note:** The public test is for participant feedback only. Official scoring is always done with the hidden test script and automated worker.

## Good luck and have fun!
