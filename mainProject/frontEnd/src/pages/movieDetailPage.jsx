import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SeatSelectionModal from "../components/seatSelectionModal";
import Footer from "../components/footer";
import LoginModal from "../components/loginModal";

// Hàm giới hạn số từ và thêm dấu "..." nếu vượt quá
const truncateDescription = (text, maxWords = 20) => {
  if (!text) return "Chưa có mô tả cho bộ phim này.";
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

const MovieDetailPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNotLoggedInModalOpen, setIsNotLoggedInModalOpen] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(`https://localhost:8443/api/film/getFilm/${id}`);
        console.log("Phản hồi API phim:", response.data);
        setMovie({
          ...response.data,
          durationInMins: response.data.duration_in_mins,
        });
      } catch (err) {
        setError("Không tìm thấy thông tin phim.");
      } finally {
        setLoading(false);
      }
    };

    const fetchShowtimes = async () => {
      try {
        const response = await axios.get(`https://localhost:8443/api/show/getByFilm?filmId=${id}`);
        const sortedShowtimes = response.data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        setShowtimes(sortedShowtimes);

        if (sortedShowtimes.length > 0) {
          const firstDate = new Date(sortedShowtimes[0].startTime).toISOString().split("T")[0];
          setSelectedDate(firstDate);
        }
      } catch (err) {
        console.error("Lỗi khi tải lịch chiếu:", err);
      }
    };

    fetchMovieDetails();
    fetchShowtimes();
  }, [id]);

  const openSeatModal = (show) => {
    console.log("📡 Nhấp vào suất chiếu:", show);
    if (!isLoggedIn) {
      console.log("⚠️ Chưa đăng nhập, mở NotLoggedInModal");
      setSelectedShow(show);
      setIsNotLoggedInModalOpen(true);
    } else {
      console.log("✅ Đã đăng nhập, mở SeatSelectionModal");
      setSelectedShow(show);
      setIsSeatModalOpen(true);
    }
  };

  const closeSeatModal = () => {
    console.log("🔳 Đóng SeatSelectionModal");
    setIsSeatModalOpen(false);
    setSelectedShow(null);
  };

  const handleLoginSuccess = () => {
    console.log("🎉 Đăng nhập thành công, kiểm tra mở SeatModal");
    setIsLoginModalOpen(false);
    setIsLoggedIn(true);
    if (selectedShow) {
      console.log("✅ Có selectedShow, mở SeatSelectionModal");
      setIsSeatModalOpen(true);
    } else {
      console.log("❌ Không có selectedShow");
    }
  };

  const handleOpenLoginModal = () => {
    setIsNotLoggedInModalOpen(false);
    setIsLoginModalOpen(true);
  };

  if (loading) return <div className="text-center text-white mt-10">Đang tải...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!movie) return <div className="text-center text-red-500 mt-10">Dữ liệu phim không khả dụng.</div>;

  const extractYouTubeID = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|shorts\/))([^#&?]*)/);
    return match ? match[1] : null;
  };
  const BASE_URL = "https://localhost:8443/largeImages";
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
  };
  const backgroundImageUrl = getImageUrl(movie.largeImage);
  const videoId = extractYouTubeID(movie.trailer);

  const uniqueDates = [...new Set(
    showtimes.map((show) => new Date(show.startTime).toISOString().split("T")[0])
  )];

  return (
    <>
      <div
        className="relative w-full bg-cover bg-center flex flex-col items-center p-8 mt-16 min-h-full pb-20
          before:absolute before:inset-0 before:bg-black before:opacity-80 before:backdrop-blur-md before:z-0"
        style={{ backgroundImage: `url(${backgroundImageUrl})`, height: "auto" }}
      >
        <div className="relative z-10 text-white text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-500 text-shadow">{movie.title}</h1>
          <div className="flex flex-col sm:flex-row items-center">
            <img
              src={
                movie.image
                  ? `https://localhost:8443/filmImages/${movie.image}`
                  : "/placeholder.jpg"
              }
              alt={movie.title}
              className="w-60 h-80 object-cover rounded-lg shadow-lg"
            />
            <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 space-y-2 text-shadow">
              <p><strong>🎭 Thể loại:</strong> {movie.categories?.join(", ") || "Không có"}</p>
              <p><strong>⏳ Thời lượng:</strong> {movie?.durationInMinutes ?? "Chưa có thông tin"} phút</p>
              <p><strong>🎬 Diễn viên:</strong> {movie.actors?.join(", ") || "Chưa có thông tin"}</p>
              <p><strong>📅 Ngày phát hành:</strong> {movie.releaseDate || "Không có"}</p>
            </div>
          </div>
          <div className="mt-6 text-gray-300 text-shadow">
            <p>
              {truncateDescription(movie.description?.trim(), 20)}
              {movie.description?.trim() && movie.description.split(" ").length > 20 && (
                <button
                  onClick={() => setIsDescriptionModalOpen(true)}
                  className="ml-2 text-red-500 hover:text-red-700 underline text-sm"
                >
                  Chi tiết nội dung
                </button>
              )}
            </p>
          </div>
          {videoId && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-block bg-red-500 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition-all"
            >
              🎥 Xem Trailer
            </button>
          )}
          <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-2xl font-semibold text-center mb-4 text-shadow">🎟️ Lịch Chiếu</h2>
            <div className="flex justify-center space-x-2 overflow-x-auto px-4 py-3 bg-gray-800 rounded-lg shadow-md">
              {uniqueDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-5 py-3 rounded-lg transition-all font-medium shadow-md border-2 
                    ${
                      selectedDate === date
                        ? "bg-red-600 text-white border-red-500 scale-105 shadow-lg"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-500"
                    }`}
                >
                  {new Date(date).toLocaleDateString("vi-VN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </button>
              ))}
            </div>
            <div className="mt-4 text-lg font-semibold text-red-400 text-shadow">
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Không xác định"}
            </div>
            <p className="mt-2 text-sm text-orange-400 font-medium">
              Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h và khán giả dưới 16 tuổi chỉ chọn suất chiếu kết thúc trước 23h.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {showtimes
                .filter((show) => new Date(show.startTime).toISOString().split("T")[0] === selectedDate)
                .map((show) => (
                  <button
                    key={show.id || show.startTime}
                    onClick={() => openSeatModal(show)}
                    className="px-6 py-3 text-lg font-semibold bg-gray-800 border-2 border-gray-600 rounded-full 
                              hover:bg-red-600 hover:border-red-500 transition-all shadow-md"
                  >
                    {new Date(show.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </button>
                ))}
            </div>
          </div>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg relative">
              <button
                className="absolute top-2 right-2 text-white text-2xl"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>
              <div className="w-[560px] h-[315px]">
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </div>
        )}
        {isDescriptionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg text-white shadow-lg max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-white text-2xl"
                onClick={() => setIsDescriptionModalOpen(false)}
              >
                ✖
              </button>
              <h3 className="text-xl font-semibold mb-4">Nội dung phim</h3>
              <p className="text-gray-300">
                {movie.description?.trim() || "Chưa có mô tả cho bộ phim này."}
              </p>
            </div>
          </div>
        )}
      </div>
      <Footer />
      {isLoggedIn && selectedShow && (
        <SeatSelectionModal
          showId={selectedShow.id}
          isOpen={isSeatModalOpen}
          onClose={closeSeatModal}
          movie={movie}
          show={selectedShow} // Truyền selectedShow để hiển thị giờ chiếu
        />
      )}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        switchToRegister={() => {
          setIsLoginModalOpen(false);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
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
    </>
  );
};

export default MovieDetailPage;