import { useState, useRef } from "react";
import LoginModal from "./loginModal"; // Import modal đăng nhập

const OtpModal = ({ isOpen, onClose, email }) => {
  if (!isOpen) return null;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoginModalOpen, setLoginModalOpen] = useState(false); // Thêm state mở LoginModal
  const inputRefs = useRef(new Array(6));

  const handleChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, ""); // Chỉ cho phép số
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Chỉ lấy 1 số cuối cùng
    setOtp(newOtp);

    // Chuyển focus sang ô tiếp theo nếu có
    if (index < 5 && value) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (newOtp[index]) {
        newOtp[index] = "";
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      setOtp(newOtp);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join(""); // Gộp chuỗi OTP

    if (enteredOtp.length < 6) {
      setError("Vui lòng nhập đủ 6 số.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`https://ticketcinemaweb.onrender.com/api/auth/verify/${email}/${enteredOtp}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        alert("Xác thực thành công! Chuyển sang đăng nhập.");
        onClose(); // Đóng modal OTP
        setLoginModalOpen(true); // Mở modal Đăng nhập
      } else {
        setError("OTP không chính xác. Vui lòng thử lại.");
      }
    } catch (error) {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-2xl font-bold text-center">Nhập mã OTP</h2>
            <p className="text-gray-300 text-center">
              Mã OTP đã được gửi đến email: <span className="font-bold">{email}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    maxLength={1}
                    className="w-10 h-10 text-center text-xl font-bold bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 p-2 rounded text-white font-bold hover:bg-green-600 transition disabled:bg-gray-600"
              >
                {loading ? "Đang xác thực..." : "Xác nhận OTP"}
              </button>

              <p className="text-center text-gray-400">
                Không nhận được mã?{" "}
                <span className="text-blue-400 cursor-pointer hover:underline">
                  Gửi lại OTP
                </span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Hiển thị modal đăng nhập sau khi xác thực OTP */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
};

export default OtpModal;
