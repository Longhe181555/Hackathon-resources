# Hackathon Starter Kit

This repository contains all the resources, sample files, and public test scripts for participants in the hackathon.

## Structure

- `public-tests/` — Public k6/JMeter scripts for self-checking
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
- **JMeter**: Industry-standard tool for advanced load and stress testing scenarios.

## Testing & Scoring

Each submission is provided with a `public-test` script to ensure the project can be run and tested automatically. The following metrics are used to score each submission out of 100 points:

### 1. Response Time Metrics (25 pts)

- **Average Response Time (ms)**
- **95th Percentile (P95)**
- **99th Percentile (P99)**
- **Max Response Time**

| Score     | Criteria                     |
| --------- | ---------------------------- |
| Excellent | Avg < 100ms, P95 < 200ms     |
| Good      | Avg < 300ms, P95 < 500ms     |
| Fair      | Avg < 500ms, P95 < 1000ms    |
| Poor      | Avg < 1000ms, P95 < 2000ms   |
| Fail      | Avg > 1000ms or P95 > 2000ms |

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

| Score     | Criteria               |
| --------- | ---------------------- |
| Excellent | Handles 1000+ users    |
| Good      | Handles 500-1000 users |
| Fair      | Handles 200-500 users  |
| Poor      | Handles 50-200 users   |
| Fail      | <50 concurrent users   |

---

**How it works:**

- Submissions are tested using the provided scripts in a Dockerized environment.
- Results are scored automatically based on the above rubric.
- This ensures fair, transparent, and reproducible evaluation for all participants.

---

For questions, contact the hackathon organizers.
