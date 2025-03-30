# JWT Authentication & User Management System

🚀 **Live Demo**: [https://form-jwt-test-ps51.vercel.app/](https://form-jwt-test-ps51.vercel.app/)

![Desktop Preview](/frontend/public/desktop.jpg)
![Mobile Preview](/frontend/public/mobile.jpg)

## Fitur Utama
- ✅ **Authentication System**
  - Login/Logout dengan JWT
  - Registrasi pengguna baru
  - Proteksi route dengan token
- 👥 **User Management**
  - CRUD Operations (Buat, Baca, Update, Hapus user)
  - Form validasi
  - Pagination dan grid layout
- 🎨 **Modern UI**
  - Animasi dengan Framer Motion
  - Responsive design
  - Gradient dan efek glassmorphism
  - Loading spinner
- 🔒 **Keamanan**
  - Password hashing dengan bcryptjs
  - Proteksi endpoint backend
  - Error handling lengkap

## Teknologi
**Frontend**:
- ⚡ Vite + React
- 🎨 Tailwind CSS
- 🛣️ React Router v6
- 🔄 Axios
- 🌀 Framer Motion

**Backend**:
- 🚀 Node.js + Express
- 🍃 MongoDB + Mongoose
- 🔑 JWT Authentication
- 🔒 Bcryptjs

## Instalasi
1. Clone repository
```bash
git clone https://github.com/FadhliRajwaa/form-jwt-test.git

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Backend (.env)
MONGO_URI=your_mongodb_uri
SECRET_KEY=your_jwt_secret
PORT=3000
FRONTEND_URL=https://form-jwt-test-ps51.vercel.app  # Ganti dengan URL frontend setelah deploy


# Frontend (.env.local)
VITE_BACKEND_URL=https://form-jwt-test-backend.vercel.app  # Ganti dengan URL backend setelah deploy


# Backend
npm start

# Frontend
npm run dev