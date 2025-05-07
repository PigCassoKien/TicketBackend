import { useState, useEffect } from "react";
import { X, Trash, Edit } from "lucide-react";
import { getAllHalls, createHall, updateHall, deleteHall } from "../../api/hallApi";
import axios from "axios";

const HallSeatsModal = ({ hall, isOpen, onClose }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && hall?.id) {
      fetchSeats();
    }
  }, [isOpen, hall]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken"); // Hoặc lấy từ context/state
      const response = await axios.get(`https://ticketcinema-backend.onrender.com/api/hall/${hall.id}/seats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const seatsData = response.data || [];
      setSeats(seatsData);
    } catch (err) {
      setError("Không thể tải danh sách ghế. Vui lòng thử lại!");
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập
        }, 2000);
      }
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Nhóm ghế theo hàng dựa trên ký tự đầu của tên ghế (A, B, C, ...)
  const groupedSeats = seats.reduce((acc, seat) => {
    const row = seat.name.charAt(0); // Lấy ký tự đầu (A, B, C, ...)
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
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold mb-4">Danh sách ghế - Phòng chiếu {hall.name}</h2>
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
                      ${seat.seatType === "VIP" ? "bg-orange-500" : "bg-gray-300 text-black"}`}
                  >
                    {seat.name} {/* Hiển thị A1, A2, B1, ... */}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 px-4 py-2 bg-gray-800 rounded flex justify-around text-center text-sm">
          <p className="text-orange-400">
            <span className="inline-block w-4 h-4 mr-1 bg-orange-500 rounded"></span>
            VIP
          </p>
          <p className="text-gray-300">
            <span className="inline-block w-4 h-4 mr-1 bg-gray-300 rounded"></span>
            Thường
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

const ManageHalls = () => {
  const [halls, setHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSeatsModalOpen, setIsSeatsModalOpen] = useState(false); // Thêm state cho modal ghế
  const [hallToDelete, setHallToDelete] = useState(null);
  const [hallToEdit, setHallToEdit] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null); // Hall được chọn để xem ghế
  const [newHall, setNewHall] = useState({
    hallName: "",
    totalRow: 0,
    totalCol: 0,
  });

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const hallsData = await getAllHalls();
        setHalls(hallsData);
        setFilteredHalls(hallsData);
      } catch (err) {
        setError(err.message || "Không thể lấy danh sách phòng chiếu. Vui lòng thử lại.");
        console.error("Error fetching halls:", err);
        if (err.message.includes("Phiên đăng nhập đã hết hạn")) {
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        }
      }
    };

    fetchHalls();
  }, []);

  const handleSearch = () => {
    if (!searchTerm) {
      setFilteredHalls(halls);
      return;
    }

    const filtered = halls.filter((hall) =>
      hall.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHalls(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddHall = async () => {
    const totalRow = parseInt(newHall.totalRow);
    const totalCol = parseInt(newHall.totalCol);

    if (!newHall.hallName || newHall.hallName.trim() === "") {
      setError("Tên phòng chiếu không được để trống.");
      return;
    }
    if (isNaN(totalRow) || totalRow <= 10) {
      setError("Số hàng phải là số nguyên lớn hơn 10.");
      return;
    }
    if (isNaN(totalCol) || totalCol <= 10) {
      setError("Số cột phải là số nguyên lớn hơn 10.");
      return;
    }

    try {
      const hallData = {
        hallName: newHall.hallName,
        totalRow: totalRow,
        totalCol: totalCol,
      };
      const response = await createHall(hallData);
      if (response.message === "Hall created successfully") {
        const updatedHalls = await getAllHalls();
        setHalls(updatedHalls);
        setFilteredHalls(updatedHalls);
        setIsAddModalOpen(false);
        setNewHall({ hallName: "", totalRow: 0, totalCol: 0 });
        alert("Thêm phòng chiếu thành công!");
      }
    } catch (err) {
      setError(err.message || "Không thể thêm phòng chiếu. Vui lòng thử lại.");
      console.error("Error adding hall:", err);
      if (err.message.includes("Phiên đăng nhập đã hết hạn")) {
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    }
  };

  const handleUpdateHall = async () => {
    const totalRow = parseInt(newHall.totalRow);
    const totalCol = parseInt(newHall.totalCol);

    if (!newHall.hallName || newHall.hallName.trim() === "") {
      setError("Tên phòng chiếu không được để trống.");
      return;
    }
    if (isNaN(totalRow) || totalRow <= 10) {
      setError("Số hàng phải là số nguyên lớn hơn 10.");
      return;
    }
    if (isNaN(totalCol) || totalCol <= 10) {
      setError("Số cột phải là số nguyên lớn hơn 10.");
      return;
    }

    try {
      const hallData = {
        hallName: newHall.hallName,
        totalRow: totalRow,
        totalCol: totalCol,
      };
      const response = await updateHall(hallToEdit.id, hallData);
      if (response.message === "Hall and seats updated successfully") {
        const updatedHalls = await getAllHalls();
        setHalls(updatedHalls);
        setFilteredHalls(updatedHalls);
        setIsEditModalOpen(false);
        setNewHall({ hallName: "", totalRow: 0, totalCol: 0 });
        alert("Cập nhật phòng chiếu thành công!");
      }
    } catch (err) {
      setError(err.message || "Không thể cập nhật phòng chiếu. Vui lòng thử lại.");
      console.error("Error updating hall:", err);
      if (err.message.includes("Phiên đăng nhập đã hết hạn")) {
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    }
  };

  const handleDeleteHall = async () => {
    if (!hallToDelete) return;

    try {
      const response = await deleteHall(hallToDelete);
      if (response.message === "Hall deleted successfully") {
        const updatedHalls = halls.filter((hall) => hall.id !== hallToDelete);
        setHalls(updatedHalls);
        setFilteredHalls(updatedHalls);
        setIsDeleteModalOpen(false);
        setHallToDelete(null);
        alert("Xóa phòng chiếu thành công!");
      }
    } catch (err) {
      setError(err.message || "Không thể xóa phòng chiếu. Vui lòng thử lại.");
      console.error("Error deleting hall:", err);
      if (err.message.includes("Phiên đăng nhập đã hết hạn")) {
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm phòng chiếu theo tên..."
          value={searchTerm}
          onChange={handleSearchChange}
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
          Thêm phòng chiếu
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
              <th className="p-3 text-left">Tên phòng chiếu</th>
              <th className="p-3 text-left">Số hàng</th>
              <th className="p-3 text-left">Số cột</th>
              <th className="p-3 text-left">Tổng số ghế</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredHalls.map((hall) => (
              <tr
                key={hall.id}
                className="border-b border-gray-700 hover:bg-gray-800"
              >
                <td className="p-3">
                  <button
                    onClick={() => {
                      setSelectedHall(hall);
                      setIsSeatsModalOpen(true);
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    {hall.name}
                  </button>
                </td>
                <td className="p-3">{hall.totalRow}</td>
                <td className="p-3">{hall.totalCol}</td>
                <td className="p-3">{hall.totalRow * hall.totalCol}</td>
                <td className="p-3 flex gap-2 items-center">
                  <button
                    onClick={() => {
                      setHallToEdit(hall);
                      setNewHall({
                        hallName: hall.name,
                        totalRow: hall.totalRow,
                        totalCol: hall.totalCol,
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setHallToDelete(hall.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg text-white shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Thêm phòng chiếu mới</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Tên phòng chiếu"
                value={newHall.hallName}
                onChange={(e) =>
                  setNewHall({ ...newHall, hallName: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="number"
                placeholder="Số hàng (tối thiểu 11)"
                value={newHall.totalRow}
                min="11"
                onChange={(e) =>
                  setNewHall({ ...newHall, totalRow: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="number"
                placeholder="Số cột (tối thiểu 11)"
                value={newHall.totalCol}
                min="11"
                onChange={(e) =>
                  setNewHall({ ...newHall, totalCol: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleAddHall}
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
              <h3 className="text-lg font-semibold">Chỉnh sửa phòng chiếu</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Tên phòng chiếu"
                value={newHall.hallName}
                onChange={(e) =>
                  setNewHall({ ...newHall, hallName: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="number"
                placeholder="Số hàng (tối thiểu 11)"
                value={newHall.totalRow}
                min="11"
                onChange={(e) =>
                  setNewHall({ ...newHall, totalRow: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="number"
                placeholder="Số cột (tối thiểu 11)"
                value={newHall.totalCol}
                min="11"
                onChange={(e) =>
                  setNewHall({ ...newHall, totalCol: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleUpdateHall}
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
              Bạn có chắc chắn muốn xóa phòng chiếu này?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteHall}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                Có, xóa
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setHallToDelete(null);
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
        <HallSeatsModal
          hall={selectedHall}
          isOpen={isSeatsModalOpen}
          onClose={() => setIsSeatsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ManageHalls;