import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Footer from "../components/footer";

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

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  hover: {
    scale: 1.05,
    y: -10,
    boxShadow: "0px 10px 20px rgba(255, 0, 0, 0.2)",
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hover: {
    scale: 1.1,
    backgroundColor: "#b91c1c",
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
};

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    username: "",
    email: "",
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("account");
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // Scroll-based parallax effect
  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 500], [0.3, 0.7]);
  const cardScale = useTransform(scrollY, [0, 200], [1, 1.05]);

  useEffect(() => {
    const headerTimer = setTimeout(() => setHeaderVisible(true), 200);
    const contentTimer = setTimeout(() => setContentVisible(true), 400);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://localhost:8080/api/account/getMyAccountInformation", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      }
      if (!response.ok) {
        throw new Error("Không thể lấy thông tin tài khoản.");
      }

      const data = await response.json();
      setUserData({
        fullName: data.fullname || "Chưa cập nhật",
        phoneNumber: data.phoneNumber || "Chưa cập nhật",
        address: data.address || "Chưa cập nhật",
        username: data.username || "Chưa cập nhật",
        email: data.email || "Chưa cập nhật",
      });
    } catch (error) {
      setError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
      alert("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://localhost:8080/api/booking/all", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      }
      if (!response.ok) {
        throw new Error("Không thể lấy lịch sử đặt vé.");
      }

      const data = await response.json();
      const bookedTickets = data.filter((booking) => booking.status === "BOOKED");
      setBookings(bookedTickets);
    } catch (error) {
      setError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "account") {
      fetchUserData(); // Gọi API khi chuyển sang tab "Tài khoản của tôi"
    } else if (activeTab === "history") {
      fetchBookingHistory(); // Gọi API khi chuyển sang tab "Lịch sử mua vé"
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value || "" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");

      const response = await fetch("https://localhost:8080/api/account/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
        }),
      });

      if (response.status === 401) {
        throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      }
      if (!response.ok) {
        throw new Error("Cập nhật thất bại!");
      }

      alert("Cập nhật thành công!");
    } catch (error) {
      setError(error.message);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const parseCreateAtDate = (createAt) => {
    try {
      const isoDateString = createAt.replace(" ", "T") + "+07:00";
      const parsedDate = new Date(isoDateString);
      if (isNaN(parsedDate.getTime())) {
        return new Date().toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          dateStyle: "short",
          timeStyle: "short",
        });
      }
      return parsedDate.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch (error) {
      return new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        dateStyle: "short",
        timeStyle: "short",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-gray-900 text-white pt-20"
      style={{ background: `radial-gradient(circle, rgba(20, 20, 20, ${backgroundOpacity.get()}), rgba(14, 14, 16, 1))` }}
    >
      <motion.main
        className="flex-grow max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg"
        style={{ scale: cardScale }}
        initial="hidden"
        animate={contentVisible ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <motion.h2
          className="text-2xl font-bold text-center mb-6"
          initial="hidden"
          animate={headerVisible ? "visible" : "hidden"}
          variants={childVariants}
        >
          Thông tin cá nhân
        </motion.h2>

        <motion.div
          className="flex justify-center mb-6 space-x-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            className={`px-4 py-2 rounded ${activeTab === "account" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => {
              console.log("Switching to account tab");
              setActiveTab("account");
            }}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Tài khoản của tôi
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded ${activeTab === "history" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => {
              console.log("Switching to history tab");
              setActiveTab("history");
            }}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Lịch sử mua vé
          </motion.button>
        </motion.div>

        {error && (
          <motion.p
            className="text-red-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        )}

        <div>
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              variants={containerVariants}
            >
              <div>
                {[
                  { label: "Họ và Tên *", name: "fullName", disabled: false },
                  { label: "Số điện thoại *", name: "phoneNumber", disabled: false },
                  { label: "Địa chỉ", name: "address", disabled: false },
                  { label: "Tên đăng nhập", name: "username", disabled: true },
                  { label: "Email", name: "email", disabled: true },
                ].map((field, index) => (
                  <motion.div key={field.name} className="mt-4" variants={childVariants}>
                    <label className="block text-gray-300">{field.label}</label>
                    <input
                      name={field.name}
                      value={userData[field.name]}
                      onChange={handleChange}
                      className={`w-full p-2 rounded ${
                        field.disabled ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-gray-700 text-white"
                      }`}
                      disabled={field.disabled}
                    />
                  </motion.div>
                ))}
                <motion.div
                  className="mt-6 flex justify-between"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.button
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Đổi mật khẩu
                  </motion.button>
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {saving ? "Đang lưu..." : "Lưu thông tin"}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-center mb-4">Lịch sử mua vé</h3>
              {bookings.length === 0 ? (
                <motion.p
                  className="text-gray-300 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Bạn chưa có vé nào được xác nhận.
                </motion.p>
              ) : (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {bookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      className="p-4 bg-gray-700 rounded-lg shadow cursor-pointer hover:bg-gray-600 relative overflow-hidden"
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="relative z-10">
                        <div className="flex justify-between">
                          <h4 className="text-lg font-semibold">{booking.filmName}</h4>
                          <span
                            className={`text-sm ${booking.status === "BOOKED" ? "text-green-400" : "text-red-400"}`}
                          >
                            {booking.status === "BOOKED" ? "Đã xác nhận" : "Đã hủy"}
                          </span>
                        </div>
                        <p className="text-gray-300">Phòng chiếu: {booking.hallName}</p>
                        <p className="text-gray-300">
                          Thời gian chiếu:{" "}
                          {new Date(booking.startingTime).toLocaleString("vi-VN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                        <p className="text-gray-300">Ghế: {booking.seats.join(", ")}</p>
                        <p className="text-gray-300">Tổng tiền: {booking.price.toLocaleString()} VNĐ</p>
                        <p className="text-gray-400 text-sm">
                          Ngày đặt: {parseCreateAtDate(booking.createAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </motion.main>

      <Footer />
    </motion.div>
  );
};

export default ProfilePage;