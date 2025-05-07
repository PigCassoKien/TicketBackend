import { Search, User, LogOut, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Hàm giới hạn số từ và thêm dấu "..." nếu vượt quá
const truncateDescription = (text, maxWords = 20) => {
  if (!text) return "Không có mô tả";
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

// Hiệu ứng
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Navbar = ({ isLoggedIn, onRegisterClick, onLoginClick, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fullName, setFullName] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const getUserRole = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
      const decodedToken = jwtDecode(token);
      const roles = decodedToken.roles || [];
      return roles[0]?.replace("ROLE_", "");
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
      return null;
    }
  };

  const isAdmin = () => {
    const role = getUserRole();
    return role && ["ADMIN", "SUPER_ADMIN"].includes(role);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const storedFullName = localStorage.getItem("fullName");
      if (storedFullName) {
        setFullName(storedFullName);
      }
    } else {
      setFullName(null);
    }
  }, [isLoggedIn]);

  // Hàm tìm kiếm phim theo prefix
  const handleSearch = async (prefix) => {
    if (!prefix.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://ticketcinemaweb.onrender.com/api/film/searchFilmsByPrefix?prefix=${encodeURIComponent(prefix)}&pageNumber=0&pageSize=50`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const films = response.data || [];
      setSearchResults(films);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    }
  };

  // Xử lý khi người dùng gõ vào ô tìm kiếm
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  // Xử lý khi người dùng nhấn Enter
  const handleSearchSubmit = async (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      try {
        const response = await axios.get(
          `https://ticketcinemaweb.onrender.com/api/film/searchFilmsByPrefix?prefix=${encodeURIComponent(searchTerm)}&pageNumber=0&pageSize=50`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const films = response.data || [];
        navigate("/search-results", { state: { searchedFilms: films } });
        setIsSearching(false);
        setSearchTerm("");
        setSearchResults([]);
      } catch (error) {
        console.error("Search failed:", error);
        alert("Đã xảy ra lỗi khi tìm kiếm phim!");
      }
    }
  };

  const handleMouseLeave = () => {
    setIsSearching(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleLogoutConfirm = () => {
    console.log("🚪 Navbar - Đăng xuất được xác nhận");
    setFullName(null);
    onLogout();
    setIsMenuOpen(false);
    setIsLogoutModalOpen(false);
    navigate("/");
  };

  const handleLogoutClick = () => {
    console.log("📤 Navbar - Mở modal xác nhận đăng xuất");
    setIsLogoutModalOpen(true);
  };

  return (
    <>
      <motion.header
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#111]/70 backdrop-blur-lg shadow-md" : "bg-[#111]/50 backdrop-blur-md"
        }`}
        onMouseLeave={handleMouseLeave}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <nav className="flex items-center justify-between px-6 md:px-10 py-3">
          <Link to={isAdmin() ? "/admin" : "/"} className="flex items-center gap-2">
            <motion.img
              src="/logo.png"
              alt="National Cinema Center"
              className="h-10 md:h-12 w-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          </Link>

          <AnimatePresence>
            {!isSearching && (
              <>
                {isLoggedIn && isAdmin() ? (
                  <motion.ul
                    className="hidden md:flex items-center gap-6 text-sm font-medium"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {[
                      { name: "Quản lý người dùng", link: "/admin/users" },
                      { name: "Quản lý suất chiếu", link: "/admin/showtimes" },
                      { name: "Quản lý phim", link: "/admin/films" },
                      { name: "Quản lý đặt vé", link: "/admin/bookings" },
                      { name: "Quản lý thanh toán", link: "/admin/payments" },
                    ].map((item) => (
                      <motion.li key={item.name} variants={childVariants}>
                        <Link
                          to={item.link}
                          className="hover:text-red-500 transition-all duration-300"
                        >
                          {item.name}
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : (
                  <motion.ul
                    className="hidden md:flex items-center gap-6 text-sm font-medium"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {[
                      { name: "Trang chủ", link: "/" },
                      { name: "Lịch chiếu", link: "/lich-chieu" },
                      { name: "Tin tức", link: "/tin-tuc" },
                      { name: "Khuyến mãi", link: "/khuyen-mai" },
                      { name: "Giá vé", link: "/gia-ve" },
                      { name: "Liên hoan phim", link: "/lien-hoan-phim" },
                      { name: "Giới thiệu", link: "/gioi-thieu" },
                    ].map((item) => (
                      <motion.li key={item.name} variants={childVariants}>
                        <Link
                          to={item.link}
                          className="hover:text-red-500 transition-all duration-300"
                        >
                          {item.name}
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSearching && (
              <motion.div
                className="absolute left-1/2 transform -translate-x-1/2 w-[50%]"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeIn}
              >
                <input
                  type="text"
                  placeholder="Tìm kiếm phim, sự kiện..."
                  className="w-full p-2 bg-gray-800/80 text-white rounded-lg outline-none"
                  autoFocus
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchSubmit}
                />
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      className="absolute top-full left-0 right-0 bg-gray-900 rounded-lg shadow-lg mt-2 max-h-96 overflow-y-auto z-50"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={modalVariants}
                    >
                      {searchResults.map((film) => (
                        <motion.div
                          key={film.id}
                          className="flex items-start gap-4 p-4 border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
                          onClick={() => navigate(`/movie/${film.id}`)}
                          variants={childVariants}
                        >
                          <img
                            src={
                              film.image
                                ? `https://ticketcinemaweb.onrender.com/filmImages/${film.image}`
                                : "/placeholder.jpg"
                            }
                            alt={film.title}
                            className="w-16 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="text-md font-semibold text-red-400">{film.title}</h3>
                            <p className="text-sm text-gray-400">
                              Khởi chiếu: {new Date(film.releaseDate).toLocaleDateString("vi-VN")}
                            </p>
                            <p className="text-sm text-gray-400">
                              Mô tả: {truncateDescription(film.description, 20)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4">
            <motion.button
              onMouseEnter={() => setIsSearching(true)}
              className="p-2 text-white hover:text-red-500 transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isSearching ? <X size={22} /> : <Search size={22} />}
            </motion.button>

            {isLoggedIn ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 flex items-center gap-2 text-white hover:text-red-500 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {fullName ? <span className="font-semibold">Chào, {fullName}</span> : <User size={22} />}
                </motion.button>
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-gray-900/90 text-white rounded-lg shadow-lg overflow-hidden"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={modalVariants}
                    >
                      <motion.button
                        onClick={() => {
                          navigate("/profile");
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-800 transition"
                        whileHover={{ scale: 1.05 }}
                      >
                        Hồ sơ
                      </motion.button>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 hover:bg-gray-800 transition"
                      >
                        Cài đặt
                      </Link>
                      <motion.button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 py-2 hover:bg-gray-800 transition flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <LogOut size={18} /> Đăng xuất
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <motion.button
                  className="p-2 text-white hover:text-red-500 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <User size={22} />
                </motion.button>
                <motion.button
                  className="hidden md:block border border-white px-4 py-2 rounded-lg text-white hover:bg-white hover:text-black transition"
                  onClick={onRegisterClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đăng ký
                </motion.button>
                <motion.button
                  className="hidden md:block bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600 transition"
                  onClick={onLoginClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đăng nhập
                </motion.button>
              </>
            )}
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-lg text-white text-center shadow-lg"
              variants={modalVariants}
            >
              <h3 className="text-xl font-semibold mb-4">Bạn có chắc chắn muốn đăng xuất?</h3>
              <p className="mb-6">Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng các tính năng.</p>
              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={handleLogoutConfirm}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Có, đăng xuất
                </motion.button>
                <motion.button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Hủy
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;