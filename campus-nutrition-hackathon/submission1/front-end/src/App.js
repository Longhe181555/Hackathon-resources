
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from './AuthContext';

function Landing() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>Campus Nutrition Hack</Typography>
      <Typography variant="h6" gutterBottom>
        Welcome to the official hackathon submission!<br />
        Track your meals, plan nutrition, and get insights.
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Use the navigation bar to login and explore features.<br />
        <b>Pages:</b> Login, Foods, Meals, Logs, Insights
      </Typography>
    </Container>
  );
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('test@example.com');
  const [password, setPassword] = React.useState('test1234');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        login(data.data.token, { email });
        navigate('/foods');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4, maxWidth: 400 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            Login
          </Button>
          {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Box>
      </form>
      <Typography variant="body2" sx={{ mt: 2 }}>
        <b>Demo credentials:</b><br />
        Email: <code>test@example.com</code><br />
        Password: <code>test1234</code>
      </Typography>
    </Container>
  );
}
function Foods() {
  const { token } = useAuth();
  const [foods, setFoods] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [name, setName] = React.useState('');
  const [calories, setCalories] = React.useState('');
  const [protein, setProtein] = React.useState('');
  const [carbs, setCarbs] = React.useState('');
  const [fat, setFat] = React.useState('');
  const [adding, setAdding] = React.useState(false);

  const fetchFoods = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/foods', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setFoods(data.data);
      } else {
        setError(data.error || 'Failed to fetch foods');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (token) fetchFoods();
  }, [token]);

  const handleAddFood = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/foods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          calories: Number(calories),
          protein: Number(protein),
          carbs: Number(carbs),
          fat: Number(fat)
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setFoods(f => [...f, data.data]);
        setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
      } else {
        setError(data.error || 'Failed to add food');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setAdding(false);
    }
  };

  if (!token) {
    return <Container sx={{ mt: 4 }}><Alert severity="warning">Please login to view foods.</Alert></Container>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Foods</Typography>
      <Box component="form" onSubmit={handleAddFood} sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField label="Name" value={name} onChange={e => setName(e.target.value)} required />
        <TextField label="Calories" type="number" value={calories} onChange={e => setCalories(e.target.value)} required />
        <TextField label="Protein" type="number" value={protein} onChange={e => setProtein(e.target.value)} required />
        <TextField label="Carbs" type="number" value={carbs} onChange={e => setCarbs(e.target.value)} required />
        <TextField label="Fat" type="number" value={fat} onChange={e => setFat(e.target.value)} required />
        <Button type="submit" variant="contained" disabled={adding}>Add Food</Button>
        {adding && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Name</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Calories</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Protein</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Carbs</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Fat</th>
              </tr>
            </thead>
            <tbody>
              {foods.map(food => (
                <tr key={food.id}>
                  <td style={{ padding: 8 }}>{food.name}</td>
                  <td style={{ padding: 8 }}>{food.calories}</td>
                  <td style={{ padding: 8 }}>{food.protein}</td>
                  <td style={{ padding: 8 }}>{food.carbs}</td>
                  <td style={{ padding: 8 }}>{food.fat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </Container>
  );
}
function Meals() {
  const { token } = useAuth();
  const [meals, setMeals] = React.useState([]);
  const [foods, setFoods] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState('');
  const [mealFoods, setMealFoods] = React.useState([{ foodId: '', quantity: 1 }]);
  const [adding, setAdding] = React.useState(false);

  const fetchMeals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/meals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMeals(data.data);
      } else {
        setError(data.error || 'Failed to fetch meals');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await fetch('http://localhost:3000/foods', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setFoods(data.data);
      }
    } catch { }
  };

  React.useEffect(() => {
    if (token) {
      fetchMeals();
      fetchFoods();
    }
  }, [token]);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          foods: mealFoods.filter(f => f.foodId && f.quantity > 0),
          date
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMeals(m => [...m, data.data]);
        setName(''); setDate(''); setMealFoods([{ foodId: '', quantity: 1 }]);
      } else {
        setError(data.error || 'Failed to add meal');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setAdding(false);
    }
  };

  const handleMealFoodChange = (idx, field, value) => {
    setMealFoods(arr => arr.map((f, i) => i === idx ? { ...f, [field]: value } : f));
  };
  const handleAddMealFood = () => {
    setMealFoods(arr => [...arr, { foodId: '', quantity: 1 }]);
  };
  const handleRemoveMealFood = (idx) => {
    setMealFoods(arr => arr.filter((_, i) => i !== idx));
  };

  if (!token) {
    return <Container sx={{ mt: 4 }}><Alert severity="warning">Please login to view meals.</Alert></Container>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Meals</Typography>
      <Box component="form" onSubmit={handleAddMeal} sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
        <TextField label="Meal Name" value={name} onChange={e => setName(e.target.value)} required />
        <TextField label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink: true }} required />
        <Typography variant="subtitle1">Foods in Meal:</Typography>
        {mealFoods.map((f, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              select
              label="Food"
              value={f.foodId}
              onChange={e => handleMealFoodChange(idx, 'foodId', e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 120 }}
              required
            >
              <option value="">Select food</option>
              {foods.map(food => (
                <option key={food.id} value={food.id}>{food.name}</option>
              ))}
            </TextField>
            <TextField
              label="Quantity"
              type="number"
              value={f.quantity}
              onChange={e => handleMealFoodChange(idx, 'quantity', e.target.value)}
              sx={{ width: 100 }}
              required
            />
            <Button onClick={() => handleRemoveMealFood(idx)} disabled={mealFoods.length === 1}>Remove</Button>
          </Box>
        ))}
        <Button onClick={handleAddMealFood} sx={{ width: 150 }}>Add Another Food</Button>
        <Button type="submit" variant="contained" disabled={adding}>Add Meal</Button>
        {adding && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Name</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Date</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Foods</th>
              </tr>
            </thead>
            <tbody>
              {meals.map(meal => (
                <tr key={meal.id}>
                  <td style={{ padding: 8 }}>{meal.name}</td>
                  <td style={{ padding: 8 }}>{meal.date}</td>
                  <td style={{ padding: 8 }}>
                    {meal.foods && meal.foods.length > 0 ? meal.foods.map((f, i) => {
                      const food = foods.find(fd => fd.id === f.foodId);
                      return (
                        <span key={i}>{food ? food.name : f.foodId} (x{f.quantity}){i < meal.foods.length - 1 ? ', ' : ''}</span>
                      );
                    }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </Container>
  );
}
function Logs() {
  const { token } = useAuth();
  const [logs, setLogs] = React.useState([]);
  const [foods, setFoods] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [foodId, setFoodId] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [time, setTime] = React.useState('');
  const [date, setDate] = React.useState('');
  const [adding, setAdding] = React.useState(false);

  const fetchLogs = async (dateFilter = '') => {
    setLoading(true);
    setError('');
    try {
      const url = dateFilter ? `http://localhost:3000/logs?date=${dateFilter}` : 'http://localhost:3000/logs';
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setLogs(data.data);
      } else {
        setError(data.error || 'Failed to fetch logs');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await fetch('http://localhost:3000/foods', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setFoods(data.data);
      }
    } catch { }
  };

  React.useEffect(() => {
    if (token) {
      fetchLogs();
      fetchFoods();
    }
  }, [token]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          foodId,
          quantity: Number(quantity),
          time
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setLogs(l => [...l, data.data]);
        setFoodId(''); setQuantity(''); setTime('');
      } else {
        setError(data.error || 'Failed to add log');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setAdding(false);
    }
  };

  const handleDateFilter = (e) => {
    setDate(e.target.value);
    fetchLogs(e.target.value);
  };

  if (!token) {
    return <Container sx={{ mt: 4 }}><Alert severity="warning">Please login to view logs.</Alert></Container>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Food Logs</Typography>
      <Box component="form" onSubmit={handleAddLog} sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Food"
          value={foodId}
          onChange={e => setFoodId(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ minWidth: 120 }}
          required
        >
          <option value="">Select food</option>
          {foods.map(food => (
            <option key={food.id} value={food.id}>{food.name}</option>
          ))}
        </TextField>
        <TextField label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
        <TextField label="Time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
        <Button type="submit" variant="contained" disabled={adding}>Add Log</Button>
        {adding && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Filter by Date"
          type="date"
          value={date}
          onChange={handleDateFilter}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Food</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Quantity</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Time</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const food = foods.find(f => f.id === log.foodId);
                return (
                  <tr key={log.id}>
                    <td style={{ padding: 8 }}>{food ? food.name : log.foodId}</td>
                    <td style={{ padding: 8 }}>{log.quantity}</td>
                    <td style={{ padding: 8 }}>{log.time}</td>
                    <td style={{ padding: 8 }}>{log.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      )}
    </Container>
  );
}
function Insights() {
  const { token } = useAuth();
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/insights/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSummary(data.data);
      } else {
        setError(data.error || 'Failed to fetch summary');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (token) fetchSummary();
  }, [token]);

  if (!token) {
    return <Container sx={{ mt: 4 }}><Alert severity="warning">Please login to view insights.</Alert></Container>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Nutrition Insights</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : summary ? (
        <Box sx={{ maxWidth: 400, mx: 'auto', bgcolor: '#fff', p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom>Summary</Typography>
          <Typography>Calories: <b>{summary.calories}</b></Typography>
          <Typography>Protein: <b>{summary.protein}</b> g</Typography>
          <Typography>Carbs: <b>{summary.carbs}</b> g</Typography>
          <Typography>Fat: <b>{summary.fat}</b> g</Typography>
        </Box>
      ) : (
        <Typography>No summary available.</Typography>
      )}
    </Container>
  );
}


function App() {
  const { token, logout } = useAuth();
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Campus Nutrition Hack
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          {!token && <Button color="inherit" component={Link} to="/login">Login</Button>}
          <Button color="inherit" component={Link} to="/foods">Foods</Button>
          <Button color="inherit" component={Link} to="/meals">Meals</Button>
          <Button color="inherit" component={Link} to="/logs">Logs</Button>
          <Button color="inherit" component={Link} to="/insights">Insights</Button>
          {token && <Button color="inherit" onClick={logout}>Logout</Button>}
        </Toolbar>
      </AppBar>
      <Box sx={{ minHeight: '80vh', bgcolor: '#f5f5f5' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
