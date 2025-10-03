
// Campus Nutrition Hack Backend (API Spec Only)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// In-memory data stores (for hackathon/demo only)
let users = [{ email: 'test@example.com', password: 'test1234', id: '1' }];
let foods = [];
let meals = [];
let logs = [];

// Helper: Auth middleware
function authenticate(req, res, next) {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ status: 'error', data: null, error: 'No token' });
    const token = auth.replace('Bearer ', '');
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ status: 'error', data: null, error: 'Invalid token' });
    }
}

// Public health check endpoint (placed after middleware, before API routes)
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', data: 'API is up', error: null });
});

// 1. Authentication (login only)
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ status: 'error', data: null, error: 'Invalid credentials' });
    const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ status: 'success', data: { token }, error: null });
});

// 2. Food Database
app.get('/foods', authenticate, (req, res) => {
    res.json({ status: 'success', data: foods, error: null });
});

app.post('/foods', authenticate, (req, res) => {
    const { name, calories, protein, carbs, fat } = req.body;
    if (!name || calories == null || protein == null || carbs == null || fat == null) {
        return res.status(400).json({ status: 'error', data: null, error: 'Missing fields' });
    }
    const food = { id: (foods.length + 1).toString(), name, calories, protein, carbs, fat };
    foods.push(food);
    res.status(201).json({ status: 'success', data: food, error: null });
});

app.get('/foods/:id', authenticate, (req, res) => {
    const food = foods.find(f => f.id === req.params.id);
    if (!food) return res.status(404).json({ status: 'error', data: null, error: 'Food not found' });
    res.json({ status: 'success', data: food, error: null });
});

// 3. Meal Planning
app.get('/meals', authenticate, (req, res) => {
    res.json({ status: 'success', data: meals, error: null });
});

app.post('/meals', authenticate, (req, res) => {
    const { name, foods: mealFoods, date } = req.body;
    if (!name || !Array.isArray(mealFoods) || !date) {
        return res.status(400).json({ status: 'error', data: null, error: 'Missing fields' });
    }
    const meal = { id: (meals.length + 1).toString(), name, foods: mealFoods, date };
    meals.push(meal);
    res.status(201).json({ status: 'success', data: meal, error: null });
});

// 4. Food Tracking (Daily Log)
app.get('/logs', authenticate, (req, res) => {
    const { date } = req.query;
    let filtered = logs;
    if (date) filtered = logs.filter(l => l.date === date);
    res.json({ status: 'success', data: filtered, error: null });
});

app.post('/logs', authenticate, (req, res) => {
    const { foodId, quantity, time } = req.body;
    if (!foodId || quantity == null || !time) {
        return res.status(400).json({ status: 'error', data: null, error: 'Missing fields' });
    }
    const log = { id: (logs.length + 1).toString(), foodId, quantity, time, date: new Date().toISOString().slice(0, 10) };
    logs.push(log);
    res.status(201).json({ status: 'success', data: log, error: null });
});

// 5. Nutrition Insights (Bonus)
app.get('/insights/summary', authenticate, (req, res) => {
    // Simple summary: sum all nutrition for all logs
    let summary = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    logs.forEach(log => {
        const food = foods.find(f => f.id === log.foodId);
        if (food) {
            summary.calories += food.calories * log.quantity;
            summary.protein += food.protein * log.quantity;
            summary.carbs += food.carbs * log.quantity;
            summary.fat += food.fat * log.quantity;
        }
    });
    res.json({ status: 'success', data: summary, error: null });
});

// Start server
app.listen(PORT, () => {
    console.log(`Campus Nutrition Hack backend running on port ${PORT}`);
});
