This folder contains hidden test scripts used for official scoring. Do not modify or rely on these for your own testing.
(For example purposes, this is just a placeholder.)

---
How to get a clean, human-readable k6 score summary:

1. Run the k6 test with the --summary-export option (not --out json):
	k6 run hidden-test.js --summary-export=score.json

	(Or, if running in Docker Compose, make sure the entrypoint uses --summary-export=...)


2. After the test, run (from anywhere):
  node hackathon-starter-kit/hidden-tests/summarize-score.js <path-to-score.json>

  Example for submission1:
  node hackathon-starter-kit/hidden-tests/summarize-score.js submission1/scripts/score.json

  This prints a human-readable summary to the console. You can use it for any submission by changing the input file path.

Example output in score-summary.json:
{
  "checks": { "passes": 10, "total": 10 },
  "http_reqs": 50,
  "http_req_duration": { "avg": 120.34, "max": 300.12 },
  "http_req_failed": 0.0,
  "iterations": 10
}