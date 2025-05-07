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
  const [searchResults, setSearchResults] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filmToDelete, setFilmToDelete] = useState(null);
  const [filmToEdit, setFilmToEdit] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [newFilm, setNewFilm] = useState({
    title: "",
    description: "",
    durationInMinutes: 0,
    language: "",
    releaseDate: "",
    country: "",
    categories: [],
    image: null,
    largeImage: null,
    trailer: "",
    actors: [],
    status: "UPCOMING",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const statusOptions = ["PLAYING", "UPCOMING"];
  const navbarHeight = 80; // Tăng chiều cao để hạ trang xuống thêm (từ 60px lên 80px)

  // Gộp trạng thái modal để tối ưu
  const isAnyModalOpen = isAddModalOpen || isEditModalOpen || isDeleteModalOpen || isDetailModalOpen;

  // Khóa cuộn trang khi modal mở
  useEffect(() => {
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAnyModalOpen]);

  // Tính toán vị trí modal khi mở, cộng thêm chiều cao navbar
  useEffect(() => {
    if (isAnyModalOpen) {
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight + 50;
      const viewportWidth = window.innerWidth;
      const modalTop = scrollY + viewportHeight / 2 + navbarHeight - 100; // Cộng thêm chiều cao navbar
      const modalLeft = viewportWidth / 2;
      setModalPosition({ top: modalTop, left: modalLeft });
    }
  }, [isAnyModalOpen]);

  const makeAuthenticatedRequest = async (config) => {
    let token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found in localStorage. Redirecting to login.");
      alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục!");
      window.location.href = "/login";
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
        console.warn("Unauthorized request. Attempting to refresh token...");
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(
              "https://ticketcinemaweb.onrender.com/api/auth/refresh-token",
              { refreshToken }
            );
            const newAccessToken = refreshResponse.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);
            const retryConfig = {
              ...config,
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
                ...config.headers,
              },
            };
            const retryResponse = await axios(retryConfig);
            return retryResponse;
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError.response?.data || refreshError.message);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            window.location.href = "/login";
            return null;
          }
        } else {
          console.error("No refresh token available. Redirecting to login.");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("refreshToken");
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          window.location.href = "/login";
          return null;
        }
      }
      throw error;
    }
  };

  useEffect(() => {
    const fetchAllFilms = async () => {
      try {
        const playingFilmsData = await getMoviesByStatus("PLAYING");
        if (Array.isArray(playingFilmsData)) {
          const playingFilmsWithStatus = playingFilmsData.map((film) => ({
            ...film,
            status: "PLAYING",
          }));
          setPlayingFilms(playingFilmsWithStatus);
          setFilteredPlayingFilms(playingFilmsWithStatus);
        } else {
          console.warn("Playing films data is not an array:", playingFilmsData);
          setPlayingFilms([]);
          setFilteredPlayingFilms([]);
        }

        const upcomingFilmsData = await getMoviesByStatus("UPCOMING");
        if (Array.isArray(upcomingFilmsData)) {
          const upcomingFilmsWithStatus = upcomingFilmsData.map((film) => ({
            ...film,
            status: "UPCOMING",
          }));
          setUpcomingFilms(upcomingFilmsWithStatus);
          setFilteredUpcomingFilms(upcomingFilmsWithStatus);
        } else {
          console.warn("Upcoming films data is not an array:", upcomingFilmsData);
          setUpcomingFilms([]);
          setFilteredUpcomingFilms([]);
        }
      } catch (error) {
        console.error("Failed to fetch films:", error);
        alert("Không thể tải danh sách phim!");
      }
    };

    fetchAllFilms();
  }, []);

  const handleSearch = async () => {
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) {
      setSearchResults([]);
      setFilteredPlayingFilms(playingFilms);
      setFilteredUpcomingFilms(upcomingFilms);
      return;
    }

    const isValidPrefix = /^[a-zA-Z0-9\s]+$/.test(trimmedSearchTerm);
    if (!isValidPrefix) {
      alert("Từ khóa tìm kiếm chỉ được chứa chữ cái, số và khoảng trắng!");
      return;
    }

    try {
      const response = await axios.get(
        `https://ticketcinemaweb.onrender.com/api/film/searchFilmsByPrefix?prefix=${encodeURIComponent(trimmedSearchTerm)}&pageNumber=0&pageSize=50`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const searchedFilms = Array.isArray(response.data) ? response.data : [];
      console.log("Searched films:", searchedFilms);

      if (searchedFilms.length === 0) {
        alert("Không tìm thấy phim nào khớp với từ khóa!");
        setSearchResults([]);
        return;
      }

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

      setSearchResults(normalizedFilms);
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
      if (file.type !== "image/jpeg") {
        setErrorMessage("Vui lòng chọn file ảnh định dạng JPEG!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Kích thước file ảnh không được vượt quá 5MB!");
        return;
      }
      setErrorMessage("");
      setNewFilm((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const validateFilmData = (film) => {
    if (!film.title.trim()) {
      setErrorMessage("Tên phim không được để trống!");
      return false;
    }
    if (film.durationInMinutes <= 0) {
      setErrorMessage("Thời lượng phim phải lớn hơn 0!");
      return false;
    }
    if (!film.releaseDate) {
      setErrorMessage("Ngày phát hành không được để trống!");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleAddFilm = async () => {
    if (!validateFilmData(newFilm)) return;

    const formData = new FormData();
    formData.append("title", newFilm.title);
    formData.append("description", newFilm.description);
    formData.append("durationInMins", newFilm.durationInMinutes);
    formData.append("language", newFilm.language);
    formData.append("releaseDate", newFilm.releaseDate);
    formData.append("country", newFilm.country);
    formData.append("categories", newFilm.categories.join(","));
    formData.append("trailer", newFilm.trailer);
    formData.append("actors", newFilm.actors.join(","));
    if (newFilm.image) formData.append("image", newFilm.image);
    if (newFilm.largeImage) formData.append("largeImage", newFilm.largeImage);

    try {
      const response = await makeAuthenticatedRequest({
        method: "POST",
        url: "https://ticketcinemaweb.onrender.com/api/film/addFilm",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.status === 200 && response.data) {
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
          durationInMinutes: 0,
          language: "",
          releaseDate: "",
          country: "",
          categories: [],
          image: null,
          largeImage: null,
          trailer: "",
          actors: [],
          status: "UPCOMING",
        });
        alert("Thêm phim thành công!");
      } else {
        throw new Error("Phản hồi từ API không hợp lệ!");
      }
    } catch (error) {
      console.error("Failed to add film:", error.response?.data || error.message);
      alert("Thêm phim thất bại: " + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateFilm = async () => {
    if (!validateFilmData(newFilm)) return;

    const formData = new FormData();
    formData.append("title", newFilm.title);
    formData.append("description", newFilm.description);
    formData.append("durationInMinutes", newFilm.durationInMinutes);
    formData.append("language", newFilm.language);
    formData.append("releaseDate", newFilm.releaseDate);
    formData.append("country", newFilm.country);
    formData.append("categories", newFilm.categories.join(","));
    formData.append("trailer", newFilm.trailer);
    formData.append("actors", newFilm.actors.join(","));
    const validStatus = statusOptions.includes(newFilm.status) ? newFilm.status : "UPCOMING";
    formData.append("status", validStatus);

    if (newFilm.image) formData.append("image", newFilm.image);
    if (newFilm.largeImage) formData.append("largeImage", newFilm.largeImage);

    try {
      const response = await makeAuthenticatedRequest({
        method: "PUT",
        url: `https://ticketcinemaweb.onrender.com/api/film/updateFilm/${filmToEdit.id}`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.status === 200 && response.data) {
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
        setSearchResults(searchResults.map((film) =>
          film.id === filmToEdit.id ? updatedFilm : film
        ));
        setIsEditModalOpen(false);
        setNewFilm({
          title: "",
          description: "",
          durationInMinutes: 0,
          language: "",
          releaseDate: "",
          country: "",
          categories: [],
          image: null,
          largeImage: null,
          trailer: "",
          actors: [],
          status: "UPCOMING",
        });
        alert("Cập nhật phim thành công!");
      } else {
        throw new Error("Phản hồi từ API không hợp lệ!");
      }
    } catch (error) {
      console.error("Failed to update film:", error.response?.data || error.message);
      alert("Cập nhật phim thất bại: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteFilm = async () => {
    if (!filmToDelete) return;

    try {
      const response = await makeAuthenticatedRequest({
        method: "DELETE",
        url: `https://ticketcinemaweb.onrender.com/api/film/remove/${filmToDelete}`,
      });

      if (response?.status === 200) {
        setPlayingFilms(playingFilms.filter((film) => film.id !== filmToDelete));
        setFilteredPlayingFilms(filteredPlayingFilms.filter((film) => film.id !== filmToDelete));
        setUpcomingFilms(upcomingFilms.filter((film) => film.id !== filmToDelete));
        setFilteredUpcomingFilms(filteredUpcomingFilms.filter((film) => film.id !== filmToDelete));
        setSearchResults(searchResults.filter((film) => film.id !== filmToDelete));
        setIsDeleteModalOpen(false);
        setFilmToDelete(null);
        alert("Xóa phim thành công!");
      } else {
        throw new Error("Phản hồi từ API không hợp lệ!");
      }
    } catch (error) {
      console.error("Failed to delete film:", error.response?.data || error.message);
      alert("Xóa phim thất bại: " + (error.response?.data?.message || error.message));
    }
  };

  const handleShowFilmDetails = (film) => {
    setSelectedFilm(film);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = (setModalOpen) => {
    const hasChanges = Object.values(newFilm).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (value instanceof File) return true;
      return value !== "" && value !== 0;
    });

    if (hasChanges && !confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng không?")) {
      return;
    }

    setModalOpen(false);
    setNewFilm({
      title: "",
      description: "",
      durationInMinutes: 0,
      language: "",
      releaseDate: "",
      country: "",
      categories: [],
      image: null,
      largeImage: null,
      trailer: "",
      actors: [],
      status: "UPCOMING",
    });
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white p-6 relative pt-[80px]">
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
                    <td className="p-3">{film.categories?.join(", ") || "N/A"}</td>
                    <td className="p-3">{film.status}</td>
                    <td className="p-3 flex gap-2 items-center">
                      <button
                        onClick={() => {
                          setFilmToEdit(film);
                          setNewFilm({
                            title: film.title || "",
                            description: film.description || "",
                            durationInMinutes: film.durationInMinutes || 0,
                            language: film.language || "",
                            releaseDate: film.releaseDate || "",
                            country: film.country || "",
                            categories: film.categories || [],
                            image: null,
                            largeImage: null,
                            trailer: film.trailer || "",
                            actors: film.actors || [],
                            status: film.status || "UPCOMING",
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
                      <td className="p-3">{film.categories?.join(", ") || "N/A"}</td>
                      <td className="p-3">{film.status}</td>
                      <td className="p-3 flex gap-2 items-center">
                        <button
                          onClick={() => {
                            setFilmToEdit(film);
                            setNewFilm({
                              title: film.title || "",
                              description: film.description || "",
                              durationInMinutes: film.durationInMinutes || 0,
                              language: film.language || "",
                              releaseDate: film.releaseDate || "",
                              country: film.country || "",
                              categories: film.categories || [],
                              image: null,
                              largeImage: null,
                              trailer: film.trailer || "",
                              actors: film.actors || [],
                              status: film.status || "UPCOMING",
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
                      <td className="p-3">{film.categories?.join(", ") || "N/A"}</td>
                      <td className="p-3">{film.status}</td>
                      <td className="p-3 flex gap-2 items-center">
                        <button
                          onClick={() => {
                            setFilmToEdit(film);
                            setNewFilm({
                              title: film.title || "",
                              description: film.description || "",
                              durationInMinutes: film.durationInMinutes || 0,
                              language: film.language || "",
                              releaseDate: film.releaseDate || "",
                              country: film.country || "",
                              categories: film.categories || [],
                              image: null,
                              largeImage: null,
                              trailer: film.trailer || "",
                              actors: film.actors || [],
                              status: film.status || "UPCOMING",
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

      {isAddModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50">
          <div
            className="bg-gray-800 p-6 rounded-lg text-white shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto"
            style={{
              position: "absolute",
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Thêm phim mới</h3>
              <button onClick={() => handleCloseModal(setIsAddModalOpen)}>
                <X size={20} />
              </button>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-xs mb-2">{errorMessage}</p>
            )}
            <div className="space-y-2">
              <div>
                <label className="block mb-1 text-xs font-medium">Tên phim:</label>
                <input
                  type="text"
                  placeholder="Tên phim"
                  value={newFilm.title}
                  onChange={(e) => setNewFilm({ ...newFilm, title: e.target.value })}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium">Mô tả:</label>
                <textarea
                  placeholder="Mô tả"
                  value={newFilm.description}
                  onChange={(e) => setNewFilm({ ...newFilm, description: e.target.value })}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs h-24 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">Thời lượng (phút):</label>
                  <input
                    type="number"
                    placeholder="Thời lượng (phút)"
                    value={newFilm.durationInMinutes}
                    onChange={(e) => setNewFilm({ ...newFilm, durationInMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium">Ngôn ngữ:</label>
                  <input
                    type="text"
                    placeholder="Ngôn ngữ"
                    value={newFilm.language}
                    onChange={(e) => setNewFilm({ ...newFilm, language: e.target.value })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">Ngày phát hành:</label>
                  <input
                    type="date"
                    value={newFilm.releaseDate}
                    onChange={(e) => setNewFilm({ ...newFilm, releaseDate: e.target.value })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium">Quốc gia:</label>
                  <input
                    type="text"
                    placeholder="Quốc gia"
                    value={newFilm.country}
                    onChange={(e) => setNewFilm({ ...newFilm, country: e.target.value })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium">Thể loại (cách nhau bởi dấu phẩy):</label>
                <input
                  type="text"
                  placeholder="Thể loại (cách nhau bởi dấu phẩy)"
                  value={newFilm.categories.join(", ")}
                  onChange={(e) => setNewFilm({ ...newFilm, categories: e.target.value.split(",").map(item => item.trim()).filter(item => item) })}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium">Link trailer:</label>
                <input
                  type="text"
                  placeholder="Link trailer"
                  value={newFilm.trailer}
                  onChange={(e) => setNewFilm({ ...newFilm, trailer: e.target.value })}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium">Diễn viên (cách nhau bởi dấu phẩy):</label>
                <input
                  type="text"
                  placeholder="Diễn viên (cách nhau bởi dấu phẩy)"
                  value={newFilm.actors.join(", ")}
                  onChange={(e) => setNewFilm({ ...newFilm, actors: e.target.value.split(",").map(item => item.trim()).filter(item => item) })}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">Ảnh nhỏ (image):</label>
                  <input
                    type="file"
                    accept="image/jpeg"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium">Ảnh lớn (largeImage):</label>
                  <input
                    type="file"
                    accept="image/jpeg"
                    onChange={(e) => handleFileChange(e, "largeImage")}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleAddFilm}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-xs"
              >
                Thêm
              </button>
              <button
                onClick={() => handleCloseModal(setIsAddModalOpen)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-xs"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50">
          <div
            className="bg-gray-800 p-6 rounded-lg text-white shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto"
            style={{
              position: "absolute",
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Chỉnh sửa phim</h3>
              <button onClick={() => handleCloseModal(setIsEditModalOpen)}>
                <X size={20} />
              </button>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-xs mb-2">{errorMessage}</p>
            )}
            <div className="space-y-2">
              <div>
                <label className="block mb-1 text-xs font-medium">Tên phim:</label>
                <input
                  type="text"
                  placeholder="Tên phim"
                  value={newFilm.title}
                  onChange={(e) => setNewFilm({ ...newFilm, title: e.target.value })}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium">Mô tả:</label>
                <textarea
                  placeholder="Mô tả"
                  value={newFilm.description}
                  onChange={(e) => setNewFilm({ ...newFilm, description: e.target.value })}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs h-24 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">Thời lượng (phút):</label>
                  <input
                    type="number"
                    placeholder="Thời lượng (phút)"
                    value={newFilm.durationInMinutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewFilm({
                        ...newFilm,
                        durationInMinutes: value ? parseInt(value) : newFilm.durationInMinutes,
                      });
                    }}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium">Ngôn ngữ:</label>
                  <input
                    type="text"
                    placeholder="Ngôn ngữ"
                    value={newFilm.language}
                    onChange={(e) => setNewFilm({ ...newFilm, language: e.target.value })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">Ngày phát hành:</label>
                  <input
                    type="date"
                    value={newFilm.releaseDate}
                    onChange={(e) => setNewFilm({ ...newFilm, releaseDate: e.target.value })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium">Quốc gia:</label>
                  <input
                    type="text"
                    placeholder="Quốc gia"
                    value={newFilm.country}
                    onChange={(e) => setNewFilm({ ...newFilm, country: e.target.value })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium">Thể loại (cách nhau bởi dấu phẩy):</label>
                <input
                  type="text"
                  placeholder="Thể loại (cách nhau bởi dấu phẩy)"
                  value={newFilm.categories.join(", ")}
                  onChange={(e) => setNewFilm({ ...newFilm, categories: e.target.value.split(",").map(item => item.trim()).filter(item => item) })}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">Link trailer:</label>
                  <input
                    type="text"
                    placeholder="Link trailer"
                    value={newFilm.trailer}
                    onChange={(e) => setNewFilm({ ...newFilm, trailer: e.target.value })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium">Trạng thái:</label>
                  <select
                    value={newFilm.status}
                    onChange={(e) => setNewFilm({ ...newFilm, status: e.target.value })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium">Diễn viên (cách nhau bởi dấu phẩy):</label>
                <input
                  type="text"
                  placeholder="Diễn viên (cách nhau bởi dấu phẩy)"
                  value={newFilm.actors.join(", ")}
                  onChange={(e) => setNewFilm({ ...newFilm, actors: e.target.value.split(",").map(item => item.trim()).filter(item => item) })}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">Ảnh nhỏ (image):</label>
                  <input
                    type="file"
                    accept="image/jpeg"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium">Ảnh lớn (largeImage):</label>
                  <input
                    type="file"
                    accept="image/jpeg"
                    onChange={(e) => handleFileChange(e, "largeImage")}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleUpdateFilm}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-xs"
              >
                Cập nhật
              </button>
              <button
                onClick={() => handleCloseModal(setIsEditModalOpen)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-xs"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50">
          <div
            className="bg-gray-800 p-6 rounded-lg text-white text-center shadow-lg w-full max-w-xs max-h-[80vh] overflow-y-auto"
            style={{
              position: "absolute",
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4">
              Bạn có chắc chắn muốn xóa phim này?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteFilm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-xs"
              >
                Có, xóa
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setFilmToDelete(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-xs"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedFilm && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50">
          <div
            className="bg-gray-800 p-6 rounded-lg text-white shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            style={{
              position: "absolute",
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chi tiết phim: {selectedFilm.title}</h3>
              <button onClick={() => setIsDetailModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <strong className="text-xs">Tên phim:</strong>
                <p className="break-words text-xs">{selectedFilm.title}</p>
              </div>
              <div>
                <strong className="text-xs">Mô tả:</strong>
                <p className="break-words text-xs">{selectedFilm.description || "Không có mô tả"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-xs">Thời lượng:</strong>
                  <p className="text-xs">{selectedFilm.durationInMinutes} phút</p>
                </div>
                <div>
                  <strong className="text-xs">Ngôn ngữ:</strong>
                  <p className="text-xs">{selectedFilm.language || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-xs">Ngày phát hành:</strong>
                  <p className="text-xs">{selectedFilm.releaseDate || "N/A"}</p>
                </div>
                <div>
                  <strong className="text-xs">Quốc gia:</strong>
                  <p className="text-xs">{selectedFilm.country || "N/A"}</p>
                </div>
              </div>
              <div>
                <strong className="text-xs">Thể loại:</strong>
                <p className="break-words text-xs">{selectedFilm.categories?.join(", ") || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-xs">Trạng thái:</strong>
                  <p className="text-xs">{selectedFilm.status || "N/A"}</p>
                </div>
                <div>
                  <strong className="text-xs">Trailer:</strong>
                  <p className="text-xs">
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
                </div>
              </div>
              <div>
                <strong className="text-xs">Diễn viên:</strong>
                <p className="break-words text-xs">{selectedFilm.actors?.join(", ") || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-xs">Ảnh nhỏ (image):</strong>
                  {selectedFilm.image ? (
                    <div className="mt-2">
                      <img
                        src={`https://ticketcinemaweb.onrender.com/filmImages/${selectedFilm.image}`}
                        alt={selectedFilm.title}
                        className="w-32 h-48 object-cover rounded-lg"
                        onError={(e) => (e.target.src = "/path/to/fallback-image.jpg")}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">Không có ảnh</p>
                  )}
                </div>
                <div>
                  <strong className="text-xs">Ảnh lớn (largeImage):</strong>
                  {selectedFilm.largeImage ? (
                    <div className="mt-2">
                      <img
                        src={`https://ticketcinemaweb.onrender.com/largeImages/${selectedFilm.largeImage}`}
                        alt={selectedFilm.title}
                        className="w-48 h-32 object-cover rounded-lg"
                        onError={(e) => (e.target.src = "/path/to/fallback-image.jpg")}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">Không có ảnh</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all text-xs"
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