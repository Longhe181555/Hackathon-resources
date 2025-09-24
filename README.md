# Hackathon Starter Kit

This repository contains all the resources, sample files, and public test scripts for participants in the hackathon.

## Structure

- `scripts/` — All k6 and JMeter test scripts (public and hidden)
- `api-spec/` — API documentation/specification
- `assets/` — Logos, images, and sample data
- `Dockerfile`, `docker-compose.yml` — Sample containerization files

## Public vs. Hidden Tests

- Public tests are provided for self-checking and basic validation.
- Additional hidden tests will be used by organizers for final judging (e.g., high load, edge cases, security, long-duration tests).

## How to Use

1. Clone this repo.
2. Review the API spec and requirements.
3. Use the public test scripts to validate your project before submission.
4. Follow the README instructions for building and running your app in Docker.

---

## Tools Used

- **k6**: Modern load testing tool for running automated API performance and reliability tests.
- **JMeter**: Industry-standard tool for advanced load and stress testing scenarios. Used for additional or more complex performance scenarios and scoring.

## Testing & Scoring


**Note:** The scoring bands and thresholds below are provided as examples for this test hackathon. Organizers may adjust these bands for other events or to match different levels of difficulty or fairness.

Each submission is provided with a `public-test` script to ensure the project can be run and tested automatically. The following metrics are used to score each submission out of 100 points:

### 1. Response Time Metrics (25 pts)

- **Average Response Time (ms)**
- **95th Percentile (P95)**
- **99th Percentile (P99)**
- **Max Response Time**

| Score     | Criteria (Original)          | Criteria (Adjusted)    |
| --------- | ---------------------------- | ---------------------- |
| Excellent | Avg < 100ms, P95 < 200ms     | < 500ms                |
| Good      | Avg < 300ms, P95 < 500ms     | < 1000ms, P95 < 2000ms |
| Fair      | Avg < 500ms, P95 < 1000ms    | < 2000ms, P95 < 4000ms |
| Poor      | Avg < 1000ms, P95 < 2000ms   | < 4000ms, P95 < 8000ms |
| Fail      | Avg > 1000ms or P95 > 2000ms | Above these            |

### 2. Throughput Metrics (25 pts)

- **Requests Per Second (RPS)**
- **Transactions Per Second (TPS)**
- **Data Transfer Rate (MB/s)**

| Score     | Criteria    |
| --------- | ----------- |
| Excellent | >500 RPS    |
| Good      | 200-500 RPS |
| Fair      | 100-200 RPS |
| Poor      | 50-100 RPS  |
| Fail      | <50 RPS     |

### 3. Reliability Metrics (25 pts)

- **Success Rate (% of successful requests)**
- **Error Rate (% of failed requests)**
- **HTTP Status Code Distribution**

| Score     | Criteria                |
| --------- | ----------------------- |
| Excellent | 99.9%+ success rate     |
| Good      | 99.5-99.9% success rate |
| Fair      | 99.0-99.5% success rate |
| Poor      | 95.0-99.0% success rate |
| Fail      | <95% success rate       |

### 4. Scalability Metrics (25 pts)

- **Concurrent Users Supported**
- **Breaking Point (when system fails)**
- **Resource Utilization (CPU, Memory)**

| Score     | Criteria (Adjusted) |
| --------- | ------------------- |
| Excellent | Handles 50 VUs      |
| Good      | 30–49 VUs           |
| Fair      | 20–29 VUs           |
| Poor      | 10–19 VUs           |
| Fail      | <10 VUs             |

---

**How it works:**

- Submissions are tested using the provided scripts in a Dockerized environment.
- Results are scored automatically based on the above rubric.
- This ensures fair, transparent, and reproducible evaluation for all participants.

---

---

## Running the Test Cases (Demo/Test Event)

This repository includes both public and hidden test scripts for demonstration purposes. To run the tests and score your submission:

### 1. Start all services with Docker Compose

```sh
docker-compose up -d
```

### 2. Enter the container shell (k6 or jmeter)

For k6:

```sh
docker-compose exec k6 sh
```

For JMeter:

```sh
docker-compose exec jmeter sh
```

### 3. Run a test script and export the summary to a mounted folder

For k6:

```sh
k6 run --summary-export=/scripts/score-k6.json /scripts/k6-full-metrics.js
```

For JMeter (example):

```sh
jmeter -n -t /scripts/jmeter-full-metrics.jmx -l /scripts/score-jmeter.json
```

### 4. Exit the container

```sh
exit
```

### 5. Score the results on your host

For k6:

```sh
node scripts/score-k6.js scripts/score-k6.json
```

For JMeter:

```sh
node scripts/score-jmeter.js scripts/score-jmeter.json
```

## How the Combined Score Is Measured and Calculated

To ensure fair and comprehensive evaluation, both k6 and JMeter are used to test each team’s backend. Each tool simulates user load and measures key performance metrics. The combined score is calculated as follows:

1. **Run Both Tests:**

   - k6 and JMeter are run with the same scenarios against the backend.
   - Each tool generates a results file (e.g., `score-k6.json` for k6, `score-jmeter.json` for JMeter).

2. **Extract Metrics:**  
   For each tool, the following metrics are extracted:

   - **Response Time:** Average, 95th percentile (P95), etc.
   - **Throughput:** Requests per second (RPS).
   - **Reliability:** Success rate (percentage of successful requests).
   - **Scalability:** Maximum concurrent users or virtual users (VUs) supported.

3. **Score Each Metric:**  
   Each metric is scored using a rubric (e.g., Excellent, Good, Fair, Poor, Fail), with points assigned based on performance bands.

4. **Average the Scores:**  
   For each metric, the scores from k6 and JMeter are averaged to produce a fair, balanced result.  
   For example:

   - If k6 gives 20 points for Response Time and JMeter gives 15, the combined score for that metric is (20 + 15) / 2 = 17.5.

5. **Sum for Final Score:**  
   The averaged scores for all metrics are summed to produce a final combined score out of 100.

**Why Combine?**  
Using both tools ensures that results are robust and not biased by a single testing method. Averaging the scores rewards teams that perform well across different types of load and scenarios.

To combine and fairly average both scores:

```sh
node scripts/score.js scripts/score-k6.json scripts/score-jmeter.json
```

---

**Note:** In this test event, both public and hidden test scripts are included in the repo for demonstration. In a real hackathon, only public tests would be visible to participants.

For questions, contact the hackathon organizers.
