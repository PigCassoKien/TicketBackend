const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-8 py-10 w-full">
      <div className="w-full px-6 text-center">
        <div className="flex justify-center space-x-4 mb-4">
          <img src="/logo.png" alt="Logo" className="h-10" />
        </div>

        <nav className="flex justify-center space-x-6 text-gray-400 text-sm">
          <a href="#" className="hover:text-white">Chính sách</a>
          <a href="#" className="hover:text-white">Lịch chiếu</a>
          <a href="#" className="hover:text-white">Tin tức</a>
          <a href="#" className="hover:text-white">Giá vé</a>
          <a href="#" className="hover:text-white">Hỗ trợ</a>
          <a href="#" className="hover:text-white">Liên hệ</a>
        </nav>

        <div className="mt-6 flex justify-center space-x-4">
          <img src="/google-play.png" alt="Google Play" className="h-8 cursor-pointer" />
          <img src="/app-store.png" alt="App Store" className="h-8 cursor-pointer" />
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Cơ quan chủ quản: BỘ VĂN HÓA, THỂ THAO VÀ DU LỊCH
        </p>
        <p className="text-gray-500 text-sm">
          Giấy phép số: 224/GP-TTĐT ngày 3/8/2010 - Chịu trách nhiệm: Vũ Đức Tùng - Giám đốc.
        </p>
        <p className="text-gray-500 text-sm">
          Địa chỉ: 87 Láng Hạ, Quận Ba Đình, Hà Nội - Điện thoại: 024.35143791
        </p>

        <p className="text-gray-400 text-xs mt-4">
          &copy; 2025 Galaxy Cinema Clone. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
