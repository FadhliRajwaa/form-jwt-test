require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  console.error('Error: SECRET_KEY tidak ditemukan di .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Terhubung ke MongoDB'))
  .catch(err => {
    console.error('Gagal terhubung ke MongoDB:', err);
    process.exit(1);
  });

app.use(bodyParser.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://form-jwt-test-ps51.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});
const User = mongoose.model('User', userSchema);

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token Diperlukan!' });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token Tidak Valid!' });
    req.user = user;
    next();
  });
};

// Tambahkan rute root
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Selamat datang di JWT Test API!',
    status: 'API is running',
    endpoints: {
      login: '/login (POST)',
      register: '/register (POST)',
      users: '/users (GET, POST, PUT, DELETE)'
    }
  });
});

// Endpoint lainnya tetap sama
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Username atau Password Salah!' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Semua field diperlukan!' });
  }
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: 'Username/email sudah digunakan!' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();
    res.status(201).json({ message: 'Registrasi berhasil!' });
  } catch (err) {
    console.error('Error registrasi:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, 'username email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/users/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, 'username email');
    if (!user) return res.status(404).json({ message: 'User Tidak Ditemukan!' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/users', verifyToken, async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Semua field diperlukan!' });
  }
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: 'Username atau email sudah digunakan!' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();
    res.status(201).json({ username: newUser.username, email: newUser.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/users/:id', verifyToken, async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User Tidak Ditemukan!' });
    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (email) user.email = email;
    await user.save();
    res.json({ username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User Tidak Ditemukan!' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;