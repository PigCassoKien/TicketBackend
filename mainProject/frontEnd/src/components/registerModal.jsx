import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import OtpModal from "./otpModal"; // Import component nhập OTP

const RegisterModal = ({ isOpen, onClose, switchToLogin }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Lưu thông báo lỗi

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    setErrorMessage(""); // Reset lỗi nếu có

    try {
      const response = await fetch("https://ticketcinema-backend.onrender.com/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: `${formData.firstName} ${formData.lastName}`,
          username: formData.username,
          phoneNumber: formData.phone,
          email: formData.email,
          password: formData.password,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      setIsOtpOpen(true); // Mở modal nhập OTP
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (isOtpOpen) {
    return <OtpModal isOpen={isOtpOpen} onClose={onClose} email={formData.email} />;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-96 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Đăng ký</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            ✕
          </button>
        </div>

        {errorMessage && <p className="text-red-400 text-center">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              name="firstName"
              placeholder="Họ"
              onChange={handleChange}
              className="w-1/2 p-2 bg-gray-800 rounded"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Tên"
              onChange={handleChange}
              className="w-1/2 p-2 bg-gray-800 rounded"
              required
            />
          </div>
          <input
            type="text"
            name="username"
            placeholder="Tên tài khoản"
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded"
            required
          />
          <div className="flex gap-2">
            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              onChange={handleChange}
              className="w-1/2 p-2 bg-gray-800 rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Email"
              onChange={handleChange}
              className="w-1/2 p-2 bg-gray-800 rounded"
              required
            />
          </div>
          <input
            type="text"
            name="address"
            placeholder="Địa chỉ"
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 rounded pr-10"
              required
            />
            <span
              className="absolute right-3 top-2 cursor-pointer text-gray-400"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 rounded pr-10"
              required
            />
            <span
              className="absolute right-3 top-2 cursor-pointer text-gray-400"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 p-2 rounded text-white font-bold hover:bg-red-600 transition"
          >
            Đăng ký
          </button>
        </form>

        <p className="text-center text-gray-400 mt-3">
          Bạn đã có tài khoản?{" "}
          <span className="text-red-500 cursor-pointer hover:underline" onClick={switchToLogin}>
            Đăng nhập
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
