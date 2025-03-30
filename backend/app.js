require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Validasi Environment Variables
const requiredEnvVars = ['SECRET_KEY', 'MONGO_URI'];
requiredEnvVars.forEach(env => {
  if (!process.env[env]) {
    console.error(`Error: ${env} tidak ditemukan di environment variables`);
    process.exit(1);
  }
});

// Koneksi MongoDB dengan timeout
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Terhubung ke MongoDB'))
  .catch(err => {
    console.error('Gagal terhubung ke MongoDB, mencoba lagi dalam 5 detik...', err);
    setTimeout(connectWithRetry, 5000);
  });
};
connectWithRetry();

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: [
    'https://form-jwt-test-ps51.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Schema dan Model untuk User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);

// Middleware untuk verifikasi token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token Diperlukan!' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('Token Error:', err.message);
      return res.status(403).json({ message: 'Token Tidak Valid!' });
    }
    req.user = decoded;
    next();
  });
};

// API Router
const apiRouter = express.Router();

// Tambahkan logging untuk semua rute API
apiRouter.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Endpoint POST /api/login
apiRouter.post('/login', async (req, res) => {
  console.log('Request login diterima:', req.body);
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User tidak ditemukan:', username);
      return res.status(401).json({ message: 'Username atau Password Salah!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password salah untuk user:', username);
      return res.status(401).json({ message: 'Username atau Password Salah!' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, {
      expiresIn: '1h'
    });
    console.log('Login berhasil, token:', token);
    res.json({ token });
  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint POST /api/register
apiRouter.post('/register', async (req, res) => {
  console.log('Request registrasi baru:', req.body);
  const { username, password, email } = req.body;
  
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Semua field diperlukan!' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username/email sudah digunakan!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();
    
    console.log('Registrasi berhasil:', newUser);
    res.status(201).json({ message: 'Registrasi berhasil!' });
  } catch (err) {
    console.error('Error registrasi:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint GET /api/users
apiRouter.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, 'username email');
    console.log('Mengambil daftar user:', users);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint GET /api/users/:id
apiRouter.get('/users/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, 'username email');
    if (!user) {
      console.log('User tidak ditemukan dengan ID:', req.params.id);
      return res.status(404).json({ message: 'User Tidak Ditemukan!' });
    }
    console.log('Mengambil user:', user);
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint POST /api/users
apiRouter.post('/users', verifyToken, async (req, res) => {
  console.log('Request membuat user baru:', req.body);
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    console.log('Field tidak lengkap:', { username, password, email });
    return res.status(400).json({ message: 'Semua field diperlukan!' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('Username atau email sudah digunakan:', { username, email });
      return res.status(400).json({ message: 'Username atau email sudah digunakan!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      email
    });
    await newUser.save();
    console.log('User baru dibuat:', newUser);
    res.status(201).json({ username: newUser.username, email: newUser.email });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint PUT /api/users/:id
apiRouter.put('/users/:id', verifyToken, async (req, res) => {
  console.log('Request update user:', req.params.id, req.body);
  const { username, password, email } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('User tidak ditemukan untuk update:', req.params.id);
      return res.status(404).json({ message: 'User Tidak Ditemukan!' });
    }

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (email) user.email = email;

    await user.save();
    console.log('User berhasil diupdate:', user);
    res.json({ username: user.username, email: user.email });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint DELETE /api/users/:id
apiRouter.delete('/users/:id', verifyToken, async (req, res) => {
  console.log('Request hapus user:', req.params.id);
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      console.log('User tidak ditemukan untuk hapus:', req.params.id);
      return res.status(404).json({ message: 'User Tidak Ditemukan!' });
    }
    console.log('User berhasil dihapus:', user);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pasang rute API di bawah /api
app.use('/api', apiRouter);

// Tambahkan rute dasar untuk debugging
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Eksport aplikasi untuk Vercel
module.exports = app;