import { useState, useEffect } from "react";
import { X, Trash, Edit } from "lucide-react";
import axios from "axios";
import { getAllFilms } from "../../api/filmApi";

// ShowSeatsModal (giữ nguyên)
const ShowSeatsModal = ({ show, isOpen, onClose }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seatTypePrice, setSeatTypePrice] = useState({ VIP: 0, NORMAL: 0 });

  useEffect(() => {
    if (isOpen && show?.id) {
      fetchSeats();
    }
  }, [isOpen, show]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`http://localhost:8080/api/show/${show.id}/seats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Seats Response:", response.data);
      const seatsData = response.data || [];

      const vipSeats = seatsData.filter((seat) => (seat.seatType || seat.type)?.toUpperCase() === "VIP");
      const normalSeats = seatsData.filter((seat) => (seat.seatType || seat.type)?.toUpperCase() === "NORMAL");

      setSeats(seatsData);
      setSeatTypePrice({
        VIP: vipSeats.length > 0 ? vipSeats[0].price : 0,
        NORMAL: normalSeats.length > 0 ? normalSeats[0].price : 0,
      });
    } catch (err) {
      setError("Không thể tải danh sách ghế. Vui lòng thử lại!");
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => (window.location.href = "/login"), 2000);
      }
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const allSeats = seats.sort((a, b) => {
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
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white transition z-10"
          onClick={onClose}
        >
          ×
        </button>

        {show && (
          <div className="absolute top-4 left-4 text-sm text-gray-300">
            Giờ chiếu: {new Date(show.startTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-lg font-bold mb-4">
            {show?.hallName ? `Phòng chiếu ${show.hallName}` : "Phòng chiếu"}
          </h2>
          <div className="w-full h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-t-lg shadow-lg mb-4"></div>
        </div>

        {loading && <p className="text-center text-blue-400 text-sm">Đang tải ghế...</p>}
        {error && <p className="text-center text-red-400 text-sm">{error}</p>}

        {!loading && !error && (
          <div className="flex flex-col items-center gap-2">
            {Object.keys(groupedSeats).map((row) => (
              <div key={row} className="flex gap-1 justify-center">
                {groupedSeats[row].map((seat) => (
                  <div
                    key={seat.id}
                    className={`p-1 w-8 h-8 text-xs font-bold rounded text-center 
                      ${seat.status.toUpperCase() === "BOOKED" ? "bg-red-500" : (seat.seatType || seat.type)?.toUpperCase() === "VIP" ? "bg-orange-500" : "bg-gray-300 text-black"}`}
                  >
                    {seat.seatIndex}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 px-4 py-2 bg-gray-800 rounded flex justify-around text-center text-sm">
          <p className="text-orange-400">
            <span className="inline-block w-4 h-4 mr-1 bg-orange-500 rounded"></span>
            VIP ({seatTypePrice.VIP.toLocaleString()} VNĐ)
          </p>
          <p className="text-gray-300">
            <span className="inline-block w-4 h-4 mr-1 bg-gray-300 rounded"></span>
            Thường ({seatTypePrice.NORMAL.toLocaleString()} VNĐ)
          </p>
          <p className="text-red-500">
            <span className="inline-block w-4 h-4 mr-1 bg-red-500 rounded"></span>
            Đã đặt
          </p>
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 border rounded bg-gray-700 hover:bg-gray-600 text-sm"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ShowInfoModal (giữ nguyên)
const ShowInfoModal = ({ show, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(null);

  useEffect(() => {
    if (isOpen && show?.id) {
      fetchShowInfo();
    }
  }, [isOpen, show]);

  const fetchShowInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`http://localhost:8080/api/show/${show.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowInfo(response.data);
    } catch (err) {
      setError("Không thể tải thông tin suất chiếu. Vui lòng thử lại!");
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => (window.location.href = "/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-[500px] max-w-full">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white transition z-10"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4">Thông tin suất chiếu</h2>
        {loading && <p className="text-center text-blue-400 text-sm">Đang tải thông tin...</p>}
        {error && <p className="text-center text-red-400 text-sm">{error}</p>}
        {showInfo && !loading && !error && (
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Tên phim:</span> {showInfo.filmName}</p>
            <p><span className="font-semibold">Phòng chiếu:</span> {showInfo.hallName}</p>
            <p><span className="font-semibold">Thời gian bắt đầu:</span> {new Date(showInfo.startTime).toLocaleString()}</p>
            <p><span className="font-semibold">Ghế trống:</span> {showInfo.availableSeats}</p>
          </div>
        )}
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 border rounded bg-gray-700 hover:bg-gray-600 text-sm"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageShowtimes = () => {
  const [shows, setShows] = useState([]);
  const [filteredShows, setFilteredShows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSeatsModalOpen, setIsSeatsModalOpen] = useState(false);
  const [isShowInfoModalOpen, setIsShowInfoModalOpen] = useState(false);
  const [showToDelete, setShowToDelete] = useState(null);
  const [showToEdit, setShowToEdit] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedShowForInfo, setSelectedShowForInfo] = useState(null);
  const [newShow, setNewShow] = useState({
    hallId: "",
    filmId: "",
    startDate: "",
    startTime: "",
  });
  const [halls, setHalls] = useState([]);
  const [films, setFilms] = useState([]);
  const [loadingFilms, setLoadingFilms] = useState(false);

  useEffect(() => {
    fetchShows();
    fetchHallsAndFilms();
  }, []);

  const fetchShows = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:8080/api/show/allShow", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShows(response.data);
      setFilteredShows(response.data);
    } catch (err) {
      setError("Không thể lấy danh sách suất chiếu. Vui lòng thử lại.");
      if (err.response?.status === 401) {
        setTimeout(() => (window.location.href = "/login"), 2000);
      }
    }
  };

  const fetchHallsAndFilms = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setTimeout(() => (window.location.href = "/login"), 2000);
        return;
      }
  
      let hallsData = [];
      let filmsData = [];
  
      try {
        const hallsResponse = await axios.get("http://localhost:8080/api/hall/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        hallsData = hallsResponse.data;
      } catch (hallErr) {
        console.warn("Hall API not available:", hallErr.message);
        setError("Không thể tải danh sách phòng chiếu: " + hallErr.message);
      }
  
      setLoadingFilms(true);
      try {
        filmsData = await getAllFilms(0, 10000);
        if (!filmsData || filmsData.length === 0) {
          console.warn("No films returned from API.");
          setError("Không có phim nào được tìm thấy từ API.");
        }
      } catch (filmErr) {
        console.error("Failed to fetch films:", filmErr.message);
        setError(`Không thể tải danh sách phim: ${filmErr.message}`);
        if (filmErr.message.includes("401")) {
          setError("Phiên đăng nhập hết hạn. Đang chuyển hướng đến trang đăng nhập...");
          setTimeout(() => (window.location.href = "/"), 2000);
        }
      } finally {
        setLoadingFilms(false);
      }
  
      setHalls(hallsData);
      setFilms(filmsData);
    } catch (err) {
      setError("Không thể tải dữ liệu: " + err.message);
    }
  };

  const handleSearch = () => {
    if (!searchTerm) {
      setFilteredShows(shows);
      return;
    }
    const filtered = shows.filter(
      (show) =>
        show.filmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        show.hallName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredShows(filtered);
  };

  const handleAddShow = async () => {
    if (!newShow.hallId || !newShow.filmId || !newShow.startDate || !newShow.startTime) {
      setError("Vui lòng điền đầy đủ thông tin suất chiếu.");
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const combinedDateTime = `${newShow.startDate}T${newShow.startTime}:00`;
      const response = await axios.post(
        "http://localhost:8080/api/show/addShow",
        {
          hallId: newShow.hallId,
          filmId: newShow.filmId, // Fixed typo: changed "fieldId" to "filmId"
          startingTime: combinedDateTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.message === "Show created successfully") {
        fetchShows();
        setIsAddModalOpen(false);
        setNewShow({ hallId: "", filmId: "", startDate: "", startTime: "" });
        alert("Thêm suất chiếu thành công!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể thêm suất chiếu.");
    }
  };
  
  const handleUpdateShow = async () => {
    if (!newShow.hallId || !newShow.filmId || !newShow.startDate || !newShow.startTime) {
      setError("Vui lòng điền đầy đủ thông tin suất chiếu.");
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const combinedDateTime = `${newShow.startDate}T${newShow.startTime}:00`;
      const response = await axios.put(
        `http://localhost:8080/api/show/updateShow/${showToEdit.id}`,
        {
          hallId: newShow.hallId,
          filmId: newShow.filmId,
          startingTime: combinedDateTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.message === "Show updated successfully") {
        fetchShows();
        setIsEditModalOpen(false);
        setNewShow({ hallId: "", filmId: "", startDate: "", startTime: "" });
        alert("Cập nhật suất chiếu thành công!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể cập nhật suất chiếu.");
    }
  };

  const handleDeleteShow = async () => {
    if (!showToDelete) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.delete(`http://localhost:8080/api/show/delete/${showToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.message === "Show and its seats deleted successfully") {
        fetchShows();
        setIsDeleteModalOpen(false);
        setShowToDelete(null);
        alert("Xóa suất chiếu thành công!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể xóa suất chiếu.");
    }
  };

  // Sửa CustomDatePicker để icon không chặn sự kiện click
  const CustomDatePicker = ({ value, onChange }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">Ngày chiếu</label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={onChange}
          className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    hover:border-blue-400 hover:bg-gray-700/70 cursor-pointer 
                    transition-all duration-300 shadow-sm text-sm"
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          📅
        </span>
      </div>
    </div>
  );

  // Sửa CustomTimePicker để icon không chặn sự kiện click
  const CustomTimePicker = ({ value, onChange }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">Giờ chiếu</label>
      <div className="relative">
        <input
          type="time"
          value={value}
          onChange={onChange}
          className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    hover:border-blue-400 hover:bg-gray-700/70 cursor-pointer 
                    transition-all duration-300 shadow-sm text-sm"
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          ⏰
        </span>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Quản lý suất chiếu</h2>
      <div className="mb-6 flex items-center gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm suất chiếu theo phim hoặc phòng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-2 bg-gray-800/80 text-white rounded-lg outline-none"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
        >
          Tìm kiếm
        </button>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
        >
          Thêm suất chiếu
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3 text-left">Phim</th>
              <th className="p-3 text-left">Phòng chiếu</th>
              <th className="p-3 text-left">Thời gian bắt đầu</th>
              <th className="p-3 text-left">Ghế trống</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredShows.length > 0 ? (
              filteredShows.map((show) => (
                <tr key={show.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setSelectedShowForInfo(show);
                        setIsShowInfoModalOpen(true);
                      }}
                      className="text-blue-400 hover:underline"
                    >
                      {show.filmName}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setSelectedShow(show);
                        setIsSeatsModalOpen(true);
                      }}
                      className="text-blue-400 hover:underline"
                    >
                      {show.hallName}
                    </button>
                  </td>
                  <td className="p-3">{new Date(show.startTime).toLocaleString()}</td>
                  <td className="p-3">{show.availableSeats}</td>
                  <td className="p-3 flex gap-2 items-center">
                    <button
                      onClick={() => {
                        setShowToEdit(show);
                        const [date, time] = show.startTime.split("T");
                        setNewShow({
                          hallId: show.hallId,
                          filmId: show.filmId,
                          startDate: date,
                          startTime: time.slice(0, 5),
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setShowToDelete(show.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-3 text-center">Không có suất chiếu nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg text-white shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Thêm suất chiếu mới</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <select
                value={newShow.hallId}
                onChange={(e) => setNewShow({ ...newShow, hallId: e.target.value })}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          hover:border-blue-400 hover:bg-gray-700/70 cursor-pointer 
                          transition-all duration-300 shadow-sm text-sm"
              >
                <option value="">Chọn phòng chiếu</option>
                {halls.map((hall) => (
                  <option key={hall.id} value={hall.id}>{hall.name}</option>
                ))}
              </select>
              <select
                value={newShow.filmId}
                onChange={(e) => setNewShow({ ...newShow, filmId: e.target.value })}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          hover:border-blue-400 hover:bg-gray-700/70 cursor-pointer 
                          transition-all duration-300 shadow-sm text-sm"
                disabled={loadingFilms}
              >
                <option value="">{loadingFilms ? "Đang tải phim..." : "Chọn phim"}</option>
                {films.map((film) => (
                  <option key={film.id} value={film.id}>{film.title}</option>
                ))}
              </select>
              <CustomDatePicker 
                value={newShow.startDate}
                onChange={(e) => setNewShow({ ...newShow, startDate: e.target.value })}
              />
              <CustomTimePicker 
                value={newShow.startTime}
                onChange={(e) => setNewShow({ ...newShow, startTime: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleAddShow}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm"
              >
                Thêm
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-sm"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg text-white shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Chỉnh sửa suất chiếu</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <select
                value={newShow.hallId}
                onChange={(e) => setNewShow({ ...newShow, hallId: e.target.value })}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          hover:border-blue-400 hover:bg-gray-700/70 cursor-pointer 
                          transition-all duration-300 shadow-sm text-sm"
              >
                <option value="">Chọn phòng chiếu</option>
                {halls.map((hall) => (
                  <option key={hall.id} value={hall.id}>{hall.name}</option>
                ))}
              </select>
              <select
                value={newShow.filmId}
                onChange={(e) => setNewShow({ ...newShow, filmId: e.target.value })}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          hover:border-blue-400 hover:bg-gray-700/70 cursor-pointer 
                          transition-all duration-300 shadow-sm text-sm"
                disabled={loadingFilms}
              >
                <option value="">{loadingFilms ? "Đang tải phim..." : "Chọn phim"}</option>
                {films.map((film) => (
                  <option key={film.id} value={film.id}>{film.title}</option>
                ))}
              </select>
              <CustomDatePicker 
                value={newShow.startDate}
                onChange={(e) => setNewShow({ ...newShow, startDate: e.target.value })}
              />
              <CustomTimePicker 
                value={newShow.startTime}
                onChange={(e) => setNewShow({ ...newShow, startTime: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleUpdateShow}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm"
              >
                Cập nhật
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-sm"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-white text-center shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              Bạn có chắc chắn muốn xóa suất chiếu này?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteShow}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                Có, xóa
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setShowToDelete(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isSeatsModalOpen && (
        <ShowSeatsModal
          show={selectedShow}
          isOpen={isSeatsModalOpen}
          onClose={() => setIsSeatsModalOpen(false)}
        />
      )}

      {isShowInfoModalOpen && (
        <ShowInfoModal
          show={selectedShowForInfo}
          isOpen={isShowInfoModalOpen}
          onClose={() => setIsShowInfoModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ManageShowtimes;