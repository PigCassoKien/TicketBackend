import React, { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import Banner from "../components/banner";
import MovieCarousel from "../components/movieCarousel";
import Footer from "../components/footer";
import { getMoviesByStatus } from "../api/filmApi";

// Debug imports để kiểm tra
console.log({ Banner, MovieCarousel, Footer });

// Error Boundary để bắt lỗi runtime
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div>Lỗi: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

// Constants
const ANIMATION_DELAYS = {
  NOW_PLAYING: 500,
  UPCOMING: 1000,
};

// Định nghĩa hiệu ứng fade-in và slide-up với spring animation
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

// Custom hook để fetch movies
const useMovies = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [playingMovies, upcomingMovies] = await Promise.all([
          getMoviesByStatus("PLAYING"),
          getMoviesByStatus("UPCOMING"),
        ]);

        setNowPlayingMovies(playingMovies || []);
        setUpcomingMovies(upcomingMovies || []);
      } catch (error) {
        setError("Không thể tải danh sách phim. Vui lòng thử lại.");
        console.error("Lỗi khi lấy dữ liệu phim:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return { nowPlayingMovies, upcomingMovies, loading, error };
};

// Skeleton component cho carousel
const CarouselSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="h-64 bg-gray-700 animate-pulse rounded-lg"
      ></div>
    ))}
  </div>
);

const HomePage = memo(({ authMode }) => {
  const { nowPlayingMovies, upcomingMovies, loading, error } = useMovies();
  const [nowPlayingVisible, setNowPlayingVisible] = useState(false);
  const [upcomingVisible, setUpcomingVisible] = useState(false);

  useEffect(() => {
    const nowPlayingTimer = setTimeout(
      () => setNowPlayingVisible(true),
      ANIMATION_DELAYS.NOW_PLAYING
    );
    const upcomingTimer = setTimeout(
      () => setUpcomingVisible(true),
      ANIMATION_DELAYS.UPCOMING
    );

    return () => {
      clearTimeout(nowPlayingTimer);
      clearTimeout(upcomingTimer);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className={`transition-all duration-300 ${
            authMode ? "blur-sm opacity-50" : ""
          }`}
        >
          <Banner />
        </motion.div>

        {/* Error message */}
        {error && (
          <div className="text-center py-4 text-red-500">
            {error}{" "}
            <button
              onClick={() => window.location.reload()}
              className="underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Carousel phim đang chiếu */}
        <motion.section
          initial="hidden"
          animate={nowPlayingVisible ? "visible" : "hidden"}
          variants={fadeInUp}
          className="py-8 px-4 sm:px-6 lg:px-8"
          role="region"
          aria-labelledby="now-playing"
        >
          <div className="max-w-7xl mx-auto">
            <h2
              id="now-playing"
              className="text-3xl font-bold text-white mb-6 flex items-center"
            >
              🎬 Phim Đang Chiếu
            </h2>
            {loading ? (
              <CarouselSkeleton />
            ) : (
              <MovieCarousel
                movies={nowPlayingMovies}
                title="Phim Đang Chiếu"
                status="PLAYING"
              />
            )}
          </div>
        </motion.section>

        {/* Carousel phim sắp chiếu */}
        <motion.section
          initial="hidden"
          animate={upcomingVisible ? "visible" : "hidden"}
          variants={fadeInUp}
          className="py-8 px-4 sm:px-6 lg:px-8"
          role="region"
          aria-labelledby="upcoming"
        >
          <div className="max-w-7xl mx-auto">
            <h2
              id="upcoming"
              className="text-3xl font-bold text-white mb-6 flex items-center"
            >
              🍿 Phim Sắp Chiếu
            </h2>
            {loading ? (
              <CarouselSkeleton />
            ) : (
              <MovieCarousel
                movies={upcomingMovies}
                title="Phim Sắp Chiếu"
                status="UPCOMING"
              />
            )}
          </div>
        </motion.section>

        {/* Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
});

export default HomePage;