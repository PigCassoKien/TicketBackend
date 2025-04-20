import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import Footer from "../components/footer";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    username: "",
    email: "",
  });

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Bạn chưa đăng nhập!");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://localhost:8443/api/account/getMyAccountInformation", {
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
        console.log("📢 Dữ liệu API trả về:", data);

        setUserData({
          fullName: data.fullname || "Chưa cập nhật",
          phoneNumber: data.phoneNumber || "Chưa cập nhật",
          address: data.address || "Chưa cập nhật",
          username: data.username || "Chưa cập nhật",
          email: data.email || "Chưa cập nhật",
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    console.log("✅ State userData sau khi cập nhật:", userData);
  }, [userData]);

  useEffect(() => {
    if (activeTab === "history") {
      const fetchBookingHistory = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Bạn chưa đăng nhập!");
          return;
        }

        try {
          setLoading(true);
          const response = await fetch("https://localhost:8443/api/booking/all", {
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
          console.log("📢 Lịch sử đặt vé:", data);

          const bookedTickets = data.filter((booking) => booking.status === "BOOKED");
          setBookings(bookedTickets);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchBookingHistory();
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
      if (!token) throw new Error("Bạn chưa đăng nhập!");

      const response = await fetch("https://localhost:8443/api/account/update-profile", {
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
    } finally {
      setSaving(false);
    }
  };

  const fetchBookingDetails = async (bookingId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Bạn chưa đăng nhập!");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://localhost:8443/api/booking/${bookingId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      }
      if (!response.ok) {
        throw new Error(`Không thể lấy thông tin booking: ${response.status}`);
      }

      const data = await response.json();
      console.log("📢 Booking details:", data);
      setSelectedBooking(data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseCreateAtDate = (createAt) => {
    try {
      console.log(`Raw createAt value: ${createAt}`);
      const isoDateString = createAt.replace(" ", "T") + "+07:00";
      const parsedDate = new Date(isoDateString);

      if (isNaN(parsedDate.getTime())) {
        console.error(`Invalid date parsed from createAt: ${createAt}`);
        return new Date().toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          dateStyle: "short",
          timeStyle: "short",
        });
      }

      console.log(`Parsed createAt date: ${parsedDate.toISOString()}`);
      const formattedDate = parsedDate.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        dateStyle: "short",
        timeStyle: "short",
      });
      console.log(`Formatted date for display: ${formattedDate}`);

      return formattedDate;
    } catch (error) {
      console.error(`Error parsing createAt date: ${createAt}`, error);
      return new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        dateStyle: "short",
        timeStyle: "short",
      });
    }
  };

  if (loading) return <p className="text-center text-white mt-10">Đang tải dữ liệu...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white pt-20">
      <main className="flex-grow max-w-3xl mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Thông tin cá nhân</h2>

        <div className="flex justify-center mb-6 space-x-4">
          <motion.button
            className={`px-4 py-2 rounded ${activeTab === "account" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setActiveTab("account")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Tài khoản của tôi
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded ${activeTab === "history" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setActiveTab("history")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Lịch sử mua vé
          </motion.button>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <AnimatePresence mode="wait">
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <div className="mt-4">
                  <label className="block text-gray-300">Họ và Tên *</label>
                  <input
                    name="fullName"
                    value={userData.fullName}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-300">Số điện thoại *</label>
                  <input
                    name="phoneNumber"
                    value={userData.phoneNumber}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-300">Địa chỉ</label>
                  <input
                    name="address"
                    value={userData.address}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-gray-300">Tên đăng nhập</label>
                    <input
                      name="username"
                      value={userData.username}
                      className="w-full p-2 rounded bg-gray-600 text-gray-400 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300">Email</label>
                    <input
                      name="email"
                      value={userData.email}
                      className="w-full p-2 rounded bg-gray-600 text-gray-400 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <motion.button
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    Đổi mật khẩu
                  </motion.button>
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {saving ? "Đang lưu..." : "Lưu thông tin"}
                  </motion.button>
                </div>
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
              <div>
                <h3 className="text-xl font-semibold text-center mb-4">Lịch sử mua vé</h3>
                {bookings.length === 0 ? (
                  <p className="text-gray-300 text-center">Bạn chưa có vé nào được xác nhận.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        className="p-4 bg-gray-700 rounded-lg shadow cursor-pointer hover:bg-gray-600"
                        onClick={() => {
                          fetchBookingDetails(booking.id);
                          setShowModal(true);
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
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
                        <p className="text-gray-400 text-sm">
                          Ngày đặt: {parseCreateAtDate(booking.createAt)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showModal && selectedBooking && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-4">{selectedBooking.filmName}</h3>
              <p><strong>Phòng chiếu:</strong> {selectedBooking.hallName}</p>
              <p>
                <strong>Thời gian chiếu:</strong>{" "}
                {new Date(selectedBooking.startingTime).toLocaleString("vi-VN", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
              <p><strong>Ghế:</strong> {selectedBooking.seats.join(", ")}</p>
              <p><strong>Tổng tiền:</strong> {selectedBooking.price.toLocaleString()} VNĐ</p>
              <p><strong>Ngày đặt:</strong> {parseCreateAtDate(selectedBooking.createAt)}</p>
              <p><strong>Trạng thái:</strong> {selectedBooking.status === "BOOKED" ? "Đã xác nhận" : "Đã hủy"}</p>
              <motion.button
                className="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowModal(false)}
              >
                Đóng
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ProfilePage;