import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import Register from './components/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/edit/:id" element={<UserForm />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;