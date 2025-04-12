// ProtectedRoute.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Sửa import: Sử dụng named export

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    // Kiểm tra xem token có tồn tại không
    if (!token) {
      console.log("🚫 ProtectedRoute - Chưa đăng nhập, chuyển hướng về /login");
      navigate("/", { replace: true });
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      // Kiểm tra token có hết hạn không
      const currentTime = Date.now() / 1000; // Thời gian hiện tại (giây)
      if (decodedToken.exp < currentTime) {
        console.log("🚫 ProtectedRoute - Token đã hết hạn, chuyển hướng về /login");
        localStorage.removeItem("accessToken"); // Xóa token hết hạn
        navigate("/login", { replace: true });
        return;
      }

      // Nếu có allowedRoles, kiểm tra vai trò
      if (allowedRoles) {
        const roles = decodedToken.roles || []; // Lấy mảng roles
        const userRole = roles[0]?.replace("ROLE_", ""); // Loại bỏ tiền tố "ROLE_"
        if (!userRole || !allowedRoles.includes(userRole)) {
          console.log("🚫 ProtectedRoute - Không có quyền truy cập, chuyển hướng về /");
          navigate("/", { replace: true });
          return;
        }
      }
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
      navigate("/login", { replace: true });
    }
  }, [token, navigate, allowedRoles]);

  // Nếu token tồn tại, render component con
  return token ? children : null;
};

export default ProtectedRoute;