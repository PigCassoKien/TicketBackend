import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

const LoginModal = ({ isOpen, onClose, switchToRegister, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.username || !formData.password) {
      setErrorMessage("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔍 Gửi yêu cầu đăng nhập với:", formData);
      const response = await axios.post("https://localhost:8443/api/auth/login", formData);
      console.log("📌 Phản hồi từ API:", response.data);

      const { token, refreshToken, username, email, fullName, phoneNumber } = response.data || {};

      if (!token) {
        throw new Error("⚠️ Không tìm thấy token trong phản hồi!");
      }

      // Lưu thông tin vào localStorage
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("phoneNumber", phoneNumber || "");

      setFormData({ username: "", password: "" });
      onLoginSuccess(); // Gọi onLoginSuccess để thông báo đăng nhập thành công
      onClose(); // Đóng modal sau khi đăng nhập thành công
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);

      if (error.response) {
        console.log("📌 Lỗi từ API:", error.response.data);
        const apiError = error.response.data?.message || error.response.data?.error || "⚠️ Sai tài khoản hoặc mật khẩu!";
        setErrorMessage(apiError);
      } else if (error.request) {
        setErrorMessage("⚠️ Không thể kết nối đến server. Kiểm tra mạng!");
      } else {
        setErrorMessage("⚠️ Lỗi không xác định, thử lại sau!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-96 shadow-lg transition-transform transform scale-95">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Đăng nhập</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="username"
            placeholder="Tên tài khoản"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded outline-none focus:ring-2 focus:ring-red-500"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 rounded pr-10 outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <span className="absolute right-3 top-2 cursor-pointer text-gray-400 hover:text-white" onClick={togglePasswordVisibility}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}

          <button
                       type="submit"
                       disabled={isLoading}
                       className="w-full bg-red-500 p-2 rounded text-white font-bold hover:bg-red-600 transition disabled:bg-gray-500"
                     >
                       {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                     </button>
                   </form>
           
                   <p className="text-center text-gray-400 mt-3">
                     Chưa có tài khoản?{" "}
                     <span className="text-red-500 cursor-pointer hover:underline" onClick={switchToRegister}>
                       Đăng ký
                     </span>
                   </p>
                 </div>
               </div>
             );
           };
           
    export default LoginModal;