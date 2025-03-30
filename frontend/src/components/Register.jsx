import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE_URL = "https://form-jwt-test-ps51.vercel.app/api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/register`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if(response.status === 201) {
        navigate('/');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Registrasi gagal');
      } else {
        setError('Tidak dapat terhubung ke server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-green-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
      >
        <motion.h2 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          Register
        </motion.h2>
        
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-300">
          Sudah punya akun?{' '}
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Login disini
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;