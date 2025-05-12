import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { motion, useScroll, useTransform } from "framer-motion";

// Hiệu ứng
const sectionVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hover: {
    scale: 1.1,
    backgroundColor: "#c2410c",
    boxShadow: "0px 0px 8px rgba(255, 165, 0, 0.5)",
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
};

const paymentMethodVariants = {
  selected: {
    scale: 1.05,
    borderColor: "#f97316",
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  unselected: {
    scale: 1,
    borderColor: "#4b5563",
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      type: "spring",
      stiffness: 100,
    },
  },
};

const PaymentPage = ({ isLoggedIn, onLogout, onLoginClick, onRegisterClick }) => {
  const { bookingId, totalPrice, seatCount } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(600);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [vnpayUrl, setVnpayUrl] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [filmId, setFilmId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  // Scroll-based parallax effect
  const { scrollY } = useScroll();
  const cardScale = useTransform(scrollY, [0, 200], [1, 1.05]);
  const backgroundOpacity = useTransform(scrollY, [0, 500], [0.3, 0.7]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(countdown);
          navigate(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const headerTimer = setTimeout(() => setHeaderVisible(true), 200);
    const contentTimer = setTimeout(() => setContentVisible(true), 400);

    return () => {
      clearInterval(countdown);
      clearTimeout(headerTimer);
      clearTimeout(contentTimer);
    };
  }, [navigate]);

  // Polling để kiểm tra trạng thái thanh toán
  useEffect(() => {
    let pollingInterval;
    if (isWaitingModalOpen && paymentId) {
      console.log("Bắt đầu polling API để kiểm tra trạng thái thanh toán...");
      pollingInterval = setInterval(async () => {
        try {
          console.log("Gọi API kiểm tra trạng thái với paymentId:", paymentId);
          const response = await axios.get(
            `https://localhost:8080/api/payment/status/${paymentId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
              },
            }
          );
          console.log("Phản hồi từ API /api/payment/status:", response.data);
          const { status, filmId, message } = response.data;

          setPaymentStatus(status);

          if (status === "APPROVED" && filmId) {
            clearInterval(pollingInterval);
            setIsWaitingModalOpen(false);
            setFilmId(filmId);
            setIsSuccessModalOpen(true);
          } else if (status === "PENDING") {
            // Tiếp tục hiển thị modal "Vui lòng hoàn tất thanh toán"
          } else {
            clearInterval(pollingInterval);
            setIsWaitingModalOpen(false);
            setError("Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.");
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
          clearInterval(pollingInterval);
          setIsWaitingModalOpen(false);
          if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            navigate("/login", {
              state: { error: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!" },
            });
          } else {
            setError(
              error.response?.data?.message ||
              error.message ||
              "Có lỗi xảy ra khi kiểm tra trạng thái thanh toán. Vui lòng thử lại."
            );
          }
        }
      }, 5000); // Kiểm tra mỗi 5 giây
    }

    return () => clearInterval(pollingInterval);
  }, [isWaitingModalOpen, paymentId, navigate]);

  const handlePayment = async (method) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Vui lòng đăng nhập để thanh toán!");
        navigate("/login");
        return;
      }

      if (!bookingId || bookingId.trim() === "") {
        setError("bookingID không hợp lệ. Vui lòng kiểm tra lại!");
        return;
      }

      const paymentRequest = {
        bookingID: bookingId,
        paymentType: method === "VNPAY" ? "VNPAY" : "QR",
      };

      console.log("Gọi API /api/payment/create với bookingId:", bookingId);
      const paymentResponse = await axios.post(
        `https://localhost:8080/api/payment/create`,
        paymentRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Phản hồi từ API /api/payment/create:", paymentResponse.data);

      if (!paymentResponse.data.paymentUrl) {
        throw new Error("Không nhận được paymentUrl từ server!");
      }

      const { paymentUrl, ticketDetail, id } = paymentResponse.data;
      setTicketDetail(ticketDetail);
      setPaymentId(id);
      if (method === "VNPAY") {
        console.log("Thiết lập vnpayUrl:", paymentUrl);
        setVnpayUrl(paymentUrl);
        console.log("Mở tab VNPay và hiển thị modal...");
        const newTab = window.open(paymentUrl, "_blank");
        if (newTab) {
          setIsWaitingModalOpen(true);
          console.log("isWaitingModalOpen sau khi thiết lập:", true);
        } else {
          setError(
            <span>
              Trình duyệt đã chặn mở tab mới. Vui lòng{" "}
              <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                nhấp vào đây
              </a>{" "}
              để mở trang thanh toán và cho phép popup.
            </span>
          );
        }
      } else {
        setQrCodeUrl(paymentUrl);
        setIsModalOpen(true);
        setError("Vui lòng quét mã QR để thanh toán. Sau khi thanh toán, hệ thống sẽ xác nhận trong vòng 5-10 phút.");
      }
    } catch (error) {
      console.error("Lỗi API:", error.response?.data, error.message);
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.message || "Đơn đặt vé đã được xử lý. Vui lòng tạo vé mới!");
      } else {
        setError(
          error.response?.data?.message ||
          error.message ||
          "Thanh toán thất bại. Vui lòng thử lại!"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVnpay = () => {
    setPaymentMethod("VNPAY");
    setError(null);
    if (vnpayUrl) {
      setError("Vui lòng nhấn nút Thanh Toán để mở tab VNPAY.");
    }
  };

  const handleSelectBankTransfer = () => {
    setPaymentMethod("BANK_TRANSFER");
    setError(null);
    if (qrCodeUrl) {
      setError("Vui lòng nhấn nút Thanh Toán để hiển thị mã QR.");
    }
  };

  const handlePayButton = () => {
    console.log("Nhấn nút Thanh Toán, paymentMethod:", paymentMethod);
    if (paymentMethod === "VNPAY") {
      if (vnpayUrl) {
        console.log("vnpayUrl đã tồn tại:", vnpayUrl);
        const newTab = window.open(vnpayUrl, "_blank");
        if (newTab) {
          setIsWaitingModalOpen(true);
          console.log("Tab VNPay mở thành công, hiển thị modal...");
        } else {
          setError(
            <span>
              Trình duyệt đã chặn mở tab mới. Vui lòng{" "}
              <a href={vnpayUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                nhấp vào đây
              </a>{" "}
              để mở trang thanh toán và cho phép popup.
            </span>
          );
          console.log("Không thể mở tab VNPay (bị chặn bởi trình duyệt).");
        }
      } else {
        console.log("Gọi handlePayment để lấy vnpayUrl...");
        handlePayment("VNPAY");
      }
    } else if (paymentMethod === "BANK_TRANSFER") {
      if (qrCodeUrl) {
        setIsModalOpen(true);
      } else {
        handlePayment("BANK_TRANSFER");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleReturnToMovieDetail = () => {
    console.log("Bấm nút Quay lại trang chi tiết phim, filmId:", filmId);
    setIsSuccessModalOpen(false);
    if (filmId) {
      navigate(`/movie/${filmId}`);
    } else {
      console.log("Không có filmId, quay về trang chủ");
      navigate("/");
    }
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation(); // Ngăn sự kiện lan truyền từ overlay
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-[#0e0e10]"
      style={{ background: `radial-gradient(circle, rgba(20, 20, 20, ${backgroundOpacity.get()}), rgba(14, 14, 16, 1))` }}
    >
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />

      <div className="flex-grow flex items-center justify-center p-6 pt-20">
        <motion.div
          className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-[600px] max-w-full max-h-[80vh] overflow-y-auto relative border border-gray-700"
          style={{ scale: cardScale }}
          initial="hidden"
          animate={contentVisible ? "visible" : "hidden"}
          variants={sectionVariants}
        >
          {/* Tiêu đề */}
          <motion.div
            initial="hidden"
            animate={headerVisible ? "visible" : "hidden"}
            variants={childVariants}
            className="flex justify-between items-center mb-6"
          >
            <h2 className="text-2xl font-bold">Thanh Toán</h2>
            <div className="text-sm text-gray-300">
              {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })},{" "}
              {new Date().toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
            </div>
          </motion.div>

          {/* Phương thức thanh toán */}
          <motion.div className="mb-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.h3 className="text-lg font-semibold mb-2" variants={childVariants}>
              Phương thức thanh toán
            </motion.h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className={`flex items-center bg-gray-800 p-3 rounded-lg cursor-pointer border-2 ${
                  paymentMethod === "VNPAY" ? "border-orange-500" : "border-gray-600"
                }`}
                onClick={handleSelectVnpay}
                variants={paymentMethodVariants}
                animate={paymentMethod === "VNPAY" ? "selected" : "unselected"}
                whileHover={{ scale: 1.03 }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/VnPay_Logo.png/800px-VnPay_Logo.png"
                  alt="VNPay"
                  className="w-8 h-8 mr-3"
                />
                <span>VNPay</span>
              </motion.div>
              <motion.div
                className={`flex items-center bg-gray-800 p-3 rounded-lg cursor-pointer border-2 ${
                  paymentMethod === "BANK_TRANSFER" ? "border-orange-500" : "border-gray-600"
                }`}
                onClick={handleSelectBankTransfer}
                variants={paymentMethodVariants}
                animate={paymentMethod === "BANK_TRANSFER" ? "selected" : "unselected"}
                whileHover={{ scale: 1.03 }}
              >
                <img
                  src="https://dummyimage.com/32x32/000/fff&text=Bank"
                  alt="Bank Transfer"
                  className="w-8 h-8 mr-3"
                />
                <span>Chuyển khoản ngân hàng</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Vé xem phim */}
          <motion.div className="mb-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.h3 className="text-lg font-semibold mb-2" variants={childVariants}>
              Vé xem phim
            </motion.h3>
            <motion.div
              className="bg-gray-800 p-4 rounded-lg"
              variants={childVariants}
              whileHover={{ scale: 1.02 }}
            >
              {ticketDetail ? (
                <>
                  <motion.div className="flex justify-between items-center mb-2" variants={childVariants}>
                    <span className="text-gray-300">Phim</span>
                    <span className="text-gray-300">{ticketDetail.filmName}</span>
                  </motion.div>
                  <motion.div className="flex justify-between items-center mb-2" variants={childVariants}>
                    <span className="text-gray-300">Phòng chiếu</span>
                    <span className="text-gray-300">{ticketDetail.hallName}</span>
                  </motion.div>
                  <motion.div className="flex justify-between items-center mb-2" variants={childVariants}>
                    <span className="text-gray-300">Thời gian</span>
                    <span className="text-gray-300">{ticketDetail.startTime}</span>
                  </motion.div>
                  <motion.div className="flex justify-between items-center mb-2" variants={childVariants}>
                    <span className="text-gray-300">Ghế</span>
                    <span className="text-gray-300">{ticketDetail.seats.join(", ")}</span>
                  </motion.div>
                  <motion.div className="flex justify-between items-center mb-2" variants={childVariants}>
                    <span className="text-red-400">Còn {Math.floor(timer / 60)} phút chọn</span>
                    <span className="text-gray-300">{ticketDetail.seats.length} vé</span>
                  </motion.div>
                  <motion.div className="flex justify-between items-center" variants={childVariants}>
                    <span className="text-lg font-semibold">Thành tiền</span>
                    <span className="text-lg font-semibold">{parseInt(ticketDetail.price).toLocaleString()} đ</span>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div className="flex justify-between items-center mb-2" variants={childVariants}>
                    <span className="text-red-400">Còn {Math.floor(timer / 60)} phút chọn</span>
                    <span className="text-gray-300">{seatCount} vé</span>
                  </motion.div>
                  <motion.div className="flex justify-between items-center" variants={childVariants}>
                    <span className="text-lg font-semibold">Thành tiền</span>
                    <span className="text-lg font-semibold">{parseInt(totalPrice).toLocaleString()} đ</span>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Nút Thanh Toán */}
          <motion.button
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-500 transition-all cursor-pointer"
            onClick={handlePayButton}
            disabled={loading}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {loading ? "Đang xử lý..." : "Thanh Toán"}
          </motion.button>

          {/* Footer trong nội dung */}
          <motion.div
            className="flex justify-between items-center mt-6 text-sm text-gray-400"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/VnPay_Logo.png/800px-VnPay_Logo.png"
              alt="VNPay"
              className="w-12"
              variants={childVariants}
            />
            <motion.div className="flex items-center" variants={childVariants}>
              <span className="mr-2">© 2023-24. All rights reserved by PayGuru</span>
              <img
                src="https://dummyimage.com/50x20/000/fff&text=PayGuru"
                alt="PayGuru"
                className="w-12"
              />
            </motion.div>
          </motion.div>

          {/* Hiển thị lỗi hoặc thông báo nếu có */}
          {error && (
            <motion.p
              className="text-center text-red-400 text-sm mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Modal hiển thị mã QR */}
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="bg-gray-800 p-6 rounded-lg text-white w-[400px] max-w-[90%] relative"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            style={{ pointerEvents: "auto" }}
          >
            <h4 className="text-lg font-semibold mb-4 text-center">Quét mã QR để thanh toán</h4>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-48 h-48 mx-auto rounded-md"
              onError={() => setError("Không tải được mã QR. Vui lòng thử lại!")}
            />
            <p className="text-sm text-gray-400 mt-4 text-center">
              Vui lòng quét mã QR bằng ứng dụng ngân hàng của bạn để thực hiện thanh toán.
            </p>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Số tiền: {parseInt(totalPrice).toLocaleString()} đ
            </p>
            <motion.button
              className="mt-6 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all cursor-pointer"
              onClick={closeModal}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Đóng
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Modal "Vui lòng hoàn tất thanh toán" */}
      {isWaitingModalOpen && paymentStatus === "PENDING" && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="bg-gray-800 p-8 rounded-xl text-white w-[400px] max-w-[90%] relative shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            style={{ pointerEvents: "auto" }}
          >
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 360] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <svg
                className="w-16 h-16 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            <h4 className="text-2xl font-bold text-center mb-4">Vui lòng hoàn tất thanh toán</h4>
            <p className="text-center text-gray-200">
              Vui lòng hoàn tất thanh toán trên tab VNPay vừa mở. Hệ thống sẽ tự động kiểm tra trạng thái.
            </p>
            <motion.div
              className="mt-6 flex justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <svg
                className="w-8 h-8 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal "Đã hoàn tất thanh toán" */}
      {isSuccessModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="bg-gray-800 p-8 rounded-xl text-white w-[400px] max-w-[90%] relative shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            style={{ pointerEvents: "auto" }}
          >
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 360] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <svg
                className="w-16 h-16 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h4 className="text-2xl font-bold text-center mb-4">Đã hoàn tất thanh toán!</h4>
            <p className="text-center text-gray-200">
              Cảm ơn bạn đã đặt vé. Nhấn nút bên dưới để quay lại trang chi tiết phim.
            </p>
            <motion.button
              className="mt-6 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Nút được nhấp, filmId:", filmId);
                handleReturnToMovieDetail();
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              style={{ pointerEvents: "auto" }}
            >
              Quay lại trang chi tiết phim
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </motion.div>
  );
};

export default PaymentPage;