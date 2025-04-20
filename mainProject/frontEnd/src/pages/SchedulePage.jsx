import { useEffect, useState } from "react";
import Footer from "../components/footer.jsx";
import { getMoviesByStatus, getShowtimesByFilm } from "../api/filmApi.js";
import LoginModal from "../components/loginModal";

// Hàm giới hạn số từ và thêm dấu "..." nếu vượt quá
const truncateDescription = (text, maxWords = 20) => {
  if (!text) return "Không có mô tả"; // Xử lý trường hợp không có mô tả

  const words = text.split(" ");
  if (words.length <= maxWords) return text; // Nếu số từ nhỏ hơn hoặc bằng giới hạn, trả về nguyên bản

  return words.slice(0, maxWords).join(" ") + "..."; // Cắt ngắn và thêm "..."
};

// Giả định component SeatSelectionModal
const SeatSelectionModal = ({ show, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-xl font-bold text-white mb-4">
          Chọn ghế cho suất chiếu: {new Date(show.startTime).toLocaleString("vi-VN")}
        </h2>
        <p className="text-gray-300">Phim: {show.filmName}</p>
        <p className="text-gray-300">Phòng: {show.hallName}</p>
        {/* Logic chọn ghế ở đây */}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
        >
          Đóng
        </button>
      </div>
    </div>
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

  useEffect(() => {
    const fetchMoviesAndShowtimes = async () => {
      try {
        // Lấy danh sách phim đang chiếu (PLAYING) và sắp chiếu (UPCOMING)
        const playingMovies = await getMoviesByStatus("PLAYING");
        const upcomingMovies = await getMoviesByStatus("UPCOMING");
        const allMovies = [...playingMovies, ...upcomingMovies]; // Gộp cả hai danh sách
        console.log("🎬 Tất cả phim:", allMovies);
        setMovies(allMovies);

        // Lấy lịch chiếu cho tất cả các phim
        const showtimesPromises = allMovies.map((movie) =>
          getShowtimesByFilm(movie.id)
        );
        const showtimesResponses = await Promise.all(showtimesPromises);
        const allShowtimes = showtimesResponses.flatMap((response) => response);
        console.log("📅 Lịch chiếu:", allShowtimes);
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
  }, []);

  // Hàm kiểm tra trạng thái đăng nhập
  const isLoggedIn = () => {
    const token = localStorage.getItem("accessToken");
    console.log("🔒 Kiểm tra trạng thái đăng nhập - accessToken:", token);
    return !!token;
  };

  // Hàm xử lý khi bấm vào suất chiếu
  const handleShowtimeClick = (show) => {
    console.log("📡 Nhấp vào suất chiếu:", show);
    if (!isLoggedIn()) {
      console.log("⚠️ Chưa đăng nhập, mở NotLoggedInModal");
      setSelectedShow(show);
      setIsNotLoggedInModalOpen(true);
    } else {
      console.log("✅ Đã đăng nhập, mở SeatSelectionModal");
      setSelectedShow(show);
      setIsSeatModalOpen(true);
    }
  };

  // Hàm đóng SeatSelectionModal
  const handleCloseSeatModal = () => {
    console.log("🔳 Đóng SeatSelectionModal");
    setIsSeatModalOpen(false);
    setSelectedShow(null);
  };

  // Hàm mở LoginModal
  const handleOpenLoginModal = () => {
    setIsNotLoggedInModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Hàm xử lý sau khi đăng nhập thành công
  const handleLoginSuccess = () => {
    console.log("🎉 Đăng nhập thành công, kiểm tra mở SeatModal");
    setIsLoginModalOpen(false);
    if (isLoggedIn() && selectedShow) {
      console.log("✅ Có selectedShow, mở SeatSelectionModal");
      setIsSeatModalOpen(true);
    } else {
      console.log("❌ Không có selectedShow hoặc chưa đăng nhập");
    }
  };

  if (loading) return <div className="text-center text-white mt-10">Đang tải...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-red-500">Lịch Chiếu</h1>

        <p className="text-center text-orange-400 mb-6">
          Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h và khán giả dưới 16 tuổi chỉ chọn suất chiếu kết thúc trước 23h.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => {
            const movieShowtimes = showtimes
              .filter((show) => show.filmId === String(movie.id))
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            return (
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
                    <h3 className="text-lg font-semibold text-red-400">{movie.title}</h3>
                    <p className="text-sm text-gray-400">
                      Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-sm text-gray-400">
                      Thời lượng: {movie?.durationInMinutes ?? "Chưa có thông tin"} phút
                    </p>
                    <p className="text-sm text-gray-400">
                      Mô tả: {truncateDescription(movie.description, 20)}
                    </p>
                    {/* Hiển thị trạng thái của phim */}
                    <p className="text-sm text-gray-400">
                      Trạng thái: {movie.status === "PLAYING" ? "Đang chiếu" : "Sắp chiếu"}
                    </p>
                  </div>
                  <span className="bg-gray-700 text-white px-2 py-1 rounded">2D</span>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Lịch chiếu</h4>
                  {movieShowtimes.length === 0 ? (
                    <p className="text-sm text-gray-400">Không có suất chiếu</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {movieShowtimes.map((show) => (
                        <button
                          key={show.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowtimeClick(show);
                          }}
                          className="px-4 py-2 text-sm font-semibold bg-gray-800 border-2 border-gray-600 rounded-full 
                            hover:bg-red-600 hover:border-red-500 transition-all shadow-md cursor-pointer"
                        >
                          {new Date(show.startTime).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hiển thị SeatSelectionModal khi có suất chiếu được chọn và người dùng đã đăng nhập */}
      {isLoggedIn() && selectedShow && (
        <SeatSelectionModal
          show={selectedShow}
          onClose={handleCloseSeatModal}
        />
      )}

      {/* Hiển thị NotLoggedInModal nếu chưa đăng nhập */}
      {isNotLoggedInModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-white text-center shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Bạn chưa đăng nhập</h3>
            <p className="mb-6">Vui lòng đăng nhập để chọn ghế và đặt vé!</p>
            <button
              onClick={handleOpenLoginModal}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
            >
              Đăng nhập ngay
            </button>
            <button
              onClick={() => setIsNotLoggedInModalOpen(false)}
              className="ml-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Hiển thị LoginModal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        switchToRegister={() => {
          setIsLoginModalOpen(false);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <Footer />
    </div>
  );
};

export default SchedulePage;