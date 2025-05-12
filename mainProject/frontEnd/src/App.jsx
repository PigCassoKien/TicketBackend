import { Routes, Route, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import AdminBookingPage from "./fe-admin/pages/BookingPage";
import ProtectedRoute from "./components/ProtectRoute";
import SearchResultsPage from "./pages/SearchResultPage";
import PaymentPage from "./pages/paymentPage";
import PaymentManagementPage from "./fe-admin/pages/PaymentManagementPage"; // Thêm import
import axios from "axios";

// Placeholder pages
const NewsPage = () => <div>Tin tức</div>;
const PromotionsPage = () => <div>Khuyến mãi</div>;
const TicketPricePage = () => <div>Giá vé</div>;
const FilmFestivalPage = () => <div>Liên hoan phim</div>;
const AboutPage = () => <div>Giới thiệu</div>;
const TicketsPage = () => <div>Vé của tôi</div>;
const SettingsPage = () => <div>Cài đặt</div>;

export default function App() {
  const [authMode, setAuthMode] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

    let redirectPath = "/";
    try {
      const decodedToken = jwtDecode(token);
      const roles = decodedToken.roles || [];
      const userRole = roles[0]?.replace("ROLE_", "");
      if (["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
        redirectPath = "/admin";
      }
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
    }

    setIsLoggedIn(true);
    setAuthMode(null);
    navigate(redirectPath);
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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0e10] app-container">
      <Navbar
        isLoggedIn={isLoggedIn}
        onRegisterClick={() => setAuthMode("register")}
        onLoginClick={() => setAuthMode("login")}
        onLogout={handleLogout}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <HomePage authMode={authMode} />
              </motion.div>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute setAuthMode={setAuthMode}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProfilePage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/movie/:id"
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <MovieDetailPage
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                />
              </motion.div>
            }
          />
          <Route
            path="/lich-chieu"
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <SchedulePage />
              </motion.div>
            }
          />
          <Route
            path="/tin-tuc"
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <NewsPage />
              </motion.div>
            }
          />
          <Route
            path="/khuyen-mai"
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <PromotionsPage />
              </motion.div>
            }
          />
          <Route
            path="/gia-ve"
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <TicketPricePage />
              </motion.div>
            }
          />
          <Route
            path="/lien-hoan-phim"
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <FilmFestivalPage />
              </motion.div>
            }
          />
          <Route
            path="/gioi-thieu"
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <AboutPage />
              </motion.div>
            }
          />
          <Route
            path="/search-results"
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <SearchResultsPage />
              </motion.div>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute setAuthMode={setAuthMode}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <TicketsPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute setAuthMode={setAuthMode}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <SettingsPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <AdminPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ManageUsersPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/showtimes"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ManageShowtimesPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/films"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ManageFilmsPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <AdminBookingPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} setAuthMode={setAuthMode}>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <PaymentManagementPage /> {/* Thay thế ManagePaymentsPage bằng PaymentManagementPage */}
                </motion.div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:bookingId/:totalPrice/:seatCount"
            element={
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <PaymentPage
                  isLoggedIn={isLoggedIn}
                  onLogout={handleLogout}
                  onLoginClick={() => setAuthMode("login")}
                  onRegisterClick={() => setAuthMode("register")}
                />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>

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