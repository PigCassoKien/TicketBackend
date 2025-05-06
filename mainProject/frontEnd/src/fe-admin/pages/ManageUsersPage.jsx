// src/fe-admin/pages/ManageUsersPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { X, MoreVertical, Trash } from "lucide-react";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAdminActionModalOpen, setIsAdminActionModalOpen] = useState(false);
  const [adminAction, setAdminAction] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userForAdminAction, setUserForAdminAction] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const token = localStorage.getItem("accessToken");

  const getUserRole = () => {
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      const roles = decodedToken.roles || [];
      return roles[0]?.replace("ROLE_", "");
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
      return null;
    }
  };

  const userRole = getUserRole();
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await axios.get("https://localhost:8080/api/account/admin/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (err) {
        setError("Không thể lấy danh sách người dùng. Vui lòng thử lại.");
        console.error(err);
      }
    };

    fetchAllUsers();
  }, [token]);

  const handleSearch = async () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    try {
      const response = await axios.get(
        `https://localhost:8080/api/account/admin/search?username=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFilteredUsers(response.data);
    } catch (err) {
      setError("Không thể tìm kiếm người dùng. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewUser = async (username) => {
    try {
      const response = await axios.get(
        `https://localhost:8080/api/account/admin/${username}/information`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedUser(response.data);
      setIsUserModalOpen(true);
    } catch (err) {
      setError("Không thể lấy thông tin người dùng. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`https://localhost:8080/api/account/admin/delete?username=${userToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter((user) => user.username !== userToDelete));
      setFilteredUsers(filteredUsers.filter((user) => user.username !== userToDelete));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      alert("Xóa người dùng thành công!");
    } catch (err) {
      setError("Không thể xóa người dùng. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const handleGiveAdminRole = async () => {
    try {
      const response = await axios.get(
        `https://localhost:8080/api/account/superadmin/giveAdmin?username=${userForAdminAction}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message);
      const updatedUsers = await axios.get("https://localhost:8080/api/account/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(updatedUsers.data);
      setFilteredUsers(updatedUsers.data);
      setIsAdminActionModalOpen(false);
      setUserForAdminAction(null);
      setDropdownOpen(null);
    } catch (err) {
      setError("Không thể trao quyền admin. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const handleRemoveAdminRole = async () => {
    try {
      const response = await axios.get(
        `https://localhost:8080/api/account/superadmin/removeAdmin?username=${userForAdminAction}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message);
      const updatedUsers = await axios.get("https://localhost:8080/api/account/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(updatedUsers.data);
      setFilteredUsers(updatedUsers.data);
      setIsAdminActionModalOpen(false);
      setUserForAdminAction(null);
      setDropdownOpen(null);
    } catch (err) {
      setError("Không thể gỡ quyền admin. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const getHighestRole = (roles) => {
    if (!roles || roles.length === 0) return "Không có vai trò";
    const normalizedRoles = roles.map(role => role.replace("ROLE_", ""));
    if (normalizedRoles.includes("SUPER_ADMIN")) return "SUPER_ADMIN";
    if (normalizedRoles.includes("ADMIN")) return "ADMIN";
    if (normalizedRoles.includes("USER")) return "USER";
    return normalizedRoles[0] || "Không có vai trò";
  };

  const getRowColor = (roles) => {
    const highestRole = getHighestRole(roles);
    if (highestRole === "SUPER_ADMIN") return "text-blue-500";
    if (highestRole === "ADMIN") return "text-green-500";
    return "text-yellow-500";
  };

  const hasAdminRole = (roles) => {
    if (!roles) return false;
    const normalizedRoles = roles.map(role => role.replace("ROLE_", ""));
    return normalizedRoles.includes("ADMIN");
  };

  const getRolePriority = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return 3;
      case "ADMIN":
        return 2;
      case "USER":
        return 1;
      default:
        return 0;
    }
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const roleA = getHighestRole(a.roles);
    const roleB = getHighestRole(b.roles);
    return getRolePriority(roleB) - getRolePriority(roleA);
  });

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>

      <div className="mb-6 flex items-center gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm người dùng theo tên..."
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
              <th className="p-3 text-left">Tên người dùng</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Họ tên</th>
              <th className="p-3 text-left">Vai trò</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => {
              console.log("User roles:", user.roles);
              console.log("Highest role:", getHighestRole(user.roles));
              return (
                <tr
                  key={user.id}
                  className={`border-b border-gray-700 hover:bg-gray-800 ${getRowColor(user.roles)}`}
                >
                  <td className="p-3">
                    <button
                      onClick={() => handleViewUser(user.username)}
                      className="hover:text-red-500 transition-all duration-300"
                    >
                      {user.username}
                    </button>
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.fullname}</td>
                  <td className="p-3">{getHighestRole(user.roles)}</td>
                  <td className="p-3 flex gap-2 items-center">
                    <button
                      onClick={() => {
                        setUserToDelete(user.username);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      <Trash size={16} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setDropdownOpen(dropdownOpen === user.id ? null : user.id)
                        }
                        className="p-2 text-white hover:text-red-500 transition-all duration-300"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {dropdownOpen === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-900/90 text-white rounded-lg shadow-lg overflow-hidden z-10">
                          <button
                            onClick={() => {
                              setUserForAdminAction(user.username);
                              setAdminAction("give");
                              setIsAdminActionModalOpen(true);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-800 transition-all duration-300"
                          >
                            Trao quyền Admin
                          </button>
                          <button
                            onClick={() => {
                              setUserForAdminAction(user.username);
                              setAdminAction("remove");
                              setIsAdminActionModalOpen(true);
                            }}
                            disabled={!hasAdminRole(user.roles)}
                            className={`block w-full text-left px-4 py-2 transition-all duration-300 ${
                              hasAdminRole(user.roles)
                                ? "hover:bg-gray-800"
                                : "text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            Gỡ quyền Admin
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal thông báo không có quyền */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-3 rounded-lg text-white text-center shadow-lg w-[80vw] max-w-[80vw] min-w-[250px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-semibold mb-2">{modalMessage}</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-3 rounded-lg text-white text-center shadow-lg w-[80vw] max-w-[80vw] min-w-[250px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-semibold mb-2">
              Bạn có chắc chắn muốn xóa người dùng {userToDelete}?
            </h3>
            <div className="flex justify-center gap-2">
              <button
                onClick={handleDeleteUser}
                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-xs"
              >
                Có, xóa
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-xs"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận trao/gỡ quyền Admin */}
      {isAdminActionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-3 rounded-lg text-white text-center shadow-lg w-[80vw] max-w-[80vw] min-w-[250px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-semibold mb-2">
              {adminAction === "give"
                ? `Bạn có chắc chắn muốn trao quyền Admin cho người dùng ${userForAdminAction}?`
                : `Bạn có chắc chắn muốn gỡ quyền Admin của người dùng ${userForAdminAction}?`}
            </h3>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  if (!isSuperAdmin) {
                    setModalMessage("Bạn không có quyền làm điều này.");
                    setIsModalOpen(true);
                    setIsAdminActionModalOpen(false);
                    setUserForAdminAction(null);
                    setAdminAction(null);
                    return;
                  }
                  if (adminAction === "give") {
                    handleGiveAdminRole();
                  } else {
                    handleRemoveAdminRole();
                  }
                }}
                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-xs"
              >
                Có
              </button>
              <button
                onClick={() => {
                  setIsAdminActionModalOpen(false);
                  setUserForAdminAction(null);
                  setAdminAction(null);
                }}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-xs"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị thông tin người dùng */}
      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-3 rounded-lg text-white shadow-lg w-[90vw] max-w-[90vw] min-w-[300px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-semibold">Thông tin người dùng</h3>
              <button onClick={() => setIsUserModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1 text-xs">
              <p><strong>Tên người dùng:</strong> {selectedUser.username}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Họ tên:</strong> {selectedUser.fullname}</p>
              <p><strong>Địa chỉ:</strong> {selectedUser.address || "Chưa cập nhật"}</p>
              <p><strong>Số điện thoại:</strong> {selectedUser.phoneNumber || "Chưa cập nhật"}</p>
              <p><strong>Vai trò:</strong> {getHighestRole(selectedUser.roles)}</p>
              <p><strong>Trạng thái:</strong> {selectedUser.status}</p>
              <p><strong>Ngày tạo:</strong> {selectedUser.createAt}</p>
              <p><strong>Ngày cập nhật:</strong> {selectedUser.updateAt}</p>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;