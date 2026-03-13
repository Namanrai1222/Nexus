import { Routes, Route, Outlet } from 'react-router-dom';
import AppNav from './components/layout/AppNav';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetailPage from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import CommunityPage from './pages/Community';
import CreateCommunity from './pages/CreateCommunity';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/shared/ProtectedRoute';

function AppLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-10">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Landing — no app chrome */}
      <Route path="/" element={<Landing />} />

      {/* Auth pages — no app chrome */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* App pages — with AppNav */}
      <Route element={<AppLayout />}>
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:slug"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:slug/post/:postSlug"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:slug"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-community"
          element={
            <ProtectedRoute>
              <CreateCommunity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/u/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
