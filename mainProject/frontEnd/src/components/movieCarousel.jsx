import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MovieCarousel = ({ title, status, movies = [] }) => {
  const [scrollIndex, setScrollIndex] = useState(0);
  const itemsPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    if (!status) {
      console.error("Error: status is undefined or null", { title, status });
    } else {
      console.log("Fetching movies with status:", status);
    }
  }, [status]);

  const nextSlide = () => {
    setScrollIndex((prev) =>
      prev + itemsPerPage < movies.length ? prev + itemsPerPage : prev
    );
  };

  const prevSlide = () => {
    setScrollIndex((prev) =>
      prev - itemsPerPage >= 0 ? prev - itemsPerPage : 0
    );
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-white text-2xl font-bold flex items-center">
          <span className="text-red-500 mr-2">●</span> {title}
        </h2>
      </div>

      <div className="relative">
        {movies.length > 0 ? (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-gray-700 text-white rounded-full hover:bg-red-500 transition-all z-10"
              disabled={scrollIndex === 0}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="overflow-hidden">
              <div
                className="flex space-x-4 transition-transform duration-500"
                style={{
                  transform: `translateX(-${scrollIndex * (100 / itemsPerPage)}%)`,
                }}
              >
                {movies.map((movie, index) => (
                  <div
                    key={index}
                    className="w-1/4 min-w-[250px] cursor-pointer group transform hover:scale-105 transition-all"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                      <img
                        src={
                          movie.image
                            ? `http://localhost:8080/filmImages/${movie.image}`
                            : "/placeholder.jpg"
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                        <h3 className="text-white text-lg font-bold">{movie.title}</h3>
                        <p className="text-gray-300 text-sm">🎭 {movie.categories?.join(", ") || "No categories"}</p>
                        <p className="text-gray-400 text-sm">📅 {movie.releaseDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-gray-700 text-white rounded-full hover:bg-red-500 transition-all z-10"
              disabled={scrollIndex + itemsPerPage >= movies.length}
            >
              <ChevronRight size={24} />
            </button>
          </>
        ) : (
          <p className="text-gray-400 text-center">No movies available</p>
        )}
      </div>
    </div>
  );
};

export default MovieCarousel;
