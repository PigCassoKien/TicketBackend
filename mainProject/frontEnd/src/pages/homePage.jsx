import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Banner from "../components/banner";
import MovieCarousel from "../components/movieCarousel";
import Footer from "../components/footer";
import { getMoviesByStatus } from "../api/filmApi";

// Định nghĩa hiệu ứng fade-in và slide-up
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const HomePage = ({ authMode }) => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingVisible, setNowPlayingVisible] = useState(false);
  const [upcomingVisible, setUpcomingVisible] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const playingMovies = await getMoviesByStatus("PLAYING");
        const upcomingMovies = await getMoviesByStatus("UPCOMING");

        setNowPlayingMovies(playingMovies || []);
        setUpcomingMovies(upcomingMovies || []);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu phim:", error);
      }
    };

    fetchMovies();

    const nowPlayingTimer = setTimeout(() => {
      setNowPlayingVisible(true);
    }, 500);

    const upcomingTimer = setTimeout(() => {
      setUpcomingVisible(true);
    }, 1000);

    return () => {
      clearTimeout(nowPlayingTimer);
      clearTimeout(upcomingTimer);
    };
  }, []);

  return (
    <div>
      {/* Banner với hiệu ứng fade-in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={`${
          authMode ? "blur-sm opacity-50 transition-all duration-300" : "transition-all duration-300"
        }`}
      >
        <Banner />
      </motion.div>

      {/* Carousel phim đang chiếu */}
      <motion.section
        initial="hidden"
        animate={nowPlayingVisible ? "visible" : "hidden"}
        variants={fadeInUp}
        className="py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            🎬 Phim Đang Chiếu
          </h2>
          <MovieCarousel movies={nowPlayingMovies} title="Phim Đang Chiếu" status="PLAYING" />
        </div>
      </motion.section>

      {/* Carousel phim sắp chiếu */}
      <motion.section
        initial="hidden"
        animate={upcomingVisible ? "visible" : "hidden"}
        variants={fadeInUp}
        className="py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            🍿 Phim Sắp Chiếu
          </h2>
          <MovieCarousel movies={upcomingMovies} title="Phim Sắp Chiếu" status="UPCOMING" />
        </div>
      </motion.section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;