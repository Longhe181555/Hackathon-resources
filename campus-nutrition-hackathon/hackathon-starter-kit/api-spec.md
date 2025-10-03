# Campus Nutrition Hack API Specification (Simplified)

All teams must implement the following endpoints exactly as described to ensure compatibility with automated test scripts and fair judging. You may add extra endpoints/features, but these required endpoints must remain compatible with the test scripts.

---

## 1. Authentication (Optional/Simple)

- `POST /auth/login` — Login (or just a demo login, no registration needed)
  - Request: `{ "email": string, "password": string }`
  - Response: `200 OK`, `{ "status": "success", "data": { token: string }, "error": null }`

---

## 2. Food Database

- `GET /foods` — List all foods (with nutrition info)

  - Response: `200 OK`, `{ "status": "success", "data": [ { food object } ], "error": null }`

- `POST /foods` — Add a new food

  - Request: `{ "name": string, "calories": number, "protein": number, "carbs": number, "fat": number }`
  - Response: `201 Created`, `{ "status": "success", "data": { food object }, "error": null }`

- `GET /foods/:id` — Get details for a specific food
  - Response: `200 OK`, `{ "status": "success", "data": { food object }, "error": null }`

---

## 3. Meal Planning

- `GET /meals` — List all meal plans

  - Response: `200 OK`, `{ "status": "success", "data": [ { meal object } ], "error": null }`

- `POST /meals` — Create a new meal plan
  - Request: `{ "name": string, "foods": [ { foodId: string, quantity: number } ], "date": string }`
  - Response: `201 Created`, `{ "status": "success", "data": { meal object }, "error": null }`

---

## 4. Food Tracking (Daily Log)

- `GET /logs` — Get food logs (optionally filter by date)

  - Query: `?date=YYYY-MM-DD` (optional)
  - Response: `200 OK`, `{ "status": "success", "data": [ { log object } ], "error": null }`

- `POST /logs` — Add a food log entry
  - Request: `{ "foodId": string, "quantity": number, "time": string }`
  - Response: `201 Created`, `{ "status": "success", "data": { log object }, "error": null }`

---

## 5. (Optional/Bonus) Nutrition Insights

- `GET /insights/summary` — Get nutrition summary
  - Response: `200 OK`, `{ "status": "success", "data": { summary object }, "error": null }`

---

## General Notes

- All endpoints use JSON for requests and responses.
- All endpoints return status, data, and error fields.
- Designed for easy automation with k6/JMeter and extensibility for real-world use.
