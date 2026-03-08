import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetailPage from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import CommunityPage from './pages/Community';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex max-w-7xl mx-auto px-4 pt-16">
        <Sidebar />
        <main className="flex-1 min-w-0 py-6 lg:pl-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post/:slug" element={<PostDetailPage />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/u/:username" element={<Profile />} />
            <Route path="/c/:slug" element={<CommunityPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
