import React, { useState, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { toast } from "react-toastify";

// Constants
const API_ENDPOINTS = {
  CREATE: "https://localhost:8080/api/payment/create",
  STATUS: (id) => `https://localhost:8080/api/payment/status/${id}`,
};
const ANIMATION_DELAYS = { HEADER: 200, CONTENT: 400 };
const COUNTDOWN_DURATION = 600; // 10 minutes
const POLLING_INTERVAL = 8000; // 8 seconds

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.05, backgroundColor: "#c2410c" },
  tap: { scale: 0.95 },
};

const paymentMethodVariants = {
  selected: { scale: 1.05, borderColor: "#f97316" },
  unselected: { scale: 1, borderColor: "#4b5563" },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

// Skeleton component
const PaymentSkeleton = () => (
  <div className="min-h-screen bg-[#0e0e10] flex flex-col items-center justify-center">
    <div className="animate-pulse bg-gray-900 p-6 rounded-lg w-full max-w-md">
      <div className="h-8 bg-gray-700 rounded mb-6"></div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="h-12 bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
      </div>
      <div className="h-48 bg-gray-700 rounded mb-6"></div>
      <div className="h-12 bg-gray-700 rounded"></div>
    </div>
  </div>
);

// Custom hooks
const useCountdown = (duration, onTimeout) => {
  const [timer, setTimer] = useState(duration);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(countdown);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [onTimeout]);

  return { timer, formatted: `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}` };
};

const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handlePayment = useCallback(
    async ({ bookingId, paymentType, setQrCodeUrl, setVnpayUrl, setTicketDetail, setPaymentId, setIsModalOpen, setIsWaitingModalOpen }) => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Vui lòng đăng nhập để thanh toán!");
        if (!bookingId || bookingId.trim() === "") throw new Error("bookingID không hợp lệ.");

        const response = await axios.post(
          API_ENDPOINTS.CREATE,
          { bookingID: bookingId, paymentType },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        const { paymentUrl, ticketDetail, id } = response.data;
        if (!paymentUrl) throw new Error("Không nhận được paymentUrl từ server!");

        setTicketDetail(ticketDetail);
        setPaymentId(id);

        if (paymentType === "VNPAY") {
          setVnpayUrl(paymentUrl);
          const newTab = window.open(paymentUrl, "_blank");
          if (newTab) {
            setIsWaitingModalOpen(true);
          } else {
            throw new Error("Trình duyệt chặn tab mới. Vui lòng cho phép popup.");
          }
        } else {
          setQrCodeUrl(paymentUrl);
          setIsModalOpen(true);
          setError("Vui lòng quét mã QR để thanh toán. Hệ thống sẽ xác nhận trong 5-10 phút.");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/login", { state: { error: "Phiên đăng nhập hết hạn." } });
        } else {
          setError(error.message || "Thanh toán thất bại. Vui lòng thử lại!");
          toast.error(error.message || "Thanh toán thất bại!");
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  return { loading, error, setError, handlePayment };
};

const usePaymentStatus = (paymentId, isWaitingModalOpen, setIsWaitingModalOpen, setIsSuccessModalOpen, setFilmId) => {
  const navigate = useNavigate();

  useEffect(() => {
    let pollingInterval;
    if (isWaitingModalOpen && paymentId) {
      pollingInterval = setInterval(async () => {
        try {
          const response = await axios.get(API_ENDPOINTS.STATUS(paymentId), {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          });
          const { status, filmId, message } = response.data;

          if (status === "APPROVED" && filmId) {
            clearInterval(pollingInterval);
            setIsWaitingModalOpen(false);
            setFilmId(filmId);
            setIsSuccessModalOpen(true);
          } else if (status !== "PENDING") {
            clearInterval(pollingInterval);
            setIsWaitingModalOpen(false);
            toast.error(message || "Thanh toán không thành công.");
          }
        } catch (error) {
          clearInterval(pollingInterval);
          setIsWaitingModalOpen(false);
          if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            navigate("/login", { state: { error: "Phiên đăng nhập hết hạn." } });
          } else {
            toast.error("Lỗi khi kiểm tra trạng thái thanh toán.");
          }
        }
      }, POLLING_INTERVAL);
    }
    return () => clearInterval(pollingInterval);
  }, [paymentId, isWaitingModalOpen, setIsWaitingModalOpen, setIsSuccessModalOpen, setFilmId, navigate]);
};

// Modal components
const QRModal = memo(({ isOpen, onClose, qrCodeUrl, totalPrice }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-labelledby="qr-modal"
      >
        <motion.div
          className="bg-gray-800 p-6 rounded-lg text-white w-[400px] max-w-[90%]"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
        >
          <h4 id="qr-modal" className="text-lg font-semibold mb-4 text-center">
            Quét mã QR để thanh toán
          </h4>
          <img
            src={qrCodeUrl}
            alt="Mã QR thanh toán"
            className="w-48 h-48 mx-auto rounded-md"
            loading="lazy"
            onError={() => toast.error("Không tải được mã QR.")}
          />
          <p className="text-sm text-gray-400 mt-4 text-center">
            Quét mã QR bằng ứng dụng ngân hàng để thanh toán.
          </p>
          <p className="text-sm text-gray-400 mt-2 text-center">
            Số tiền: {parseInt(totalPrice).toLocaleString()} đ
          </p>
          <motion.button
            className="mt-6 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            onClick={onClose}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Đóng modal QR"
          >
            Đóng
          </motion.button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
));

const WaitingModal = memo(({ isOpen }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-labelledby="waiting-modal"
      >
        <motion.div
          className="bg-gray-800 p-8 rounded-xl text-white w-[400px] max-w-[90%]"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 360] }}
            transition={{ duration: 0.8 }}
          >
            <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h4 id="waiting-modal" className="text-2xl font-bold text-center mb-4">
            Vui lòng hoàn tất thanh toán
          </h4>
          <p className="text-center text-gray-200">
            Hoàn tất thanh toán trên tab VNPay. Hệ thống đang kiểm tra trạng thái...
          </p>
          <motion.div
            className="mt-6 flex justify-center"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  </AnimatePresence>
));

const SuccessModal = memo(({ isOpen, onClose, filmId }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-labelledby="success-modal"
      >
        <motion.div
          className="bg-gray-800 p-8 rounded-xl text-white w-[400px] max-w-[90%]"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 360] }}
            transition={{ duration: 0.8 }}
          >
            <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h4 id="success-modal" className="text-2xl font-bold text-center mb-4">
            Đã hoàn tất thanh toán!
          </h4>
          <p className="text-center text-gray-200">Cảm ơn bạn đã đặt vé.</p>
          <motion.button
            className="mt-6 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            onClick={onClose}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Quay lại trang chi tiết phim"
          >
            Quay lại trang chi tiết phim
          </motion.button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
));

const PaymentPage = memo(({ isLoggedIn, onLogout, onLoginClick, onRegisterClick }) => {
  const { bookingId, totalPrice, seatCount } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [vnpayUrl, setVnpayUrl] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [filmId, setFilmId] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const { loading, error, setError, handlePayment } = usePayment();
  const { timer, formatted: timerFormatted } = useCountdown(COUNTDOWN_DURATION, () => navigate(-1));

  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 500], [0.3, 0.7]);

  usePaymentStatus(paymentId, isWaitingModalOpen, setIsWaitingModalOpen, setIsSuccessModalOpen, setFilmId);

  useEffect(() => {
    const headerTimer = setTimeout(() => setHeaderVisible(true), ANIMATION_DELAYS.HEADER);
    const contentTimer = setTimeout(() => setContentVisible(true), ANIMATION_DELAYS.CONTENT);
    return () => {
      clearTimeout(headerTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const handleSelectVnpay = useCallback(() => {
    setPaymentMethod("VNPAY");
    setError(vnpayUrl ? "Nhấn Thanh Toán để mở tab VNPAY." : null);
  }, [vnpayUrl, setError]);

  const handleSelectBankTransfer = useCallback(() => {
    setPaymentMethod("BANK_TRANSFER");
    setError(qrCodeUrl ? "Nhấn Thanh Toán để hiển thị mã QR." : null);
  }, [qrCodeUrl, setError]);

  const handlePayButton = useCallback(() => {
    if (paymentMethod === "VNPAY" && vnpayUrl) {
      const newTab = window.open(vnpayUrl, "_blank");
      if (newTab) {
        setIsWaitingModalOpen(true);
      } else {
        setError(
          <span>
            Trình duyệt chặn tab mới. Vui lòng{" "}
            <a href={vnpayUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              nhấp vào đây
            </a>{" "}
            để mở trang thanh toán.
          </span>
        );
      }
    } else if (paymentMethod === "BANK_TRANSFER" && qrCodeUrl) {
      setIsModalOpen(true);
    } else {
      handlePayment({
        bookingId,
        paymentType: paymentMethod === "VNPAY" ? "VNPAY" : "QR",
        setQrCodeUrl,
        setVnpayUrl,
        setTicketDetail,
        setPaymentId,
        setIsModalOpen,
        setIsWaitingModalOpen,
      });
    }
  }, [paymentMethod, vnpayUrl, qrCodeUrl, bookingId, handlePayment]);

  const handleReturnToMovieDetail = useCallback(() => {
    setIsSuccessModalOpen(false);
    navigate(filmId ? `/movie/${filmId}` : "/");
  }, [filmId, navigate]);

  if (loading) return <PaymentSkeleton />;

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-[#0e0e10]"
      style={{ background: `radial-gradient(circle, rgba(20, 20, 20, ${backgroundOpacity.get()}), rgba(14, 14, 16, 1))` }}
    >
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 pt-20">
        <motion.div
          className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg max-h-[80vh] overflow-y-auto border border-gray-700"
          initial="hidden"
          animate={contentVisible ? "visible" : "hidden"}
          variants={sectionVariants}
          role="main"
        >
          <motion.div className="flex justify-between items-center mb-6" initial="hidden" animate={headerVisible ? "visible" : "hidden"} variants={childVariants}>
            <h2 className="text-2xl font-bold">Thanh Toán</h2>
            <div className="text-sm text-gray-300">
              {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })},{" "}
              {new Date().toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
            </div>
          </motion.div>

          <motion.div className="mb-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.h3 className="text-lg font-semibold mb-2" variants={childVariants}>
              Phương thức thanh toán
            </motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                className={`flex items-center bg-gray-800 p-3 rounded-lg cursor-pointer border-2 ${
                  paymentMethod === "VNPAY" ? "border-orange-500" : "border-gray-600"
                }`}
                onClick={handleSelectVnpay}
                variants={paymentMethodVariants}
                animate={paymentMethod === "VNPAY" ? "selected" : "unselected"}
                whileHover={{ scale: 1.03 }}
                role="button"
                aria-label="Chọn thanh toán VNPay"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/VnPay_Logo.png/800px-VnPay_Logo.png"
                  alt="Logo VNPay"
                  className="w-8 h-8 mr-3"
                  loading="lazy"
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
                role="button"
                aria-label="Chọn thanh toán chuyển khoản ngân hàng"
              >
                <img
                  src="https://dummyimage.com/32x32/000/fff&text=Bank"
                  alt="Logo chuyển khoản ngân hàng"
                  className="w-8 h-8 mr-3"
                  loading="lazy"
                />
                <span>Chuyển khoản ngân hàng</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div className="mb-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.h3 className="text-lg font-semibold mb-2" variants={childVariants}>
              Vé xem phim
            </motion.h3>
            <motion.div className="bg-gray-800 p-4 rounded-lg" variants={childVariants} whileHover={{ scale: 1.02 }}>
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
                    <span className="text-red-400">Còn {timerFormatted}</span>
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
                    <span className="text-red-400">Còn {timerFormatted}</span>
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

          <motion.button
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-500"
            onClick={handlePayButton}
            disabled={loading}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Thực hiện thanh toán"
          >
            {loading ? "Đang xử lý..." : "Thanh Toán"}
          </motion.button>

          <motion.div
            className="flex justify-between items-center mt-6 text-sm text-gray-400"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/VnPay_Logo.png/800px-VnPay_Logo.png"
              alt="Logo VNPay"
              className="w-12"
              variants={childVariants}
              loading="lazy"
            />
            <motion.div className="flex items-center" variants={childVariants}>
              <span className="mr-2">© 2023-24. All rights reserved by PayGuru</span>
              <img src="https://dummyimage.com/50x20/000/fff&text=PayGuru" alt="Logo PayGuru" className="w-12" loading="lazy" />
            </motion.div>
          </motion.div>

          {error && (
            <motion.p
              className="text-center text-red-400 text-sm mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>

      <QRModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} qrCodeUrl={qrCodeUrl} totalPrice={totalPrice} />
      <WaitingModal isOpen={isWaitingModalOpen} />
      <SuccessModal isOpen={isSuccessModalOpen} onClose={handleReturnToMovieDetail} filmId={filmId} />

      <Footer />
    </motion.div>
  );
});

export default PaymentPage;