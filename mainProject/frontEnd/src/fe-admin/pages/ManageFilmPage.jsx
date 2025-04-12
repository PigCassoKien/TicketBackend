import { useState, useEffect } from "react";
import axios from "axios";
import { X, Trash, Edit } from "lucide-react";
import { getMoviesByStatus } from "../../api/filmApi";

const ManageFilmsPage = () => {
  const [playingFilms, setPlayingFilms] = useState([]);
  const [upcomingFilms, setUpcomingFilms] = useState([]);
  const [filteredPlayingFilms, setFilteredPlayingFilms] = useState([]);
  const [filteredUpcomingFilms, setFilteredUpcomingFilms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Thêm state cho kết quả tìm kiếm
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filmToDelete, setFilmToDelete] = useState(null);
  const [filmToEdit, setFilmToEdit] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [newFilm, setNewFilm] = useState({
    title: "",
    description: "",
    durationInMins: 0,
    language: "",
    releaseDate: "",
    country: "",
    categories: [],
    image: null,
    largeImage: null,
    trailer: "",
    actors: [],
  });

  // Hàm gọi API có xác thực (dùng cho các phương thức cần token)
  const makeAuthenticatedRequest = async (config) => {
    let token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found in localStorage.");
      return null;
    }

    const defaultConfig = {
      ...config,
      headers: {
        Authorization: `Bearer ${token}`,
        ...config.headers,
      },
    };

    try {
      const response = await axios(defaultConfig);
      return response;
    } catch (error) {
      console.error("Request failed:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = "/login";
      }
      return null;
    }
  };

  // Fetch films ban đầu
  useEffect(() => {
    const fetchAllFilms = async () => {
      try {
        const playingFilmsData = await getMoviesByStatus("PLAYING");
        if (playingFilmsData) {
          const playingFilmsWithStatus = playingFilmsData.map((film) => ({
            ...film,
            status: "PLAYING",
          }));
          setPlayingFilms(playingFilmsWithStatus);
          setFilteredPlayingFilms(playingFilmsWithStatus);
        }

        const upcomingFilmsData = await getMoviesByStatus("UPCOMING");
        if (upcomingFilmsData) {
          const upcomingFilmsWithStatus = upcomingFilmsData.map((film) => ({
            ...film,
            status: "UPCOMING",
          }));
          setUpcomingFilms(upcomingFilmsWithStatus);
          setFilteredUpcomingFilms(upcomingFilmsWithStatus);
        }
      } catch (error) {
        console.error("Failed to fetch films:", error);
        alert("Không thể tải danh sách phim!");
      }
    };

    fetchAllFilms();
  }, []);

  // Handle search không cần token
  const handleSearch = async () => {
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) {
      setSearchResults([]); // Reset kết quả tìm kiếm
      setFilteredPlayingFilms(playingFilms);
      setFilteredUpcomingFilms(upcomingFilms);
      return;
    }

    // Kiểm tra ký tự hợp lệ (chỉ chữ cái, số, khoảng trắng)
    const isValidPrefix = /^[a-zA-Z0-9\s]+$/.test(trimmedSearchTerm);
    if (!isValidPrefix) {
      alert("Từ khóa tìm kiếm chỉ được chứa chữ cái, số và khoảng trắng!");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/film/searchFilmsByPrefix?prefix=${encodeURIComponent(trimmedSearchTerm)}&pageNumber=0&pageSize=50`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const searchedFilms = response.data || [];
      console.log("Searched films:", searchedFilms);

      if (searchedFilms.length === 0) {
        alert("Không tìm thấy phim nào khớp với từ khóa!");
        setSearchResults([]);
        return;
      }

      // Chuẩn hóa status trước khi hiển thị
      const normalizeStatus = (status) => {
        if (typeof status === "string") {
          return status.toUpperCase();
        }
        return status;
      };

      const normalizedFilms = searchedFilms.map((film) => ({
        ...film,
        status: normalizeStatus(film.status),
      }));

      setSearchResults(normalizedFilms); // Lưu kết quả tìm kiếm
    } catch (error) {
      console.error("Search failed:", error.response?.status, error.response?.data);
      if (error.response?.status === 400) {
        alert("Từ khóa tìm kiếm không hợp lệ. Vui lòng kiểm tra lại!");
      } else if (error.response?.status === 404) {
        alert("Không tìm thấy phim nào!");
      } else {
        alert("Đã xảy ra lỗi khi tìm kiếm phim: " + (error.response?.data?.message || error.message));
      }
      setSearchResults([]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setNewFilm((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const handleAddFilm = async () => {
    const formData = new FormData();
    formData.append("title", newFilm.title);
    formData.append("description", newFilm.description);
    formData.append("durationInMins", newFilm.durationInMins);
    formData.append("language", newFilm.language);
    formData.append("releaseDate", newFilm.releaseDate);
    formData.append("country", newFilm.country);
    formData.append("categories", newFilm.categories.join(","));
    formData.append("trailer", newFilm.trailer);
    formData.append("actors", newFilm.actors.join(","));
    if (newFilm.image) formData.append("image", newFilm.image);
    if (newFilm.largeImage) formData.append("largeImage", newFilm.largeImage);

    const response = await makeAuthenticatedRequest({
      method: "POST",
      url: "http://localhost:8080/api/film/addFilm",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response && response.data) {
      const newFilmData = { ...response.data, status: response.data.status || "UPCOMING" };
      if (newFilmData.status === "PLAYING") {
        setPlayingFilms([...playingFilms, newFilmData]);
        setFilteredPlayingFilms([...filteredPlayingFilms, newFilmData]);
      } else {
        setUpcomingFilms([...upcomingFilms, newFilmData]);
        setFilteredUpcomingFilms([...filteredUpcomingFilms, newFilmData]);
      }
      setIsAddModalOpen(false);
      setNewFilm({
        title: "",
        description: "",
        durationInMins: 0,
        language: "",
        releaseDate: "",
        country: "",
        categories: [],
        image: null,
        largeImage: null,
        trailer: "",
        actors: [],
      });
      alert("Thêm phim thành công!");
    }
  };

  const handleUpdateFilm = async () => {
    const formData = new FormData();
    formData.append("title", newFilm.title);
    formData.append("description", newFilm.description);
    formData.append("durationInMins", newFilm.durationInMins);
    formData.append("language", newFilm.language);
    formData.append("releaseDate", newFilm.releaseDate);
    formData.append("country", newFilm.country);
    formData.append("categories", newFilm.categories.join(","));
    formData.append("trailer", newFilm.trailer);
    formData.append("actors", newFilm.actors.join(","));
    if (newFilm.image) formData.append("image", newFilm.image);
    if (newFilm.largeImage) formData.append("largeImage", newFilm.largeImage);

    const response = await makeAuthenticatedRequest({
      method: "PUT",
      url: `http://localhost:8080/api/film/updateFilm/${filmToEdit.id}`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response && response.data) {
      const updatedFilm = { ...response.data, status: response.data.status || filmToEdit.status };
      if (updatedFilm.status === "PLAYING") {
        const updatedPlayingFilms = playingFilms.map((film) =>
          film.id === filmToEdit.id ? updatedFilm : film
        );
        setPlayingFilms(updatedPlayingFilms);
        setFilteredPlayingFilms(updatedPlayingFilms);
        setUpcomingFilms(upcomingFilms.filter((film) => film.id !== filmToEdit.id));
        setFilteredUpcomingFilms(filteredUpcomingFilms.filter((film) => film.id !== filmToEdit.id));
      } else {
        const updatedUpcomingFilms = upcomingFilms.map((film) =>
          film.id === filmToEdit.id ? updatedFilm : film
        );
        setUpcomingFilms(updatedUpcomingFilms);
        setFilteredUpcomingFilms(updatedUpcomingFilms);
        setPlayingFilms(playingFilms.filter((film) => film.id !== filmToEdit.id));
        setFilteredPlayingFilms(filteredPlayingFilms.filter((film) => film.id !== filmToEdit.id));
      }
      setIsEditModalOpen(false);
      setNewFilm({
        title: "",
        description: "",
        durationInMins: 0,
        language: "",
        releaseDate: "",
        country: "",
        categories: [],
        image: null,
        largeImage: null,
        trailer: "",
        actors: [],
      });
      alert("Cập nhật phim thành công!");
    }
  };

  const handleDeleteFilm = async () => {
    if (!filmToDelete) return;

    const response = await makeAuthenticatedRequest({
      method: "DELETE",
      url: `http://localhost:8080/api/film/remove/${filmToDelete}`,
    });

    if (response) {
      setPlayingFilms(playingFilms.filter((film) => film.id !== filmToDelete));
      setFilteredPlayingFilms(filteredPlayingFilms.filter((film) => film.id !== filmToDelete));
      setUpcomingFilms(upcomingFilms.filter((film) => film.id !== filmToDelete));
      setFilteredUpcomingFilms(filteredUpcomingFilms.filter((film) => film.id !== filmToDelete));
      setSearchResults(searchResults.filter((film) => film.id !== filmToDelete)); // Cập nhật searchResults
      setIsDeleteModalOpen(false);
      setFilmToDelete(null);
      alert("Xóa phim thành công!");
    }
  };

  const handleShowFilmDetails = (film) => {
    setSelectedFilm(film);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý phim</h1>

      <div className="mb-6 flex items-center gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm phim theo tiền tố tên (VD: 'Aven' cho Avengers)..."
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
          Thêm phim
        </button>
      </div>

      {/* Hiển thị bảng kết quả tìm kiếm nếu có */}
      {searchResults.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Kết quả tìm kiếm</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-3 text-left">Tên phim</th>
                  <th className="p-3 text-left">Thời lượng (phút)</th>
                  <th className="p-3 text-left">Ngôn ngữ</th>
                  <th className="p-3 text-left">Ngày phát hành</th>
                  <th className="p-3 text-left">Quốc gia</th>
                  <th className="p-3 text-left">Thể loại</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((film) => (
                  <tr
                    key={film.id}
                    className="border-b border-gray-700 hover:bg-gray-800"
                  >
                    <td className="p-3">
                      <button
                        onClick={() => handleShowFilmDetails(film)}
                        className="text-blue-400 hover:underline"
                      >
                        {film.title}
                      </button>
                    </td>
                    <td className="p-3">{film.durationInMinutes}</td>
                    <td className="p-3">{film.language}</td>
                    <td className="p-3">{film.releaseDate}</td>
                    <td className="p-3">{film.country}</td>
                    <td className="p-3">{film.categories.join(", ")}</td>
                    <td className="p-3">{film.status}</td>
                    <td className="p-3 flex gap-2 items-center">
                      <button
                        onClick={() => {
                          setFilmToEdit(film);
                          setNewFilm({
                            title: film.title,
                            description: film.description,
                            durationInMins: film.durationInMinutes,
                            language: film.language,
                            releaseDate: film.releaseDate,
                            country: film.country,
                            categories: film.categories,
                            image: null,
                            largeImage: null,
                            trailer: film.trailer,
                            actors: film.actors,
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setFilmToDelete(film.id);
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
        </div>
      )}

      {/* Hiển thị hai bảng ban đầu nếu không có kết quả tìm kiếm */}
      {searchResults.length === 0 && (
        <>
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Phim đang chiếu</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-3 text-left">Tên phim</th>
                    <th className="p-3 text-left">Thời lượng (phút)</th>
                    <th className="p-3 text-left">Ngôn ngữ</th>
                    <th className="p-3 text-left">Ngày phát hành</th>
                    <th className="p-3 text-left">Quốc gia</th>
                    <th className="p-3 text-left">Thể loại</th>
                    <th className="p-3 text-left">Trạng thái</th>
                    <th className="p-3 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayingFilms.map((film) => (
                    <tr
                      key={film.id}
                      className="border-b border-gray-700 hover:bg-gray-800"
                    >
                      <td className="p-3">
                        <button
                          onClick={() => handleShowFilmDetails(film)}
                          className="text-blue-400 hover:underline"
                        >
                          {film.title}
                        </button>
                      </td>
                      <td className="p-3">{film.durationInMinutes}</td>
                      <td className="p-3">{film.language}</td>
                      <td className="p-3">{film.releaseDate}</td>
                      <td className="p-3">{film.country}</td>
                      <td className="p-3">{film.categories.join(", ")}</td>
                      <td className="p-3">{film.status}</td>
                      <td className="p-3 flex gap-2 items-center">
                        <button
                          onClick={() => {
                            setFilmToEdit(film);
                            setNewFilm({
                              title: film.title,
                              description: film.description,
                              durationInMins: film.durationInMinutes,
                              language: film.language,
                              releaseDate: film.releaseDate,
                              country: film.country,
                              categories: film.categories,
                              image: null,
                              largeImage: null,
                              trailer: film.trailer,
                              actors: film.actors,
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setFilmToDelete(film.id);
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
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Phim sắp chiếu</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-3 text-left">Tên phim</th>
                    <th className="p-3 text-left">Thời lượng (phút)</th>
                    <th className="p-3 text-left">Ngôn ngữ</th>
                    <th className="p-3 text-left">Ngày phát hành</th>
                    <th className="p-3 text-left">Quốc gia</th>
                    <th className="p-3 text-left">Thể loại</th>
                    <th className="p-3 text-left">Trạng thái</th>
                    <th className="p-3 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUpcomingFilms.map((film) => (
                    <tr
                      key={film.id}
                      className="border-b border-gray-700 hover:bg-gray-800"
                    >
                      <td className="p-3">
                        <button
                          onClick={() => handleShowFilmDetails(film)}
                          className="text-blue-400 hover:underline"
                        >
                          {film.title}
                        </button>
                      </td>
                      <td className="p-3">{film.durationInMinutes}</td>
                      <td className="p-3">{film.language}</td>
                      <td className="p-3">{film.releaseDate}</td>
                      <td className="p-3">{film.country}</td>
                      <td className="p-3">{film.categories.join(", ")}</td>
                      <td className="p-3">{film.status}</td>
                      <td className="p-3 flex gap-2 items-center">
                        <button
                          onClick={() => {
                            setFilmToEdit(film);
                            setNewFilm({
                              title: film.title,
                              description: film.description,
                              durationInMins: film.durationInMinutes,
                              language: film.language,
                              releaseDate: film.releaseDate,
                              country: film.country,
                              categories: film.categories,
                              image: null,
                              largeImage: null,
                              trailer: film.trailer,
                              actors: film.actors,
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setFilmToDelete(film.id);
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
          </div>
        </>
      )}

      {/* Modal thêm phim */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg text-white shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Thêm phim mới</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Tên phim"
                value={newFilm.title}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, title: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <textarea
                placeholder="Mô tả"
                value={newFilm.description}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, description: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm h-20"
              />
              <input
                type="number"
                placeholder="Thời lượng (phút)"
                value={newFilm.durationInMins}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, durationInMins: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Ngôn ngữ"
                value={newFilm.language}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, language: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="date"
                placeholder="Ngày phát hành"
                value={newFilm.releaseDate}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, releaseDate: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Quốc gia"
                value={newFilm.country}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, country: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Thể loại (cách nhau bởi dấu phẩy)"
                value={newFilm.categories.join(",")}
                onChange={(e) =>
                  setNewFilm({
                    ...newFilm,
                    categories: e.target.value.split(","),
                  })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Link trailer"
                value={newFilm.trailer}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, trailer: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Diễn viên (cách nhau bởi dấu phẩy)"
                value={newFilm.actors.join(",")}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, actors: e.target.value.split(",") })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <div>
                <label className="block mb-1 text-sm">Ảnh nhỏ (image):</label>
                <input
                  type="file"
                  accept="image/jpeg"
                  onChange={(e) => handleFileChange(e, "image")}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Ảnh lớn (largeImage):</label>
                <input
                  type="file"
                  accept="image/jpeg"
                  onChange={(e) => handleFileChange(e, "largeImage")}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleAddFilm}
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

      {/* Modal chỉnh sửa phim */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg text-white shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Chỉnh sửa phim</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Tên phim"
                value={newFilm.title}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, title: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <textarea
                placeholder="Mô tả"
                value={newFilm.description}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, description: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm h-20"
              />
              <input
                type="number"
                placeholder="Thời lượng (phút)"
                value={newFilm.durationInMins}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, durationInMins: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Ngôn ngữ"
                value={newFilm.language}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, language: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="date"
                placeholder="Ngày phát hành"
                value={newFilm.releaseDate}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, releaseDate: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Quốc gia"
                value={newFilm.country}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, country: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Thể loại (cách nhau bởi dấu phẩy)"
                value={newFilm.categories.join(",")}
                onChange={(e) =>
                  setNewFilm({
                    ...newFilm,
                    categories: e.target.value.split(","),
                  })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Link trailer"
                value={newFilm.trailer}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, trailer: e.target.value })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Diễn viên (cách nhau bởi dấu phẩy)"
                value={newFilm.actors.join(",")}
                onChange={(e) =>
                  setNewFilm({ ...newFilm, actors: e.target.value.split(",") })
                }
                className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-sm"
              />
              <div>
                <label className="block mb-1 text-sm">Ảnh nhỏ (image):</label>
                <input
                  type="file"
                  accept="image/jpeg"
                  onChange={(e) => handleFileChange(e, "image")}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Ảnh lớn (largeImage):</label>
                <input
                  type="file"
                  accept="image/jpeg"
                  onChange={(e) => handleFileChange(e, "largeImage")}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleUpdateFilm}
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

      {/* Modal xóa phim */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-white text-center shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              Bạn có chắc chắn muốn xóa phim này?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteFilm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                Có, xóa
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setFilmToDelete(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết phim */}
      {isDetailModalOpen && selectedFilm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Chi tiết phim: {selectedFilm.title}</h3>
              <button onClick={() => setIsDetailModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <p>
                <strong>Tên phim:</strong> {selectedFilm.title}
              </p>
              <p>
                <strong>Mô tả:</strong> {selectedFilm.description || "Không có mô tả"}
              </p>
              <p>
                <strong>Thời lượng:</strong> {selectedFilm.durationInMinutes} phút
              </p>
              <p>
                <strong>Ngôn ngữ:</strong> {selectedFilm.language}
              </p>
              <p>
                <strong>Ngày phát hành:</strong> {selectedFilm.releaseDate}
              </p>
              <p>
                <strong>Quốc gia:</strong> {selectedFilm.country}
              </p>
              <p>
                <strong>Thể loại:</strong> {selectedFilm.categories.join(", ")}
              </p>
              <p>
                <strong>Trạng thái:</strong> {selectedFilm.status}
              </p>
              <p>
                <strong>Trailer:</strong>{" "}
                {selectedFilm.trailer ? (
                  <a
                    href={selectedFilm.trailer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Xem trailer
                  </a>
                ) : (
                  "Không có trailer"
                )}
              </p>
              <p>
                <strong>Diễn viên:</strong> {selectedFilm.actors.join(", ")}
              </p>
              <div>
                <strong>Ảnh nhỏ (image):</strong>
                {selectedFilm.image ? (
                  <img
                    src={`http://localhost:8080/filmImages/${selectedFilm.image}`}
                    alt={selectedFilm.title}
                    className="mt-2 w-32 h-48 object-cover rounded-lg"
                  />
                ) : (
                  <p className="text-gray-400">Không có ảnh</p>
                )}
              </div>
              <div>
                <strong>Ảnh lớn (largeImage):</strong>
                {selectedFilm.largeImage ? (
                  <img
                    src={`http://localhost:8080/largeImages/${selectedFilm.largeImage}`}
                    alt={selectedFilm.title}
                    className="mt-2 w-48 h-32 object-cover rounded-lg"
                  />
                ) : (
                  <p className="text-gray-400">Không có ảnh</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
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

export default ManageFilmsPage;