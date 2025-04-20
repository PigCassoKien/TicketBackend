import { Search, User, LogOut, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Hàm giới hạn số từ và thêm dấu "..." nếu vượt quá
const truncateDescription = (text, maxWords = 20) => {
  if (!text) return "Không có mô tả"; // Xử lý trường hợp không có mô tả

  const words = text.split(" ");
  if (words.length <= maxWords) return text; // Nếu số từ nhỏ hơn hoặc bằng giới hạn, trả về nguyên bản

  return words.slice(0, maxWords).join(" ") + "..."; // Cắt ngắn và thêm "..."
};

const Navbar = ({ isLoggedIn, onRegisterClick, onLoginClick, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fullName, setFullName] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State cho từ khóa tìm kiếm
  const [searchResults, setSearchResults] = useState([]); // State cho kết quả tìm kiếm
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
        `https://localhost:8443/api/film/searchFilmsByPrefix?prefix=${encodeURIComponent(prefix)}&pageNumber=0&pageSize=50`,
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
    handleSearch(value); // Gọi tìm kiếm ngay khi gõ
  };

  // Xử lý khi người dùng nhấn Enter
  const handleSearchSubmit = async (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      try {
        const response = await axios.get(
          `https://localhost:8443/api/film/searchFilmsByPrefix?prefix=${encodeURIComponent(searchTerm)}&pageNumber=0&pageSize=50`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const films = response.data || [];
        // Chuyển hướng đến trang SearchResultsPage và truyền danh sách phim qua state
        navigate("/search-results", { state: { searchedFilms: films } });
        // Đóng thanh tìm kiếm và dropdown
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
    setSearchTerm(""); // Xóa từ khóa tìm kiếm
    setSearchResults([]); // Xóa kết quả tìm kiếm
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
      <header
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#111]/70 backdrop-blur-lg shadow-md" : "bg-[#111]/50 backdrop-blur-md"
        }`}
        onMouseLeave={handleMouseLeave}
      >
        <nav className="flex items-center justify-between px-6 md:px-10 py-3">
          <Link to={isAdmin() ? "/admin" : "/"} className="flex items-center gap-2">
            <img src="/logo.png" alt="National Cinema Center" className="h-10 md:h-12 w-auto" />
          </Link>

          {isLoggedIn && isAdmin() ? (
            <ul
              className={`hidden md:flex items-center gap-6 text-sm font-medium transition-all duration-300 ${
                isSearching
                  ? "opacity-0 translate-y-[-20px] pointer-events-none"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {[
                { name: "Quản lý người dùng", link: "/admin/users" },
                { name: "Quản lý suất chiếu", link: "/admin/showtimes" },
                { name: "Quản lý phim", link: "/admin/films" },
                { name: "Quản lý đặt vé", link: "/admin/bookings" },
                { name: "Quản lý thanh toán", link: "/admin/payments" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.link}
                    className="hover:text-red-500 transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul
              className={`hidden md:flex items-center gap-6 text-sm font-medium transition-all duration-300 ${
                isSearching
                  ? "opacity-0 translate-y-[-20px] pointer-events-none"
                  : "opacity-100 translate-y-0"
              }`}
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
                <li key={item.name}>
                  <Link to={item.link} className="hover:text-red-500 transition-all duration-300">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {isSearching && (
            <div className="absolute left-1/2 transform -translate-x-1/2 w-[50%]">
              <input
                type="text"
                placeholder="Tìm kiếm phim, sự kiện..."
                className="w-full p-2 bg-gray-800/80 text-white rounded-lg outline-none"
                autoFocus
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit} // Xử lý khi nhấn Enter
              />
              {/* Dropdown hiển thị kết quả tìm kiếm */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-gray-900 rounded-lg shadow-lg mt-2 max-h-96 overflow-y-auto z-50">
                  {searchResults.map((film) => (
                    <div
                      key={film.id}
                      className="flex items-start gap-4 p-4 border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigate(`/movie/${film.id}`)}
                    >
                      <img
                        src={
                          film.image
                            ? `https://localhost:8443/filmImages/${film.image}`
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearching(!isSearching)}
              className="p-2 text-white hover:text-red-500 transition"
            >
              {isSearching ? <X size={22} /> : <Search size={22} />}
            </button>

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 flex items-center gap-2 text-white hover:text-red-500 transition"
                >
                  {fullName ? <span className="font-semibold">Chào, {fullName}</span> : <User size={22} />}
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/90 text-white rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-800 transition"
                    >
                      Hồ sơ
                    </button>
                    <Link to="/tickets" className="block px-4 py-2 hover:bg-gray-800 transition">
                      Vé của tôi
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 hover:bg-gray-800 transition">
                      Cài đặt
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 transition flex items-center gap-2"
                    >
                      <LogOut size={18} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="p-2 text-white hover:text-red-500 transition">
                  <User size={22} />
                </button>
                <button
                  className="hidden md:block border border-white px-4 py-2 rounded-lg text-white hover:bg-white hover:text-black transition"
                  onClick={onRegisterClick}
                >
                  Đăng ký
                </button>
                <button
                  className="hidden md:block bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600 transition"
                  onClick={onLoginClick}
                >
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-white text-center shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Bạn có chắc chắn muốn đăng xuất?</h3>
            <p className="mb-6">Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng các tính năng.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogoutConfirm}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                Có, đăng xuất
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;