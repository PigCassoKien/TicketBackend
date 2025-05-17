import React, { useEffect, useState, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import SeatSelectionModal from "../components/seatSelectionModal";
import Footer from "../components/footer";
import LoginModal from "../components/loginModal";

// Constants
const BASE_URL = "https://localhost:8080/largeImages";
const MAX_WORDS = 20;
const ANIMATION_DELAYS = {
  HEADER: 500,
  CONTENT: 1000,
  SCHEDULE: 1500,
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Utility functions
const truncateDescription = (text, maxWords = MAX_WORDS) => {
  if (!text) return "Chưa có mô tả cho bộ phim này.";
  const words = text.split(" ");
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(" ") + "...";
};

const extractYouTubeID = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|shorts\/))([^#&?]*)/);
  return match ? match[1] : null;
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
};

// Custom hook for fetching movie details and showtimes
const useMovieDetails = (filmId) => {
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          setLoading(true);
          const [movieResponse, showtimeResponse] = await Promise.all([
            axios.get(`https://localhost:8080/api/film/getFilm/${filmId}`),
            axios.get(`https://localhost:8080/api/show/getByFilm?filmId=${filmId}`),
          ]);

          setMovie({
            ...movieResponse.data,
            durationInMins: movieResponse.data.duration_in_mins,
          });

          const sortedShowtimes = showtimeResponse.data.sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime)
          );
          setShowtimes(sortedShowtimes);

          if (sortedShowtimes.length > 0) {
            setSelectedDate(new Date(sortedShowtimes[0].startTime).toISOString().split("T")[0]);
          }

          setError(null);
          break;
        } catch (err) {
          if (i === retries - 1) {
            setError(`Không thể tải dữ liệu. Lỗi: ${err.response?.status || err.message}`);
          }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [filmId]);

  return { movie, showtimes, selectedDate, setSelectedDate, loading, error };
};

// Skeleton component for loading state
const MovieDetailSkeleton = () => (
  <div className="text-center text-white mt-10">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-60 h-80 bg-gray-700 rounded-lg"></div>
        <div className="space-y-2 w-full sm:w-1/2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="h-16 bg-gray-700 rounded mt-6 w-full"></div>
    </div>
  </div>
);

const MovieDetailPage = memo(({ isLoggedIn, setIsLoggedIn }) => {
  const { id } = useParams();
  const { movie, showtimes, selectedDate, setSelectedDate, loading, error } = useMovieDetails(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNotLoggedInModalOpen, setIsNotLoggedInModalOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);

  useEffect(() => {
    const headerTimer = setTimeout(() => setHeaderVisible(true), ANIMATION_DELAYS.HEADER);
    const contentTimer = setTimeout(() => setContentVisible(true), ANIMATION_DELAYS.CONTENT);
    const scheduleTimer = setTimeout(() => setScheduleVisible(true), ANIMATION_DELAYS.SCHEDULE);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(contentTimer);
      clearTimeout(scheduleTimer);
    };
  }, []);

  const openSeatModal = useCallback((show) => {
    if (!isLoggedIn) {
      setSelectedShow(show);
      setIsNotLoggedInModalOpen(true);
    } else {
      setSelectedShow(show);
      setIsSeatModalOpen(true);
    }
  }, [isLoggedIn]);

  const closeSeatModal = useCallback(() => {
    setIsSeatModalOpen(false);
    setSelectedShow(null);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsLoggedIn(true);
    if (selectedShow) {
      setIsSeatModalOpen(true);
    }
  }, [selectedShow, setIsLoggedIn]);

  const handleOpenLoginModal = useCallback(() => {
    setIsNotLoggedInModalOpen(false);
    setIsLoginModalOpen(true);
  }, []);

  const retryFetch = useCallback(() => {
    setLoading(true);
    setError(null);
    useMovieDetails(id);
  }, [id]);

  if (loading) return <MovieDetailSkeleton />;
  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error}
        <button
          onClick={retryFetch}
          className="ml-2 text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }
  if (!movie) return <div className="text-center text-red-500 mt-10">Dữ liệu phim không khả dụng.</div>;

  const backgroundImageUrl = getImageUrl(movie.largeImage);
  const videoId = extractYouTubeID(movie.trailer);
  const uniqueDates = [...new Set(
    showtimes.map((show) => new Date(show.startTime).toISOString().split("T")[0])
  )];

  return (
    <>
      <div
        className="relative w-full bg-cover bg-center flex flex-col items-center p-4 sm:p-8 mt-16 min-h-screen pb-20"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black opacity-80 backdrop-blur-md z-0"></div>
        <div className="relative z-10 text-white text-center max-w-5xl w-full">
          {/* Movie title */}
          <motion.h1
            className="text-3xl sm:text-4xl font-bold mb-4 text-red-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: headerVisible ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            {movie.title}
          </motion.h1>

          {/* Movie info */}
          <motion.section
            className="flex flex-col sm:flex-row items-center gap-6"
            initial="hidden"
            animate={contentVisible ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <motion.img
              src={movie.image ? `https://localhost:8080/filmImages/${movie.image}` : "/placeholder.jpg"}
              alt={`Poster phim ${movie.title}`}
              className="w-60 h-80 object-cover rounded-lg shadow-lg"
              loading="lazy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: contentVisible ? 1 : 0, scale: contentVisible ? 1 : 0.8 }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              className="space-y-2 text-left"
              variants={fadeInUp}
            >
              <p><strong>🎭 Thể loại:</strong> {movie.categories?.join(", ") || "Không có"}</p>
              <p><strong>⏳ Thời lượng:</strong> {movie.durationInMins ?? "Chưa có thông tin"} phút</p>
              <p><strong>🎬 Diễn viên:</strong> {movie.actors?.join(", ") || "Chưa có thông tin"}</p>
              <p><strong>📅 Ngày phát hành:</strong> {movie.releaseDate || "Không có"}</p>
            </motion.div>
          </motion.section>

          {/* Description and trailer */}
          <motion.div
            className="mt-6 text-gray-300"
            initial="hidden"
            animate={contentVisible ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <p>
              {truncateDescription(movie.description?.trim())}
              {movie.description?.trim() && movie.description.split(" ").length > MAX_WORDS && (
                <motion.button
                  onClick={() => setIsDescriptionModalOpen(true)}
                  className="ml-2 text-red-500 hover:text-red-700 underline text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Xem chi tiết nội dung phim"
                >
                  Chi tiết nội dung
                </motion.button>
              )}
            </p>
            {videoId && (
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Xem trailer phim"
              >
                🎥 Xem Trailer
              </motion.button>
            )}
          </motion.div>

          {/* Showtimes */}
          <motion.section
            className="bg-gray-900 rounded-lg shadow-lg p-6 mt-6"
            initial="hidden"
            animate={scheduleVisible ? "visible" : "hidden"}
            variants={fadeInUp}
            role="region"
            aria-labelledby="showtimes"
          >
            <motion.h2
              id="showtimes"
              className="text-2xl font-semibold text-center mb-4"
              variants={fadeInUp}
            >
              🎟️ Lịch Chiếu
            </motion.h2>
            <motion.div
              className="flex justify-center space-x-2 overflow-x-auto px-4 py-3 bg-gray-800 rounded-lg"
              variants={staggerContainer}
              initial="hidden"
              animate={scheduleVisible ? "visible" : "hidden"}
            >
              {uniqueDates.map((date) => (
                <motion.button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-lg font-medium border-2 ${
                    selectedDate === date
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-500"
                  }`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Chọn ngày chiếu ${new Date(date).toLocaleDateString("vi-VN")}`}
                >
                  {new Date(date).toLocaleDateString("vi-VN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </motion.button>
              ))}
            </motion.div>
            <motion.div
              className="mt-4 text-lg font-semibold text-red-400"
              variants={fadeInUp}
            >
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Vui lòng chọn ngày"}
            </motion.div>
            <motion.p
              className="mt-2 text-sm text-orange-400 font-medium"
              variants={fadeInUp}
            >
              Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h, dưới 16 tuổi trước 23h.
            </motion.p>
            <motion.div
              className="mt-4 flex flex-wrap justify-center gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate={scheduleVisible ? "visible" : "hidden"}
            >
              {showtimes
                .filter((show) => new Date(show.startTime).toISOString().split("T")[0] === selectedDate)
                .map((show) => (
                  <motion.button
                    key={show.id || show.startTime}
                    onClick={() => openSeatModal(show)}
                    className="px-6 py-3 font-semibold bg-gray-800 border-2 border-gray-600 rounded-full hover:bg-red-600 hover:border-red-500"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Chọn suất chiếu lúc ${new Date(show.startTime).toLocaleTimeString("vi-VN")}`}
                  >
                    {new Date(show.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </motion.button>
                ))}
            </motion.div>
          </motion.section>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="trailer-modal"
          >
            <motion.div
              className="bg-gray-900 p-4 rounded-lg relative w-full max-w-2xl"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className="absolute top-2 right-2 text-white text-2xl"
                onClick={() => setIsModalOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Đóng trailer"
              >
                ✖
              </motion.button>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`Trailer phim ${movie.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isDescriptionModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="description-modal"
          >
            <motion.div
              className="bg-gray-900 p-6 rounded-lg text-white max-w-lg w-full relative"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className="absolute top-2 right-2 text-white text-2xl"
                onClick={() => setIsDescriptionModalOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Đóng mô tả"
              >
                ✖
              </motion.button>
              <h3 id="description-modal" className="text-xl font-semibold mb-4">Nội dung phim</h3>
              <p className="text-gray-300">
                {movie.description?.trim() || "Chưa có mô tả cho bộ phim này."}
              </p>
            </motion.div>
          </motion.div>
        )}

        {isNotLoggedInModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="not-logged-in-modal"
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-lg text-white text-center max-w-md w-full"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 id="not-logged-in-modal" className="text-xl font-semibold mb-4">Bạn chưa đăng nhập</h3>
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
      </AnimatePresence>

      {isLoggedIn && selectedShow && (
        <SeatSelectionModal
          showId={selectedShow.id}
          isOpen={isSeatModalOpen}
          onClose={closeSeatModal}
          movie={movie}
          show={selectedShow}
        />
      )}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        switchToRegister={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <Footer />
    </>
  );
});

export default MovieDetailPage;