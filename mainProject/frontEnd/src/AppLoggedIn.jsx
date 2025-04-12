import { useState } from "react";
import NavbarLoggedIn from "./components/isLogged/navbarLoggedIn";
import Banner from "./components/banner";
import MovieCarousel from "./components/movieCarousel";
import Footer from "./components/Footer";
import { nowPlayingMovies, upcomingMovies } from "./data/moviesData";

export default function AppLoggedIn() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0e0e10] app-container">
      {/* Thanh Navbar khi đã đăng nhập */}
      <NavbarLoggedIn />

      {/* Nội dung chính */}
      <div className="transition-all duration-300">
        <Banner />
        <MovieCarousel movies={nowPlayingMovies} title="🎬 Phim Đang Chiếu" />
        <MovieCarousel movies={upcomingMovies} title="🍿 Phim Sắp Chiếu" />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
