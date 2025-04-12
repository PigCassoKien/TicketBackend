import { useState, useEffect } from "react";
import Footer from "../components/Footer";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    username: "",
    email: "",
  });

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
        const response = await fetch("http://localhost:8080/api/account/getMyAccountInformation", {
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
        console.log("📢 Dữ liệu API trả về:", data); // 🔍 Kiểm tra dữ liệu từ API

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value || "" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập!");

      const response = await fetch("http://localhost:8080/api/account/update-profile", {
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

  if (loading) return <p className="text-center text-white mt-10">Đang tải dữ liệu...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white pt-20">
      <main className="flex-grow max-w-3xl mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Thông tin cá nhân</h2>

        <div className="flex justify-center mb-6 space-x-4">
          <button
            className={`px-4 py-2 rounded ${activeTab === "account" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setActiveTab("account")}
          >
            Tài khoản của tôi
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "history" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setActiveTab("history")}
          >
            Lịch sử mua vé
          </button>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {activeTab === "account" ? (
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
              <button className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">Đổi mật khẩu</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
                {saving ? "Đang lưu..." : "Lưu thông tin"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-center mb-4">Lịch sử mua vé</h3>
            <p className="text-gray-300 text-center">Hiển thị danh sách vé đã mua...</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
