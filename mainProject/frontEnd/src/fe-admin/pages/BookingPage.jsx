import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/footer.jsx";
import { motion, useScroll, useTransform } from "framer-motion";
import { Edit, X, Filter } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { debounce } from "lodash";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const tableVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

// Format date and time
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr || typeof dateTimeStr !== "string") {
    console.warn("Invalid date/time data:", dateTimeStr);
    return "N/A";
  }
  try {
    const date = new Date(dateTimeStr.replace(" ", "T") + "+07:00");
    return date.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.warn("Error formatting date/time:", dateTimeStr, error);
    return "N/A";
  }
};

// Format date only (for filtering)
const formatDateOnly = (date) => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

// Kiểm tra xem một booking có phải là hàng tiêu đề không
const isHeaderRow = (booking) => {
  return (
    booking.filmName === "Tên Phim" ||
    booking.hallName === "Phòng Chiếu" ||
    booking.startingTime === "Thời Gian Chiếu" ||
    booking.seats?.includes("Ghế") ||
    booking.price === "Giá" ||
    booking.status === "Trạng Thái" ||
    booking.createAt === "Ngày Đặt"
  );
};

const AdminBookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [shows, setShows] = useState([]);
  const [films, setFilms] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [filterShow, setFilterShow] = useState("");
  const [filterFilm, setFilterFilm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedSeats, setUpdatedSeats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Trạng thái sidebar trên mobile
  const tableRef = useRef(null);

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.9]);

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedBooking ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedBooking]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      try {
        const bookingResponse = await fetch("https://localhost:8080/api/booking/get_all", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (bookingResponse.status === 403) throw new Error("Bạn không có quyền truy cập. Chỉ admin mới được phép.");
        if (!bookingResponse.ok) throw new Error(`Lỗi HTTP: ${bookingResponse.status} - ${bookingResponse.statusText}`);
        const bookingData = await bookingResponse.json();
        const filteredData = bookingData.filter((booking) => booking.status !== "CANCELLED");
        const cleanedData = filteredData.filter((booking) => !isHeaderRow(booking));
        setBookings(cleanedData);
        setFilteredBookings(cleanedData);

        try {
          const showResponse = await fetch("https://localhost:8080/api/show/allShow", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!showResponse.ok) throw new Error(`Không thể lấy danh sách suất chiếu: ${showResponse.status}`);
          const showData = await showResponse.json();
          setShows(showData);
        } catch (showError) {
          console.error("Lỗi khi tải danh sách suất chiếu:", showError.message);
          setShows([]);
          setError(showError.message || "Không thể tải danh sách suất chiếu.");
        }

        try {
          const filmResponse = await fetch("https://localhost:8080/api/film/getFilms?pageNumber=0&pageSize=10000", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!filmResponse.ok) throw new Error("Không thể lấy danh sách phim.");
          const filmData = await filmResponse.json();
          setFilms(filmData);
        } catch (filmError) {
          console.warn("Không thể tải danh sách phim:", filmError.message);
          setFilms([]);
        }
      } catch (err) {
        setError(err.message);
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const headerTimer = setTimeout(() => setHeaderVisible(true), 200);
    const contentTimer = setTimeout(() => setContentVisible(true), 400);
    return () => {
      clearTimeout(headerTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  // Filter logic
  useEffect(() => {
    const debouncedFilter = debounce(() => {
      let filtered = bookings;

      if (filterDate) {
        const selectedDateStr = formatDateOnly(filterDate);
        filtered = filtered.filter((booking) => {
          if (!booking.createAt || typeof booking.createAt !== "string") return false;
          try {
            const bookingDate = new Date(booking.createAt.replace(" ", "T")).toISOString().split("T")[0];
            return bookingDate === selectedDateStr;
          } catch (error) {
            console.warn("Invalid createAt data for booking:", booking.id, error);
            return false;
          }
        });
      }

      if (filterShow) {
        filtered = filtered.filter((booking) => booking.showId === filterShow);
      }

      if (filterFilm) {
        filtered = filtered.filter((booking) => booking.filmName === filterFilm);
      }

      setFilteredBookings(filtered);
      setCurrentPage(1);
    }, 300);

    debouncedFilter();
    return () => debouncedFilter.cancel();
  }, [filterDate, filterShow, filterFilm, bookings]);

  // Get shows based on selected date
  const getFilteredShows = useCallback(() => {
    if (!filterDate) return shows;
    const selectedDateStr = formatDateOnly(filterDate);
    return shows.filter((show) => {
      if (!show.startingTime || typeof show.startingTime !== "string") return false;
      try {
        const showDate = new Date(show.startingTime.replace(" ", "T")).toISOString().split("T")[0];
        return showDate === selectedDateStr;
      } catch (error) {
        console.warn("Invalid startingTime data for show:", show.id, error);
        return false;
      }
    });
  }, [filterDate, shows]);

  // Show booking details
  const handleShowDetails = async (booking) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`https://localhost:8080/api/booking/${booking.id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Không thể lấy chi tiết booking: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const detailedBooking = await response.json();
      setSelectedBooking(detailedBooking);
      setUpdatedSeats(detailedBooking.seats || []);
      setEditMode(false);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết booking:", err);
      setError(err.message);
    }
  };

  // Update booking (chỉ thay đổi ghế)
  const handleUpdateBooking = async (bookingId) => {
    if (!updatedSeats || updatedSeats.length === 0 || updatedSeats.some((seat) => !seat.trim())) {
      setError("Vui lòng nhập ít nhất một ghế hợp lệ (ví dụ: A1, A2).");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`https://localhost:8080/api/booking/${bookingId}/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seatIndex: updatedSeats,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          throw new Error("Một hoặc nhiều ghế đã được đặt: " + errorData.message);
        } else if (response.status === 404) {
          throw new Error("Ghế hoặc booking không tồn tại: " + errorData.message);
        }
        throw new Error(`Không thể cập nhật booking: ${errorData.message || response.statusText}`);
      }

      alert("Cập nhật ghế thành công!");
      setEditMode(false);
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, seats: updatedSeats } : b)));
      setFilteredBookings(filteredBookings.map((b) => (b.id === bookingId ? { ...b, seats: updatedSeats } : b)));
      setSelectedBooking(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật booking:", err);
      setError(err.message);
    }
  };

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full"
        />
        <p className="ml-4 text-sm">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <div className="space-x-4">
            <motion.button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Thử lại
            </motion.button>
            <Link to="/login" className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 text-sm">
              Đăng nhập lại
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white relative">
      {/* Header */}
      <motion.header
        style={{ opacity: headerOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: headerVisible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full bg-[#1a1a1d] shadow-lg z-20 p-4"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold">Quản Lý Đặt Vé</h1>
          <button
            className="lg:hidden p-2 bg-gray-700 rounded-lg"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Filter size={20} />
          </button>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row pt-[80px] px-4 sm:px-6">
        {/* Sidebar (Filters) */}
        <motion.aside
          initial="hidden"
          animate={contentVisible ? "visible" : "hidden"}
          variants={sectionVariants}
          className={`lg:w-1/4 w-full lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] bg-[#1a1a1d] p-4 rounded-lg shadow-lg mb-6 lg:mb-0 transition-transform duration-300 ${
            isSidebarOpen ? "block" : "hidden lg:block"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Filter size={18} /> Bộ Lọc
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1 text-sm font-medium">Lọc theo ngày đặt vé:</label>
              <DatePicker
                selected={filterDate}
                onChange={(date) => setFilterDate(date)}
                className="w-full p-2 bg-gray-800/90 text-white rounded-lg outline-none text-sm focus:ring-2 focus:ring-red-500 transition-all"
                wrapperClassName="w-full z-25"
                popperClassName="z-25"
                popperPlacement="right-start"
                popperModifiers={[
                  {
                    name: "preventOverflow",
                    options: {
                      boundariesElement: "viewport",
                      padding: 10,
                    },
                  },
                ]}
                placeholderText="Chọn ngày (VD: 01/01/2025)"
                dateFormat="dd/MM/yyyy"
                isClearable
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1 text-sm font-medium">Lọc theo suất chiếu:</label>
              <select
                value={filterShow}
                onChange={(e) => setFilterShow(e.target.value)}
                className="w-full p-2 bg-gray-800/90 text-white rounded-lg outline-none text-sm focus:ring-2 focus:ring-red-500 transition-all"
                disabled={shows.length === 0 || (filterDate && getFilteredShows().length === 0)}
              >
                <option value="">Chọn suất chiếu</option>
                {getFilteredShows().map((show) => (
                  <option key={show.id} value={show.id}>
                    {`${show.filmName} (${show.hallName})`}
                  </option>
                ))}
              </select>
              {shows.length === 0 && <p className="text-red-500 text-xs mt-1">Không thể tải danh sách suất chiếu.</p>}
              {/* {filterDate && getFilteredShows().length === 0 && shows.length > 0 && (
                <p className="text-red-500 text-xs mt-1">Không có suất chiếu nào trong ngày này.</p>
              )} */}
            </div>

            <div>
              <label className="block text-gray-300 mb-1 text-sm font-medium">Lọc theo phim:</label>
              <select
                value={filterFilm}
                onChange={(e) => setFilterFilm(e.target.value)}
                className="w-full p-2 bg-gray-800/90 text-white rounded-lg outline-none text-sm focus:ring-2 focus:ring-red-500 transition-all"
                disabled={films.length === 0}
              >
                <option value="">Chọn phim</option>
                {films.map((film) => (
                  <option key={film.id} value={film.title || film.name}>
                    {film.title || film.name}
                  </option>
                ))}
              </select>
              {films.length === 0 && <p className="text-red-500 text-xs mt-1">Không thể tải danh sách phim.</p>}
            </div>

            <button
              onClick={() => {
                setFilterDate(null);
                setFilterShow("");
                setFilterFilm("");
              }}
              className="w-full p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-all"
            >
              Xóa Bộ Lọc
            </button>
          </div>
        </motion.aside>

        {/* Main Content (Table) */}
        <motion.main
          initial="hidden"
          animate={contentVisible ? "visible" : "hidden"}
          variants={tableVariants}
          className="lg:w-3/4 w-full p-4 sm:p-6"
        >
          <div className="bg-[#1a1a1d] rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-400 mb-4">Hiển thị {filteredBookings.length} booking</p>
            <div className="relative">
              <div className="sticky top-[80px] bg-[#1a1a1d] z-10">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="p-3 text-left text-sm font-semibold text-gray-200">Tên Phim</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-200">Phòng Chiếu</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-200">Thời Gian Chiếu</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-200">Ghế</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-200">Giá</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-200">Trạng Thái</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-200">Ngày Đặt</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-200">Hành Động</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto border-t border-gray-700">
                <table className="w-full border-collapse">
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems
                        .filter((booking) => (booking.status === "BOOKED" || booking.status === "PENDING") && !isHeaderRow(booking))
                        .map((booking) => (
                          <motion.tr
                            key={booking.id}
                            data-id={booking.id}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="border-b border-gray-700 hover:bg-gray-700/30 transition-all cursor-pointer"
                            onClick={() => handleShowDetails(booking)}
                          >
                            <td className="p-3 text-sm text-gray-200">{booking.filmName || "N/A"}</td>
                            <td className="p-3 text-sm text-gray-200">{booking.hallName || "N/A"}</td>
                            <td className="p-3 text-sm text-gray-200">{booking.startingTime ? formatDateTime(booking.startingTime) : "N/A"}</td>
                            <td className="p-3 text-sm text-gray-200">{booking.seats?.join(", ") || "N/A"}</td>
                            <td className="p-3 text-sm text-gray-200">{booking.price?.toLocaleString("vi-VN") || "0"} VNĐ</td>
                            <td className="p-3 text-sm">
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  booking.status === "BOOKED" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {booking.status || "N/A"}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-200">{booking.createAt ? formatDateTime(booking.createAt) : "N/A"}</td>
                            <td className="p-3 flex gap-2 items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBooking(booking);
                                  setEditMode(true);
                                  setUpdatedSeats(booking.seats || []);
                                }}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm flex items-center justify-center w-8 h-8"
                                data-tooltip-id="edit-tooltip"
                                data-tooltip-content="Chỉnh sửa ghế"
                                disabled={loading}
                              >
                                <Edit size={16} />
                              </button>
                              <Tooltip id="edit-tooltip" />
                            </td>
                          </motion.tr>
                        ))
                    ) : (
                      <tr className="text-center">
                        <td colSpan="8" className="p-4 text-gray-400 text-sm">
                          {filterDate ? "Không có đơn đặt vé nào trong ngày này." : "Không có booking nào."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phân trang */}
            {filteredBookings.length > itemsPerPage && (
              <div className="flex justify-center mt-6 gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-all"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === page ? "bg-red-500 text-white" : "bg-gray-600 text-white hover:bg-gray-700"
                    } transition-all`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-all"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </motion.main>
      </div>

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-[#1a1a1d] p-6 rounded-lg text-white shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chi Tiết Booking: {selectedBooking.id}</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-200">Ghế</label>
                  <input
                    type="text"
                    value={updatedSeats.join(", ")}
                    onChange={(e) => setUpdatedSeats(e.target.value.split(",").map((s) => s.trim()).filter((s) => s))}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Nhập ghế (VD: A1, A2)"
                  />
                </div>
                <div className="flex justify-end gap-3 sticky bottom-0 bg-[#1a1a1d] pt-4">
                  <button
                    onClick={() => handleUpdateBooking(selectedBooking.id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-sm"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-gray-700 pb-4">
                  <h4 className="text-sm font-semibold mb-2 text-gray-200">Thông Tin Booking</h4>
                  <p className="text-sm text-gray-300">
                    <strong>ID Booking:</strong> {selectedBooking.id || "N/A"}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Tên Phim:</strong> {selectedBooking.filmName || "N/A"}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Phòng Chiếu:</strong> {selectedBooking.hallName || "N/A"}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Thời Gian Chiếu:</strong>{" "}
                    {selectedBooking.startingTime ? formatDateTime(selectedBooking.startingTime) : "N/A"}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Ghế:</strong> {selectedBooking.seats?.join(", ") || "N/A"}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Giá:</strong> {selectedBooking.price?.toLocaleString("vi-VN") || "0"} VNĐ
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Trạng Thái:</strong>{" "}
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        selectedBooking.status === "BOOKED" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {selectedBooking.status || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Ngày Đặt:</strong> {selectedBooking.createAt ? formatDateTime(selectedBooking.createAt) : "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-200">Thông Tin Khách Hàng</h4>
                  <p className="text-sm text-gray-300">
                    <strong>Họ Tên:</strong> {selectedBooking.fullname || "Không có thông tin"}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Email:</strong> {selectedBooking.email || "Không có thông tin"}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Số Điện Thoại:</strong> {selectedBooking.phoneNumber || "Không có thông tin"}
                  </p>
                </div>
                <div className="flex justify-end sticky bottom-0 bg-[#1a1a1d] pt-4">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-sm"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminBookingPage;