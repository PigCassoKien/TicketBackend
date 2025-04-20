import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const PaymentPage = ({ isLoggedIn, onLogout, onLoginClick, onRegisterClick }) => {
  const { bookingId, totalPrice, seatCount } = useParams(); // Lấy bookingId, totalPrice, seatCount từ URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(600); // 10 phút đếm ngược

  // Đếm ngược thời gian
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(countdown);
          navigate(-1); // Quay lại trang trước nếu hết thời gian
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [navigate]);

  // Xử lý thanh toán
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Vui lòng đăng nhập để thanh toán!");
        navigate(-1); // Quay lại nếu chưa đăng nhập
        return;
      }

      const paymentRequest = {
        bookingID: bookingId,
        paymentType: "VNPAY",
      };

      const paymentResponse = await axios.post(
        `https://localhost:8443/api/payment/create`,
        paymentRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const paymentUrl = paymentResponse.data.paymentUrl;
      window.location.href = paymentUrl; // Chuyển hướng đến paymentUrl
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("accessToken");
        navigate(-1);
      } else {
        setError(error.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0e10]">
      {/* Header */}
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />

      {/* Nội dung chính */}
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-[600px] max-w-full max-h-[80vh] overflow-y-auto relative border border-gray-700">
          {/* Tiêu đề và thời gian */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Thanh Toán</h2>
            <div className="text-sm text-gray-300">
              {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })},{" "}
              {new Date().toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Phương thức thanh toán</h3>
            <div className="flex items-center bg-gray-800 p-3 rounded-lg">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/VnPay_Logo.png/800px-VnPay_Logo.png"
                alt="VNPay"
                className="w-8 h-8 mr-3"
              />
              <select
                className="bg-gray-800 text-white p-2 rounded w-full"
                defaultValue="VNPAY"
                disabled
              >
                <option value="VNPAY">VNPay</option>
              </select>
            </div>
          </div>

          {/* Vé xem phim */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Vé xem phim</h3>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-red-400">Còn {Math.floor(timer / 60)} phút chọn</span>
                <span className="text-gray-300">{seatCount} vé</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Thành tiền</span>
                <span className="text-lg font-semibold">{parseInt(totalPrice).toLocaleString()} đ</span>
              </div>
            </div>
          </div>

          {/* Nút Thanh Toán */}
          <button
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-500 transition-all"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Thanh Toán"}
          </button>

          {/* Footer trong nội dung */}
          <div className="flex justify-between items-center mt-6 text-sm text-gray-400">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/VnPay_Logo.png/800px-VnPay_Logo.png"
              alt="VNPay"
              className="w-12"
            />
            <div className="flex items-center">
              <span className="mr-2">© 2023-24. All rights reserved by PayGuru</span>
              <img
                src="https://via.placeholder.com/50x20.png?text=PayGuru"
                alt="PayGuru"
                className="w-12"
              />
            </div>
          </div>

          {/* Hiển thị lỗi nếu có */}
          {error && <p className="text-center text-red-400 text-sm mt-4">{error}</p>}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PaymentPage;