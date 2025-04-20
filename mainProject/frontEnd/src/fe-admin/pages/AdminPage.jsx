import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMoviesByStatus } from "../../api/filmApi.js";
import Footer from "../../components/footer.jsx";

// Hàm giới hạn số từ và thêm dấu "..." nếu vượt quá
const truncateDescription = (text, maxWords = 20) => {
  if (!text) return "Không có mô tả"; // Xử lý trường hợp không có mô tả

  const words = text.split(" ");
  if (words.length <= maxWords) return text; // Nếu số từ nhỏ hơn hoặc bằng giới hạn, trả về nguyên bản

  return words.slice(0, maxWords).join(" ") + "..."; // Cắt ngắn và thêm "..."
};

const AdminPage = () => {
  const [playingMovies, setPlayingMovies] = useState([]); // State cho phim đang chiếu
  const [upcomingMovies, setUpcomingMovies] = useState([]); // State cho phim sắp chiếu
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Lấy danh sách phim đang chiếu (PLAYING)
        const playingMoviesData = await getMoviesByStatus("PLAYING");
        setPlayingMovies(playingMoviesData);

        // Lấy danh sách phim sắp chiếu (UPCOMING)
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
  }, []);

  if (loading) return <div className="text-center text-white mt-10">Đang tải...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white">
      <div className="container mx-auto px-4 py-8 pt-20"> {/* Thêm pt-20 để tránh bị che bởi Navbar */}
        {/* Admin Dashboard Header */}
        <h1 className="text-4xl font-bold text-center mb-8 text-red-500">
          Trang Quản Trị
        </h1>

        {/* Navigation Links */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-300">
            Quản Lý Hệ Thống
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: "Quản lý người dùng", link: "/admin/users" },
              { name: "Quản lý suất chiếu", link: "/admin/showtimes" },
              { name: "Quản lý phim", link: "/admin/films" },
              { name: "Quản lý đặt vé", link: "/admin/bookings" },
              { name: "Quản lý thanh toán", link: "/admin/payments" },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.link}
                className="p-4 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all text-center text-lg font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Playing Movies Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-300">
            Phim Đang Chiếu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playingMovies.length > 0 ? (
              playingMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-900 rounded-lg shadow-lg p-4 cursor-pointer hover:scale-105 hover:shadow-lg transition-all"
                  onClick={() => (window.location.href = `/movie/${movie.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        movie.image
                          ? `https://localhost:8443/filmImages/${movie.image}`
                          : "/placeholder.jpg"
                      }
                      alt={movie.title}
                      className="w-24 h-36 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-400">
                        {movie.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Khởi chiếu:{" "}
                        {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-sm text-gray-400">
                        Thời lượng:{" "}
                        {movie?.durationInMinutes ?? "Chưa có thông tin"} phút
                      </p>
                      <p className="text-sm text-gray-400">
                        Mô tả: {truncateDescription(movie.description, 20)}
                      </p>
                    </div>
                    <span className="bg-gray-700 text-white px-2 py-1 rounded">
                      2D
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 col-span-full">
                Hiện tại không có phim đang chiếu.
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Movies Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-300">
            Phim Sắp Chiếu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMovies.length > 0 ? (
              upcomingMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-900 rounded-lg shadow-lg p-4 cursor-pointer hover:scale-105 hover:shadow-lg transition-all"
                  onClick={() => (window.location.href = `/movie/${movie.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        movie.image
                          ? `https://localhost:8443/filmImages/${movie.image}`
                          : "/placeholder.jpg"
                      }
                      alt={movie.title}
                      className="w-24 h-36 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-400">
                        {movie.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Khởi chiếu:{" "}
                        {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-sm text-gray-400">
                        Thời lượng:{" "}
                        {movie?.durationInMinutes ?? "Chưa có thông tin"} phút
                      </p>
                      <p className="text-sm text-gray-400">
                        Mô tả: {truncateDescription(movie.description, 20)}
                      </p>
                    </div>
                    <span className="bg-gray-700 text-white px-2 py-1 rounded">
                      2D
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 col-span-full">
                Hiện tại không có phim sắp chiếu.
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;