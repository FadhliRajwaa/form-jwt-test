import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Silakan login terlebih dahulu");
          navigate("/");
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        if (err.response) {
          setError(err.response.data.message || "Gagal mengambil data");
          if (err.response.status === 401 || err.response.status === 403) {
            navigate("/");
          }
        } else if (err.request) {
          setError("Tidak dapat terhubung ke server.");
        } else {
          setError("Terjadi kesalahan: " + err.message);
        }
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((user) => user._id !== id));
      } catch (err) {
        if (err.response) {
          setError(err.response.data.message || "Gagal menghapus user");
        } else if (err.request) {
          setError("Tidak dapat terhubung ke server.");
        } else {
          setError("Terjadi kesalahan: " + err.message);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="relative p-6 sm:p-8 lg:p-12">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500"
          >
            Daftar Pengguna
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={handleLogout}
            className="mt-4 sm:mt-0 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold text-white"
          >
            Logout
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(34, 197, 94, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate("/users/new")}
          className="mb-8 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold text-white"
        >
          Tambah Pengguna
        </motion.button>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 mb-6 text-center"
          >
            {error}
          </motion.p>
        )}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="text-xl font-semibold text-blue-300"
              >
                {user.username}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="text-gray-300"
              >
                {user.email}
              </motion.p>
              <div className="mt-4 flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => navigate(`/users/edit/${user._id}`)}
                  className="px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-all duration-300 font-medium text-white"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleDelete(user._id)}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-300 font-medium text-white"
                >
                  Hapus
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default UserList;