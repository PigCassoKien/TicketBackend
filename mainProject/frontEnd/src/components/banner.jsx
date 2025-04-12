import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination"; // Import CSS cho pagination
import { EffectCoverflow, Autoplay, Navigation, Pagination } from "swiper/modules";
import banner1 from "./images/banner1.png";
import banner2 from "./images/banner2.png";
import banner3 from "./images/banner3.png";
import banner4 from "./images/banner4.png";
import banner5 from "./images/banner5.png";

const banners = [banner1, banner2, banner3, banner4, banner5];

const Banner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null); // Lưu instance của Swiper

  const handleDotClick = (index) => {
    if (swiperInstance) {
      swiperInstance.slideToLoop(index, 500); // Chuyển ngay lập tức đến banner được chọn
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen">
      <Swiper
        modules={[EffectCoverflow, Autoplay, Navigation, Pagination]}
        effect="coverflow"
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        navigation
        pagination={{ clickable: true }}
        centeredSlides={true}
        slidesPerView={1.5}
        spaceBetween={-50}
        onSwiper={(swiper) => setSwiperInstance(swiper)} // Lưu instance của Swiper
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 150,
          modifier: 2,
          slideShadows: false,
        }}
        className="w-full max-w-[1100px] h-[300px] relative overflow-hidden rounded-lg shadow-lg"
      >
        {banners.map((img, idx) => (
          <SwiperSlide key={idx} className="flex justify-center transition-all duration-500">
            <img
              src={img}
              alt={`Banner ${idx + 1}`}
              className="object-cover rounded-lg transition-all duration-500"
              style={{
                width: idx === activeIndex ? "1000px" : "800px",
                height: "300px",
                opacity: idx === activeIndex ? 1 : 0.5,
                transform: idx === activeIndex ? "scale(1)" : "scale(0.85)",
                transition: "all 0.5s ease-in-out",
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Hiển thị các chấm tròn pagination bên dưới */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              activeIndex === idx ? "bg-white" : "bg-white/50 border border-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
