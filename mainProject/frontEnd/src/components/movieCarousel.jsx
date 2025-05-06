import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Định nghĩa hiệu ứng cho card
const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hover: {
    scale: 1.1,
    height: "26rem",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10,
    },
  },
};

const MovieCarousel = ({ title, status, movies = [] }) => {
  const [scrollIndex, setScrollIndex] = useState(0); // Bắt đầu từ phim đầu
  const itemsPerPage = 4;
  const navigate = useNavigate();
  const totalPages = Math.ceil(movies.length / itemsPerPage);
  const containerRef = useRef(null);

  // Duplicate danh sách phim 10 lần để cuộn liên tục
  const extendedMovies = movies.length > 0
    ? Array(10).fill(movies).flat() // Duplicate 10 lần
    : [];

  useEffect(() => {
    if (!status) {
      console.error("Error: status is undefined or null", { title, status });
    } else {
      console.log("Fetching movies with status:", status);
    }

    // Đặt transform ban đầu từ scrollIndex = 0
    if (movies.length > 0 && containerRef.current) {
      containerRef.current.style.transition = "none";
      containerRef.current.style.transform = `translateX(-${scrollIndex * (100 / itemsPerPage)}%)`;
      setTimeout(() => {
        containerRef.current.style.transition = "transform 0.7s ease-in-out";
      }, 50);
    }
  }, [status, movies]);

  const nextSlide = () => {
    setScrollIndex((prev) => prev + itemsPerPage); // Tăng scrollIndex liên tục
  };

  const prevSlide = () => {
    setScrollIndex((prev) => {
      const newIndex = prev - itemsPerPage;
      // Nếu nhỏ hơn 0, chuyển sang vị trí hiển thị bản sao trước đó
      return newIndex < 0 ? movies.length * itemsPerPage : newIndex;
    });
  };

  const goToPage = (pageIndex) => {
    setScrollIndex(pageIndex * itemsPerPage);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="relative">
        {movies.length > 0 ? (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-gray-700 text-white rounded-full hover:bg-red-500 transition-all z-20"
              disabled={movies.length <= itemsPerPage}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="overflow-hidden">
              <div
                ref={containerRef}
                className="flex space-x-4 transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${scrollIndex * (100 / itemsPerPage)}%)`,
                }}
              >
                {extendedMovies.map((movie, index) => (
                  <motion.div
                    key={`${movie.id || index}-${index}`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="w-1/4 min-w-[250px] cursor-pointer group relative z-20 transform-gpu"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                      <img
                        src={
                          movie.image
                            ? `https://localhost:8080/filmImages/${movie.image}`
                            : "/placeholder.jpg"
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                        <h3 className="text-white text-lg font-bold">{movie.title}</h3>
                        <p className="text-gray-300 text-sm">🎭 {movie.categories?.join(", ") || "No categories"}</p>
                        <p className="text-gray-400 text-sm">📅 {movie.releaseDate}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-gray-700 text-white rounded-full hover:bg-red-500 transition-all z-20"
              disabled={movies.length <= itemsPerPage}
            >
              <ChevronRight size={24} />
            </button>

            {/* Pagination dots */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index)}
                    className={`w-3 h-3 rounded-full ${
                      Math.floor((scrollIndex % movies.length) / itemsPerPage) === index
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-center">No movies available</p>
        )}
      </div>
    </div>
  );
};

export default MovieCarousel;