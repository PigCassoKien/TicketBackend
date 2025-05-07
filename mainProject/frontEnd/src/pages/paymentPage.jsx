import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { motion, useScroll, useTransform } from "framer-motion";

// Hiệu ứng nâng cao
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
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
};

const PaymentPage = ({ isLoggedIn, onLogout, onLoginClick, onRegisterClick }) => {
  const { bookingId, totalPrice, seatCount } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(600);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

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

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Vui lòng đăng nhập để thanh toán!");
        navigate(-1);
        return;
      }

      const paymentRequest = {
        bookingID: bookingId,
        paymentType: "VNPAY",
      };

      const paymentResponse = await axios.post(
        `https://ticketcinema-backend.onrender.com/api/payment/create`,
        paymentRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const paymentUrl = paymentResponse.data.paymentUrl;
      window.location.href = paymentUrl;
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

      <div className="flex-grow flex items-center justify-center p-6">
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
            <motion.div
              className="flex items-center bg-gray-800 p-3 rounded-lg"
              variants={childVariants}
              whileHover={{ scale: 1.02 }}
            >
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
            </motion.div>
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
              <motion.div className="flex justify-between items-center mb-2" variants={childVariants}>
                <span className="text-red-400">Còn {Math.floor(timer / 60)} phút chọn</span>
                <span className="text-gray-300">{seatCount} vé</span>
              </motion.div>
              <motion.div className="flex justify-between items-center" variants={childVariants}>
                <span className="text-lg font-semibold">Thành tiền</span>
                <span className="text-lg font-semibold">{parseInt(totalPrice).toLocaleString()} đ</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Nút Thanh Toán */}
          <motion.button
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-500 transition-all"
            onClick={handlePayment}
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
                src="https://via.placeholder.com/50x20.png?text=PayGuru"
                alt="PayGuru"
                className="w-12"
              />
            </motion.div>
          </motion.div>

          {/* Hiển thị lỗi nếu có */}
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

      <Footer />
    </motion.div>
  );
};

export default PaymentPage;