import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Navbar from "./components/navbar";
import RegisterModal from "./components/registerModal";
import LoginModal from "./components/loginModal";
import ProfilePage from "./pages/profilePage";
import HomePage from "./pages/homePage";
import MovieDetailPage from "./pages/movieDetailPage";
import SchedulePage from "./pages/SchedulePage";
import AdminPage from "./fe-admin/pages/AdminPage";
import ManageUsersPage from "./fe-admin/pages/ManageUsersPage";
import ManageFilmsPage from "./fe-admin/pages/ManageFilmPage";
import ManageShowtimesPage from "./fe-admin/pages/ManageShowtimesPage";
import ProtectedRoute from "./components/ProtectRoute";
import SearchResultsPage from "./pages/SearchResultPage";

// Placeholder pages for navbar links
const NewsPage = () => <div>Tin tức</div>;
const PromotionsPage = () => <div>Khuyến mãi</div>;
const TicketPricePage = () => <div>Giá vé</div>;
const FilmFestivalPage = () => <div>Liên hoan phim</div>;
const AboutPage = () => <div>Giới thiệu</div>;
const TicketsPage = () => <div>Vé của tôi</div>;
const SettingsPage = () => <div>Cài đặt</div>;

// Placeholder pages for admin routes
const ManageBookingsPage = () => <div>Quản lý đặt vé</div>;
const ManagePaymentsPage = () => <div>Quản lý thanh toán</div>;

export default function App() {
  const [authMode, setAuthMode] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const checkLoginStatus = () => {
    const token = localStorage.getItem("accessToken");
    console.log("🔍 App.js - Kiểm tra trạng thái đăng nhập, accessToken:", token);
    return !!token;
  };

  useEffect(() => {
    setIsLoggedIn(checkLoginStatus());

    const handleStorageChange = () => {
      setIsLoggedIn(checkLoginStatus());
    };
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLoginSuccess = () => {
    console.log("🎉 App.js - Đăng nhập thành công");
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("❌ App.js - Không tìm thấy accessToken sau khi đăng nhập");
      setAuthMode("login");
      return;
    }

    // Kiểm tra vai trò người dùng
    let redirectPath = "/"; // Mặc định chuyển hướng về trang chủ
    try {
      const decodedToken = jwtDecode(token);
      const roles = decodedToken.roles || [];
      const userRole = roles[0]?.replace("ROLE_", "");
      if (["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
        redirectPath = "/admin"; // Chuyển hướng đến trang admin nếu là ADMIN hoặc SUPER_ADMIN
      }
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
    }

    setIsLoggedIn(true);
    setAuthMode(null);
    navigate(redirectPath); // Chuyển hướng dựa trên vai trò
  };

  const handleLogout = () => {
    console.log("🚪 App.js - Đăng xuất");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("fullName");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("phoneNumber");
    setIsLoggedIn(false);
    navigate("/");
    console.log("🔍 App.js - accessToken sau khi đăng xuất:", localStorage.getItem("accessToken"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0e10] app-container">
      <Navbar
        isLoggedIn={isLoggedIn}
        onRegisterClick={() => setAuthMode("register")}
        onLoginClick={() => setAuthMode("login")}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/" element={<HomePage authMode={authMode} />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute setAuthMode={setAuthMode}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movie/:id"
          element={
            <MovieDetailPage
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
            />
          }
        />
        <Route path="/lich-chieu" element={<SchedulePage />} />
        <Route path="/tin-tuc" element={<NewsPage />} />
        <Route path="/khuyen-mai" element={<PromotionsPage />} />
        <Route path="/gia-ve" element={<TicketPricePage />} />
        <Route path="/lien-hoan-phim" element={<FilmFestivalPage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/search-results" element={<SearchResultsPage />} /> {/* Sửa từ /search thành /search-results */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute setAuthMode={setAuthMode}>
              <TicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute setAuthMode={setAuthMode}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
              <ManageUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/showtimes"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
              <ManageShowtimesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/films"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
              <ManageFilmsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
              <ManageBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
              <ManagePaymentsPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {authMode === "register" && (
        <RegisterModal
          isOpen
          onClose={() => setAuthMode(null)}
          switchToLogin={() => setAuthMode("login")}
        />
      )}

      {authMode === "login" && (
        <LoginModal
          isOpen
          onClose={() => setAuthMode(null)}
          switchToRegister={() => setAuthMode("register")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}