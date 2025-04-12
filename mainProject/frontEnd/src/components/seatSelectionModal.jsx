import { useEffect, useState } from "react";
import axios from "axios";

const SeatSelectionModal = ({ showId, isOpen, onClose, movie, show }) => {
  const [vipSeats, setVipSeats] = useState([]);
  const [normalSeats, setNormalSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(600); // 10 phút (600 giây)
  const [seatTypePrice, setSeatTypePrice] = useState({ VIP: 0, NORMAL: 0 });

  useEffect(() => {
    if (isOpen && showId) {
      fetchSeats();
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            onClose(); // Hết thời gian, tự đóng modal
          }
          return prev > 0 ? prev - 1 : 0;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [isOpen, showId]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/show/${showId}/seats`);
      const seatsData = response.data || [];

      const vip = seatsData.filter((seat) => seat.type === "VIP");
      const normal = seatsData.filter((seat) => seat.type === "NORMAL");

      setVipSeats(vip);
      setNormalSeats(normal);

      // Lưu giá theo loại ghế
      setSeatTypePrice({
        VIP: vip.length > 0 ? vip[0].price : 0,
        NORMAL: normal.length > 0 ? normal[0].price : 0,
      });
    } catch (error) {
      setError("Không thể tải danh sách ghế. Vui lòng thử lại!");
      setVipSeats([]);
      setNormalSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeatSelection = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s.seatId !== seat.seatId)
        : [...prev, seat]
    );
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seatTypePrice[seat.type], 0);

  if (!isOpen) return null;

  const allSeats = [...vipSeats, ...normalSeats].sort((a, b) => {
    const rowA = a.seatIndex.charAt(0);
    const rowB = b.seatIndex.charAt(0);
    const numA = parseInt(a.seatIndex.substring(1));
    const numB = parseInt(b.seatIndex.substring(1));
    return rowA.localeCompare(rowB) || numA - numB;
  });

  const groupedSeats = allSeats.reduce((acc, seat) => {
    const row = seat.seatIndex.charAt(0);
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-[850px] max-w-full max-h-[80vh] overflow-y-auto relative mt-16 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {/* Nút thoát ❌ */}
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white transition z-10"
          onClick={onClose}
        >
          ×
        </button>

        {/* Giờ chiếu ở góc trên bên trái */}
        {show && (
          <div className="absolute top-4 left-4 text-sm text-gray-300">
            Giờ chiếu: {new Date(show.startTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}

        {/* Timer ở góc trên bên phải */}
        <div className="absolute top-4 right-16 text-sm text-red-400 font-semibold">
          Thời gian chọn ghế: {String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}
        </div>

        {/* Tiêu đề và màn hình chiếu */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold mb-4">
            {show?.hallName ? `Phòng chiếu ${show.hallName}` : "Phòng chiếu"}
          </h2>
          {/* Màn hình chiếu */}
          <div className="w-full h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-t-lg shadow-lg mb-4"></div>
        </div>

        {loading && <p className="text-center text-blue-400 text-sm">Đang tải ghế...</p>}
        {error && <p className="text-center text-red-400 text-sm">{error}</p>}

        {!loading && !error && (
          <div className="flex flex-col items-center gap-2">
            {Object.keys(groupedSeats).map((row) => (
              <div key={row} className="flex gap-1 justify-center">
                {groupedSeats[row].map((seat) => (
                  <button
                    key={seat.seatId}
                    className={`p-1 w-8 h-8 text-xs font-bold rounded transition-all text-center 
                      ${seat.status === "BOOKED" ? "bg-gray-500 text-gray-800 cursor-not-allowed" : "cursor-pointer"}
                      ${selectedSeats.includes(seat) ? "bg-blue-500 text-white" : seat.type === "VIP" ? "bg-orange-500 hover:bg-orange-400" : "bg-gray-300 text-black hover:bg-gray-200"}`}
                    disabled={seat.status === "BOOKED"}
                    onClick={() => toggleSeatSelection(seat)}
                  >
                    {seat.seatIndex}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Chú thích xếp hàng ngang */}
        <div className="mt-3 px-4 py-2 bg-gray-800 rounded flex justify-around text-center text-sm">
          <p className="text-orange-400">
            <span className="inline-block w-4 h-4 mr-1 bg-orange-500 rounded"></span>
            VIP ({seatTypePrice.VIP.toLocaleString()} VNĐ)
          </p>
          <p className="text-gray-300">
            <span className="inline-block w-4 h-4 mr-1 bg-gray-300 rounded"></span>
            Thường ({seatTypePrice.NORMAL.toLocaleString()} VNĐ)
          </p>
          <p className="text-blue-400">
            <span className="inline-block w-4 h-4 mr-1 bg-blue-500 rounded"></span>
            Đã chọn
          </p>
          <p className="text-gray-400">
            <span className="inline-block w-4 h-4 mr-1 bg-gray-500 rounded"></span>
            Đã đặt
          </p>
        </div>

        {/* Hiển thị seatIndex của ghế đã chọn */}
        <p className="text-center text-yellow-400 mt-2 text-lg">
          Ghế đã chọn: {selectedSeats.length > 0 ? selectedSeats.map(seat => seat.seatIndex).join(", ") : "Chưa chọn ghế"} - Tổng tiền: {totalPrice.toLocaleString()} VNĐ
        </p>

        <div className="flex justify-between mt-4">
          <button className="px-4 py-2 border rounded bg-gray-700 hover:bg-gray-600 text-sm" onClick={onClose}>
            Quay lại
          </button>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-500 text-sm"
            onClick={onClose}
            disabled={selectedSeats.length === 0}
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;