import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Silakan login terlebih dahulu');
            navigate('/');
            return;
          }
          
          const response = await axios.get(`https://form-jwt-test-ps51.vercel.app/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setFormData({
            username: response.data.username,
            email: response.data.email,
            password: '',
          });
        } catch (err) {
          if (err.response) {
            setError(err.response.data.message || 'Gagal mengambil data user');
            if (err.response.status === 401 || err.response.status === 403) {
              navigate('/');
            }
          } else {
            setError('Tidak dapat terhubung ke server');
          }
        }
      };
      fetchUser();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Silakan login terlebih dahulu');
        navigate('/');
        return;
      }

      if (id) {
        await axios.put(
          `https://form-jwt-test-ps51.vercel.app/api/users/${id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "https://form-jwt-test-ps51.vercel.app/api/users",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      navigate('/users');
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Gagal menyimpan data');
      } else {
        setError('Tidak dapat terhubung ke server');
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
      >
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500"
        >
          {id ? 'Edit Pengguna' : 'Tambah Pengguna'}
        </motion.h2>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 mb-4 text-center"
          >
            {error}
          </motion.p>
        )}
        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-4"
          >
            <label className="block text-sm mb-2 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              placeholder="Enter username"
            />
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-4"
          >
            <label className="block text-sm mb-2 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              placeholder={id ? 'Leave blank to keep unchanged' : 'Enter password'}
            />
          </motion.div>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-6"
          >
            <label className="block text-sm mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              placeholder="Enter email"
            />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold"
          >
            {id ? 'Update' : 'Tambah'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default UserForm;