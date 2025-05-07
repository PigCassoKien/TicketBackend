import { useEffect, useState } from "react";
import Footer from "../components/footer.jsx";
import { getMoviesByStatus, getShowtimesByFilm } from "../api/filmApi.js";
import LoginModal from "../components/loginModal";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

// Hiệu ứng nâng cao
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
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  hover: {
    scale: 1.05,
    y: -10,
    boxShadow: "0px 10px 20px rgba(255, 0, 0, 0.2)",
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hover: {
    scale: 1.1,
    backgroundColor: "#b91c1c",
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.7, transition: { duration: 0.3 } },
};

// Hàm giới hạn số từ
const truncateDescription = (text, maxWords = 20) => {
  if (!text) return "Không có mô tả";
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

// Component SeatSelectionModal
const SeatSelectionModal = ({ show, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
    >
      <motion.div
        className="bg-gray-800 p-6 rounded-lg max-w-lg w-full"
        variants={modalVariants}
      >
        <h2 className="text-xl font-bold text-white mb-4">
          Chọn ghế cho suất chiếu: {new Date(show.startTime).toLocaleString("vi-VN")}
        </h2>
        <p className="text-gray-300">Phim: {show.filmName}</p>
        <p className="text-gray-300">Phòng: {show.hallName}</p>
        <motion.button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Đóng
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const SchedulePage = () => {
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isNotLoggedInModalOpen, setIsNotLoggedInModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [moviesVisible, setMoviesVisible] = useState(false);

  // Scroll-based parallax effect
  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 500], [0.3, 0.7]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 1.05]);

  useEffect(() => {
    const fetchMoviesAndShowtimes = async () => {
      try {
        const playingMovies = await getMoviesByStatus("PLAYING");
        const upcomingMovies = await getMoviesByStatus("UPCOMING");
        const allMovies = [...playingMovies, ...upcomingMovies];
        setMovies(allMovies);

        const showtimesPromises = allMovies.map((movie) =>
          getShowtimesByFilm(movie.id)
        );
        const showtimesResponses = await Promise.all(showtimesPromises);
        const allShowtimes = showtimesResponses.flatMap((response) => response);
        const sortedShowtimes = allShowtimes.sort(
          (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );
        setShowtimes(sortedShowtimes);
      } catch (err) {
        setError("Không thể tải lịch chiếu.");
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoviesAndShowtimes();

    const headerTimer = setTimeout(() => setHeaderVisible(true), 200);
    const moviesTimer = setTimeout(() => setMoviesVisible(true), 400);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(moviesTimer);
    };
  }, []);

  const isLoggedIn = () => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  };

  const handleShowtimeClick = (show) => {
    if (!isLoggedIn()) {
      setSelectedShow(show);
      setIsNotLoggedInModalOpen(true);
    } else {
      setSelectedShow(show);
      setIsSeatModalOpen(true);
    }
  };

  const handleCloseSeatModal = () => {
    setIsSeatModalOpen(false);
    setSelectedShow(null);
  };

  const handleOpenLoginModal = () => {
    setIsNotLoggedInModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    if (isLoggedIn() && selectedShow) {
      setIsSeatModalOpen(true);
    }
  };

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
      className="min-h-screen bg-[#0e0e10] text-white"
      style={{ background: `radial-gradient(circle, rgba(20, 20, 20, ${backgroundOpacity.get()}), rgba(14, 14, 16, 1))` }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Tiêu đề */}
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-center mb-6 text-red-500"
          style={{ scale: headerScale }}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: headerVisible ? 1 : 0, y: headerVisible ? 0 : -50 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          Lịch Chiếu
        </motion.h1>

        {/* Phần lưu ý và danh sách phim */}
        <motion.section
          initial="hidden"
          animate={moviesVisible ? "visible" : "hidden"}
          variants={sectionVariants}
          className="py-4"
        >
          <motion.p
            className="text-center text-orange-400 mb-6"
            variants={childVariants}
          >
            Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h và khán giả dưới 16 tuổi chỉ chọn suất chiếu kết thúc trước 23h.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {movies.map((movie) => {
              const movieShowtimes = showtimes
                .filter((show) => show.filmId === String(movie.id))
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

              return (
                <motion.div
                  key={movie.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="bg-gray-900 rounded-lg shadow-lg p-4 cursor-pointer transition-all relative overflow-hidden"
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
                          ? `https://ticketcinemaweb.onrender.com/filmImages/${movie.image}`
                          : "/placeholder.jpg"
                      }
                      alt={movie.title}
                      className="w-24 h-36 object-cover rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-400">{movie.title}</h3>
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
                      <p className="text-sm text-gray-400">
                        Trạng thái: {movie.status === "PLAYING" ? "Đang chiếu" : "Sắp chiếu"}
                      </p>
                    </div>
                    <motion.span
                      className="bg-gray-700 text-white px-2 py-1 rounded"
                      whileHover={{ backgroundColor: "#ef4444" }}
                    >
                      2D
                    </motion.span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold">Lịch chiếu</h4>
                    {movieShowtimes.length === 0 ? (
                      <p className="text-sm text-gray-400">Không có suất chiếu</p>
                    ) : (
                      <motion.div
                        className="flex flex-wrap gap-2 mt-2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {movieShowtimes.map((show) => (
                          <motion.button
                            key={show.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowtimeClick(show);
                            }}
                            className="px-4 py-2 text-sm font-semibold bg-gray-800 border-2 border-gray-600 rounded-full 
                              hover:bg-red-600 hover:border-red-500 transition-all shadow-md cursor-pointer"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            {new Date(show.startTime).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>
      </div>

      <AnimatePresence>
        {isLoggedIn() && selectedShow && (
          <SeatSelectionModal show={selectedShow} onClose={handleCloseSeatModal} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNotLoggedInModalOpen && (
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
              <h3 className="text-xl font-semibold mb-4">Bạn chưa đăng nhập</h3>
              <p className="mb-6">Vui lòng đăng nhập để chọn ghế và đặt vé!</p>
              <motion.button
                onClick={handleOpenLoginModal}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Đăng nhập ngay
              </motion.button>
              <motion.button
                onClick={() => setIsNotLoggedInModalOpen(false)}
                className="ml-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Đóng
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoginModalOpen && (
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            switchToRegister={() => setIsLoginModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      <Footer />
    </motion.div>
  );
};

export default SchedulePage;