import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Footer from "../components/footer.jsx";
import { getMoviesByStatus, getShowtimesByFilm } from "../api/filmApi.js";
import LoginModal from "../components/loginModal";
import { toast } from "react-toastify";

// Constants
const API_STATUSES = ["PLAYING", "UPCOMING"];
const ANIMATION_DELAYS = {
  HEADER: 200,
  MOVIES: 400,
};
const MAX_WORDS = 20;
const MAX_SHOWTIMES = 5;

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: "0px 8px 16px rgba(255, 0, 0, 0.2)",
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.05, backgroundColor: "#b91c1c" },
  tap: { scale: 0.95 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.7, transition: { duration: 0.3 } },
};

// Utility functions
const truncateDescription = (text, maxWords = MAX_WORDS) => {
  if (!text) return "Không có mô tả";
  const words = text.split(" ");
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(" ") + "...";
};

// Skeleton component
const ScheduleSkeleton = () => (
  <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col items-center justify-center">
    <div className="animate-pulse w-full max-w-7xl px-4">
      <div className="h-10 bg-gray-700 rounded mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-lg p-4">
            <div className="flex gap-4">
              <div className="w-24 h-36 bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-700 rounded-full w-24"></div>
                <div className="h-8 bg-gray-700 rounded-full w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Custom hook for schedule data
const useScheduleData = () => {
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        setLoading(true);
        const [playingMovies, upcomingMovies] = await Promise.all(
          API_STATUSES.map((status) => getMoviesByStatus(status))
        );
        const allMovies = [...playingMovies, ...upcomingMovies];
        setMovies(allMovies);

        const showtimesPromises = allMovies.map((movie) => getShowtimesByFilm(movie.id));
        const showtimesResponses = await Promise.all(showtimesPromises);
        const allShowtimes = showtimesResponses.flatMap((response) => response);
        const sortedShowtimes = allShowtimes.sort(
          (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );
        setShowtimes(sortedShowtimes);
        setError(null);
        break;
      } catch (err) {
        if (i === retries - 1) {
          setError(`Không thể tải lịch chiếu. Lỗi: ${err.message}`);
          toast.error("Không thể tải lịch chiếu.");
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { movies, showtimes, loading, error, refetch: fetchData };
};

// MovieCard component
const MovieCard = memo(({ movie, showtimes, handleShowtimeClick }) => {
  const movieShowtimes = showtimes
    .filter((show) => show.filmId === String(movie.id))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, MAX_SHOWTIMES);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-gray-900 rounded-lg shadow-lg p-4 cursor-pointer relative overflow-hidden"
      onClick={() => (window.location.href = `/movie/${movie.id}`)}
      role="article"
      aria-labelledby={`movie-${movie.id}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="flex items-start gap-4 relative z-10">
        <motion.img
          src={movie.image ? `https://localhost:8080/filmImages/${movie.image}` : "/placeholder.jpg"}
          alt={`Poster phim ${movie.title}`}
          className="w-24 h-36 object-cover rounded-lg"
          loading="lazy"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="flex-1">
          <h3 id={`movie-${movie.id}`} className="text-lg font-semibold text-red-400">
            {movie.title}
          </h3>
          <p className="text-sm text-gray-400">
            Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
          </p>
          <p className="text-sm text-gray-400">
            Thời lượng: {movie?.durationInMinutes ?? "Chưa có thông tin"} phút
          </p>
          <p className="text-sm text-gray-400">{truncateDescription(movie.description)}</p>
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
          <motion.div className="flex flex-wrap gap-2 mt-2" variants={containerVariants} initial="hidden" animate="visible">
            {movieShowtimes.map((show) => (
              <motion.button
                key={show.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowtimeClick(show);
                }}
                className="px-4 py-2 text-sm font-semibold bg-gray-800 border-2 border-gray-600 rounded-full hover:bg-red-600 hover:border-red-500"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                aria-label={`Chọn suất chiếu ${new Date(show.startTime).toLocaleString("vi-VN")}`}
              >
                {new Date(show.startTime).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </motion.button>
            ))}
            {movieShowtimes.length === MAX_SHOWTIMES && (
              <motion.button
                className="px-4 py-2 text-sm text-red-500 underline"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/movie/${movie.id}`;
                }}
                aria-label="Xem thêm lịch chiếu"
              >
                Xem thêm
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

// SeatSelectionModal component
const SeatSelectionModal = memo(({ show, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={modalVariants}
    role="dialog"
    aria-labelledby="seat-selection-modal"
  >
    <motion.div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full" variants={modalVariants}>
      <h2 id="seat-selection-modal" className="text-xl font-bold text-white mb-4">
        Chọn ghế cho suất chiếu: {new Date(show.startTime).toLocaleString("vi-VN")}
      </h2>
      <p className="text-gray-300">Phim: {show.filmName}</p>
      <p className="text-gray-300">Phòng: {show.hallName}</p>
      <motion.button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Đóng modal chọn ghế"
      >
        Đóng
      </motion.button>
    </motion.div>
  </motion.div>
));

const SchedulePage = memo(() => {
  const [selectedShow, setSelectedShow] = useState(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isNotLoggedInModalOpen, setIsNotLoggedInModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [moviesVisible, setMoviesVisible] = useState(false);
  const { movies, showtimes, loading, error, refetch } = useScheduleData();

  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 500], [0.3, 0.7]);

  useEffect(() => {
    const headerTimer = setTimeout(() => setHeaderVisible(true), ANIMATION_DELAYS.HEADER);
    const moviesTimer = setTimeout(() => setMoviesVisible(true), ANIMATION_DELAYS.MOVIES);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(moviesTimer);
    };
  }, []);

  const isLoggedIn = useCallback(() => !!localStorage.getItem("accessToken"), []);

  const handleShowtimeClick = useCallback((show) => {
    if (!isLoggedIn()) {
      setSelectedShow(show);
      setIsNotLoggedInModalOpen(true);
    } else {
      setSelectedShow(show);
      setIsSeatModalOpen(true);
    }
  }, [isLoggedIn]);

  const handleCloseSeatModal = useCallback(() => {
    setIsSeatModalOpen(false);
    setSelectedShow(null);
  }, []);

  const handleOpenLoginModal = useCallback(() => {
    setIsNotLoggedInModalOpen(false);
    setIsLoginModalOpen(true);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoginModalOpen(false);
    if (isLoggedIn() && selectedShow) {
      setIsSeatModalOpen(true);
    }
  }, [isLoggedIn, selectedShow]);

  if (loading) return <ScheduleSkeleton />;
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
            onClick={refetch}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Thử lại tải lịch chiếu"
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
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-center mb-6 text-red-500"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: headerVisible ? 1 : 0, y: headerVisible ? 0 : -50 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Lịch Chiếu
        </motion.h1>

        <motion.section
          initial="hidden"
          animate={moviesVisible ? "visible" : "hidden"}
          variants={sectionVariants}
          className="py-4"
          role="region"
          aria-labelledby="schedule-section"
        >
          <motion.p
            className="text-center text-orange-400 mb-6"
            variants={childVariants}
            id="schedule-section"
          >
            Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h và khán giả dưới 16 tuổi chỉ chọn suất chiếu kết thúc trước 23h.
          </motion.p>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                showtimes={showtimes}
                handleShowtimeClick={handleShowtimeClick}
              />
            ))}
          </motion.div>
        </motion.section>
      </div>

      <AnimatePresence>
        {isLoggedIn() && selectedShow && (
          <SeatSelectionModal show={selectedShow} onClose={handleCloseSeatModal} />
        )}
        {isNotLoggedInModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            role="dialog"
            aria-labelledby="not-logged-in-modal"
          >
            <motion.div className="bg-gray-800 p-6 rounded-lg text-white text-center max-w-md w-full" variants={modalVariants}>
              <h3 id="not-logged-in-modal" className="text-xl font-semibold mb-4">
                Bạn chưa đăng nhập
              </h3>
              <p className="mb-6">Vui lòng đăng nhập để chọn ghế và đặt vé!</p>
              <motion.button
                onClick={handleOpenLoginModal}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Đăng nhập"
              >
                Đăng nhập ngay
              </motion.button>
              <motion.button
                onClick={() => setIsNotLoggedInModalOpen(false)}
                className="ml-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Đóng thông báo"
              >
                Đóng
              </motion.button>
            </motion.div>
          </motion.div>
        )}
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
});

export default SchedulePage;