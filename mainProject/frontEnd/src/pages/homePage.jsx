import React, { useEffect, useState } from "react";
import Banner from "../components/banner";
import MovieCarousel from "../components/movieCarousel";
import Footer from "../components/Footer";
import { getMoviesByStatus } from "../api/filmApi";

const HomePage = ({ authMode }) => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const playingMovies = await getMoviesByStatus("PLAYING");
        const upcomingMovies = await getMoviesByStatus("UPCOMING");

        setNowPlayingMovies(playingMovies || []);
        setUpcomingMovies(upcomingMovies || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div>
      <div className={`${authMode ? "blur-sm opacity-50 transition-all duration-300" : "transition-all duration-300"}`}>
        <Banner />
        <MovieCarousel movies={nowPlayingMovies} title="🎬 Phim Đang Chiếu" status="PLAYING" />
        <MovieCarousel movies={upcomingMovies} title="🍿 Phim Sắp Chiếu" status="UPCOMING" />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
