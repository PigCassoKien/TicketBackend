import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMoviesByStatus } from "../../api/filmApi.js";
import Footer from "../../components/footer.jsx";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// Định nghĩa hiệu ứng nâng cao
const sectionVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: {
    scale: 1.05,
    y: -10,
    boxShadow: "0px 10px 20px rgba(255, 0, 0, 0.2)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: {
    scale: 1.1,
    backgroundColor: "#b91c1c",
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Hàm giới hạn số từ và thêm dấu "..." nếu vượt quá
const truncateDescription = (text, maxWords = 20) => {
  if (!text) return "Không có mô tả";
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

const AdminPage = () => {
  const [playingMovies, setPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [playingVisible, setPlayingVisible] = useState(false);
  const [upcomingVisible, setUpcomingVisible] = useState(false);

  // Scroll-based parallax effect
  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 500], [0.3, 0.7]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 1.05]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const playingMoviesData = await getMoviesByStatus("PLAYING");
        setPlayingMovies(playingMoviesData);

        const upcomingMoviesData = await getMoviesByStatus("UPCOMING");
        setUpcomingMovies(upcomingMoviesData);
      } catch (err) {
        setError("Không thể tải danh sách phim.");
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();

    // Kích hoạt hiệu ứng cho các section
    const headerTimer = setTimeout(() => setHeaderVisible(true), 200);
    const dashboardTimer = setTimeout(() => setDashboardVisible(true), 400);
    const playingTimer = setTimeout(() => setPlayingVisible(true), 600);
    const upcomingTimer = setTimeout(() => setUpcomingVisible(true), 800);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(dashboardTimer);
      clearTimeout(playingTimer);
      clearTimeout(upcomingTimer);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Thử lại
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-[#0e0e10] text-white relative"
      style={{ background: `radial-gradient(circle, rgba(20, 20, 20, ${backgroundOpacity.get()}), rgba(14, 14, 16, 1))` }}
    >
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Tiêu đề với hiệu ứng scale và parallax */}
        <motion.div
          style={{ scale: headerScale }}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: headerVisible ? 1 : 0, y: headerVisible ? 0 : -50 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-red-500">
            Trang Quản Trị
          </h1>
        </motion.div>

        {/* Quản lý hệ thống */}
        <motion.section
          initial="hidden"
          animate={dashboardVisible ? "visible" : "hidden"}
          variants={sectionVariants}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-300">
            Quản Lý Hệ Thống
          </h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { name: "Quản lý người dùng", link: "/admin/users" },
              { name: "Quản lý suất chiếu", link: "/admin/showtimes" },
              { name: "Quản lý phim", link: "/admin/films" },
              { name: "Quản lý đặt vé", link: "/admin/bookings" },
              { name: "Quản lý thanh toán", link: "/admin/payments" },
            ].map((item) => (
              <motion.div key={item.name} variants={buttonVariants}>
                <Link
                  to={item.link}
                  className="block p-4 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all text-center text-lg font-medium"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Phim đang chiếu */}
        <motion.section
          initial="hidden"
          animate={playingVisible ? "visible" : "hidden"}
          variants={sectionVariants}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-300">
            Phim Đang Chiếu
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {playingMovies.length > 0 ? (
                playingMovies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-gray-900 rounded-lg shadow-lg p-4 cursor-pointer overflow-hidden relative"
                    onClick={() => (window.location.href = `/movie/${movie.id}`)}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="flex items-start gap-4 relative z-10">
                      <motion.img
                        src={
                          movie.image
                            ? `https://localhost:8443/filmImages/${movie.image}`
                            : "/placeholder.jpg"
                        }
                        alt={movie.title}
                        className="w-24 h-36 object-cover rounded-lg"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-400">
                          {movie.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                        </p>
                        <p className="text-sm text-gray-400">
                          Thời lượng: {movie?.durationInMinutes ?? "Chưa có thông tin"} phút
                        </p>
                        <motion.p
                          className="text-sm text-gray-400"
                          initial={{ y: 10, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          Mô tả: {truncateDescription(movie.description, 20)}
                        </motion.p>
                      </div>
                      <motion.span
                        className="bg-gray-700 text-white px-2 py-1 rounded"
                        whileHover={{ backgroundColor: "#ef4444" }}
                      >
                        2D
                      </motion.span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.p
                  className="text-center text-gray-400 col-span-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Hiện tại không có phim đang chiếu.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.section>

        {/* Phim sắp chiếu */}
        <motion.section
          initial="hidden"
          animate={upcomingVisible ? "visible" : "hidden"}
          variants={sectionVariants}
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-300">
            Phim Sắp Chiếu
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {upcomingMovies.length > 0 ? (
                upcomingMovies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-gray-900 rounded-lg shadow-lg p-4 cursor-pointer overflow-hidden relative"
                    onClick={() => (window.location.href = `/movie/${movie.id}`)}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="flex items-start gap-4 relative z-10">
                      <motion.img
                        src={
                          movie.image
                            ? `https://localhost:8443/filmImages/${movie.image}`
                            : "/placeholder.jpg"
                        }
                        alt={movie.title}
                        className="w-24 h-36 object-cover rounded-lg"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-400">
                          {movie.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                        </p>
                        <p className="text-sm text-gray-400">
                          Thời lượng: {movie?.durationInMinutes ?? "Chưa có thông tin"} phút
                        </p>
                        <p
                          className="text-sm text-gray-400"
                          initial={{ y: 10, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          Mô tả: {truncateDescription(movie.description, 20)}
                        </p>
                      </div>
                      <motion.span
                        className="bg-gray-700 text-white px-2 py-1 rounded"
                        whileHover={{ backgroundColor: "#ef4444" }}
                      >
                        2D
                      </motion.span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.p
                  className="text-center text-gray-400 col-span-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Hiện tại không có phim sắp chiếu.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.section>
      </div>
      <Footer />
    </motion.div>
  );
};

export default AdminPage;