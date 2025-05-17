import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import axios from "axios";
import Footer from "../components/footer";
import { toast } from "react-toastify";

// Constants
const API_ENDPOINTS = {
  USER: "https://localhost:8080/api/account/getMyAccountInformation",
  BOOKINGS: "https://localhost:8080/api/booking/all",
  UPDATE_PROFILE: "https://localhost:8080/api/account/update-profile",
};

const ANIMATION_DELAYS = {
  HEADER: 200,
  CONTENT: 400,
};

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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: "0px 8px 16px rgba(255, 0, 0, 0.2)",
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.05, backgroundColor: "#b91c1c" },
  tap: { scale: 0.95 },
};

// Skeleton component
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <div className="animate-pulse max-w-3xl w-full p-6">
      <div className="h-8 bg-gray-700 rounded mb-6"></div>
      <div className="flex justify-center space-x-4 mb-6">
        <div className="h-10 bg-gray-700 rounded w-32"></div>
        <div className="h-10 bg-gray-700 rounded w-32"></div>
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

// Custom hook for profile data
const useProfile = (activeTab) => {
  const [userData, setUserData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    username: "",
    email: "",
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (url, setter, filter) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
    }

    try {
      setLoading(true);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      }

      const data = filter ? response.data.filter(filter) : response.data;
      setter(data);
      setError("");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "account") {
      fetchData(API_ENDPOINTS.USER, (data) => {
        setUserData({
          fullName: data.fullname || "Chưa cập nhật",
          phoneNumber: data.phoneNumber || "Chưa cập nhật",
          address: data.address || "Chưa cập nhật",
          username: data.username || "Chưa cập nhật",
          email: data.email || "Chưa cập nhật",
        });
      });
    } else if (activeTab === "history") {
      fetchData(API_ENDPOINTS.BOOKINGS, setBookings, (booking) => booking.status === "BOOKED");
    }
  }, [activeTab, fetchData]);

  return { userData, setUserData, bookings, loading, error };
};

// Parse date utility
const parseCreateAtDate = (createAt) => {
  try {
    const isoDateString = createAt.replace(" ", "T") + "+07:00";
    const parsedDate = new Date(isoDateString);
    return isNaN(parsedDate.getTime())
      ? new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" })
      : parsedDate.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" });
  } catch {
    return new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" });
  }
};

const ProfilePage = memo(() => {
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const { userData, setUserData, bookings, loading, error } = useProfile(activeTab);

  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 500], [0.3, 0.7]);

  useEffect(() => {
    const headerTimer = setTimeout(() => setHeaderVisible(true), ANIMATION_DELAYS.HEADER);
    const contentTimer = setTimeout(() => setContentVisible(true), ANIMATION_DELAYS.CONTENT);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value || "" }));
  }, [setUserData]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");

      await axios.put(
        API_ENDPOINTS.UPDATE_PROFILE,
        {
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Cập nhật thành công!");
    } catch (err) {
      setSaving(false);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }, [userData]);

  if (loading) return <ProfileSkeleton />;

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-gray-900 text-white pt-16"
      style={{ background: `radial-gradient(circle, rgba(20, 20, 20, ${backgroundOpacity.get()}), rgba(14, 14, 16, 1))` }}
    >
      <motion.main
        className="flex-grow max-w-3xl mx-auto p-4 sm:p-6 bg-gray-800 rounded-lg shadow-lg"
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
          role="tablist"
        >
          {[
            { id: "account", label: "Tài khoản của tôi" },
            { id: "history", label: "Lịch sử mua vé" },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              className={`px-4 py-2 rounded ${activeTab === tab.id ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
              onClick={() => setActiveTab(tab.id)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {error && (
          <motion.p
            className="text-red-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            role="alert"
          >
            {error}
            <button
              onClick={() => setActiveTab(activeTab)}
              className="ml-2 text-white underline"
            >
              Thử lại
            </button>
          </motion.p>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              id="panel-account"
              role="tabpanel"
            >
              {[
                { label: "Họ và Tên *", name: "fullName", disabled: false },
                { label: "Số điện thoại *", name: "phoneNumber", disabled: false },
                { label: "Địa chỉ", name: "address", disabled: false },
                { label: "Tên đăng nhập", name: "username", disabled: true },
                { label: "Email", name: "email", disabled: true },
              ].map((field) => (
                <motion.div key={field.name} className="mt-4" variants={childVariants}>
                  <label htmlFor={field.name} className="block text-gray-300">{field.label}</label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={userData[field.name]}
                    onChange={handleChange}
                    className={`w-full p-2 rounded ${
                      field.disabled ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-gray-700 text-white"
                    }`}
                    disabled={field.disabled}
                    aria-required={!field.disabled}
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
                  aria-label="Đổi mật khẩu"
                >
                  Đổi mật khẩu
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Lưu thông tin"
                >
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              id="panel-history"
              role="tabpanel"
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
                <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                  {bookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      className="p-4 bg-gray-700 rounded-lg shadow relative"
                      variants={cardVariants}
                      whileHover="hover"
                    >
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
                      <p className="text-gray-400 text-sm">Ngày đặt: {parseCreateAtDate(booking.createAt)}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
      <Footer />
    </motion.div>
  );
});

export default ProfilePage;