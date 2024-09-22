const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios'); // Aggiungi questa linea
const e = require('express');

const app = express();
const port = 5000;
const secretKey = 'your_secret_key';

app.use(bodyParser.json());
app.use(cors()); // Aggiungi questa linea

const db = new sqlite3.Database('./database.db');

// Creazione delle tabelle
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`);
});



// Endpoint di registrazione
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
    if (err) {
      return res.status(500).json({ error: 'User already exists' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Endpoint di login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Genera il token JWT
    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });


    res.status(200).json({ message: 'Login successful', token });
  });
});

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).send({ error: 'No token provided' });
  }

  jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => { // Corrected line
    if (err) {
      return res.status(401).send({ error: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    next();
  });
};
// Endpoint protetti
app.get('/events', authenticate, (req, res) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json(rows);
  });
});


// Endpoint di aggiunta evento
app.post('/events', authenticate, (req, res) => {
  const { user, title, date } = req.body;

  // Log the request data
  console.log('Received event data:', { user, title, date });

  if (!user || !title || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(`INSERT INTO events (user, title, date) VALUES (?, ?, ?)`, [user, title, date], function (err) {
    if (err) {
      console.error('Error inserting event:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    else {
      const newEventId = this.lastID;
      return res.status(201).json({ message: 'Event added successfully', id: newEventId });
    }
  });
});

app.post('/tasks', authenticate, (req, res) => {
  const { date, title, status } = req.body;
  const createdBy = req.userId;

  if (!date || !title || !status) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  db.get('SELECT * FROM events WHERE date = ?', [date], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (event) {
      res.status(400).json({ error: 'The selected day is not free' });
    }

    db.run(`INSERT INTO tasks (date, title, status, created_by) VALUES (?, ?, ?, ?)`, [date, title, status, createdBy], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add task' });
      }
      res.status(201).json({ message: 'Task added successfully' });
    });
  });
});

app.put('/tasks/:id/accept', authenticate, (req, res) => {
  const taskId = req.params.id;
  const userId = req.userId;

  // Log the request data
  console.log('Accepting task:', { taskId, userId });

  db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
    if (err) {
      console.error('Error fetching task:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (task.created_by === userId) {
      console.error('You cannot accept your own task');
      return res.status(400).json({ error: 'You cannot accept your own task' });
    }

    db.run('UPDATE tasks SET status = ? WHERE id = ?', ['accepted', taskId], function (err) {
      if (err) {
        console.error('Error updating task:', err);
        return res.status(500).json({ error: 'Failed to accept task' });
      }
      console.log(`Task ${taskId} accepted by user ${userId}`);
      res.status(200).json({ message: 'Task accepted successfully' });
    });
  });
});

app.delete('/tasks/:id', authenticate, (req, res) => {
  const taskId = req.params.id;

  db.run('DELETE FROM tasks WHERE id = ?', [taskId], function (err) {
    if (err) {
      console.error('Error deleting task:', err);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  });
});

app.get('/tasks', authenticate, (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server avviato con succeso alla porta ${port}`);
});

