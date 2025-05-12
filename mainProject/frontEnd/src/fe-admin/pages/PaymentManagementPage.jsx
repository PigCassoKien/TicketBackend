import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chart as ChartJS, LineElement, PointElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale } from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import moment from "moment";
import Footer from "../../components/footer.jsx";

// Register Chart.js components
ChartJS.register(LineElement, PointElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const PaymentManagementPage = () => {
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [dailyRevenueData, setDailyRevenueData] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [showRevenueData, setShowRevenueData] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [filteredDailyRevenue, setFilteredDailyRevenue] = useState(0);

  // Fetch token
  const token = localStorage.getItem("accessToken");

  // Fetch real-time revenue (today and this month)
  const fetchRealTimeRevenue = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const thisMonth = moment().format("YYYY-MM");

      const todayResponse = await fetch(`https://localhost:8080/api/payment/total/day/${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!todayResponse.ok) throw new Error("Không thể lấy doanh thu ngày hôm nay");
      const todayData = await todayResponse.json();
      setTodayRevenue(todayData);

      const monthResponse = await fetch(`https://localhost:8080/api/payment/total/month/${thisMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!monthResponse.ok) throw new Error("Không thể lấy doanh thu tháng này");
      const monthData = await monthResponse.json();
      setMonthRevenue(monthData);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch daily revenue (last 30 days)
  const fetchDailyRevenue = async () => {
    try {
      const days = [];
      const revenues = [];
      for (let i = 29; i >= 0; i--) {
        const date = moment().subtract(i, "days").format("YYYY-MM-DD");
        days.push(date);
        const response = await fetch(`https://localhost:8080/api/payment/total/day/${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Không thể lấy doanh thu ngày ${date}`);
        const data = await response.json();
        revenues.push(data);
      }
      setDailyRevenueData({ labels: days, data: revenues });
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch monthly revenue (last 12 months)
  const fetchMonthlyRevenue = async () => {
    try {
      const months = [];
      const revenues = [];
      for (let i = 11; i >= 0; i--) {
        const month = moment().subtract(i, "months").format("YYYY-MM");
        months.push(month);
        const response = await fetch(`https://localhost:8080/api/payment/total/month/${month}`, {
        headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Không thể lấy doanh thu tháng ${month}`);
        const data = await response.json();
        revenues.push(data);
      }
      setMonthlyRevenueData({ labels: months, data: revenues });
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch revenue for a specific date
  const fetchRevenueByDate = async (date) => {
    try {
      const response = await fetch(`https://localhost:8080/api/payment/total/day/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Không thể lấy doanh thu ngày ${date}`);
      const data = await response.json();
      setFilteredDailyRevenue(data);
    } catch (err) {
      setError(err.message);
      setFilteredDailyRevenue(0);
    }
  };

  // Fetch shows and their revenue
  const fetchShowRevenue = async () => {
    try {
      // Fetch all shows
      const showResponse = await fetch("https://localhost:8080/api/show/allShow", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!showResponse.ok) throw new Error("Không thể lấy danh sách suất chiếu");
      const showData = await showResponse.json();
      setShows(showData);

      // Fetch revenue for each show with error handling
      const showRevenues = [];
      for (const show of showData) {
        try {
          const response = await fetch(`https://localhost:8080/api/payment/total/show/${show.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            console.warn(`Không thể lấy doanh thu cho show ${show.id}, gán doanh thu là 0`);
            showRevenues.push({
              showId: show.id,
              showName: show.filmName || `Suất chiếu ${show.id}`,
              showDate: show.startTime
                ? new Date(show.startTime).toLocaleDateString("vi-VN")
                : "Không rõ ngày chiếu",
              showTime: show.startTime
                ? new Date(show.startTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Không rõ giờ chiếu",
              revenue: 0,
            });
            continue;
          }
          const revenue = await response.json();
          showRevenues.push({
            showId: show.id,
            showName: show.filmName || `Suất chiếu ${show.id}`,
            showDate: show.startTime
              ? new Date(show.startTime).toLocaleDateString("vi-VN")
              : "Không rõ ngày chiếu",
            showTime: show.startTime
              ? new Date(show.startTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Không rõ giờ chiếu",
            revenue,
          });
        } catch (err) {
          console.error(`Lỗi khi lấy doanh thu cho show ${show.id}:`, err);
          showRevenues.push({
            showId: show.id,
            showName: show.filmName || `Suất chiếu ${show.id}`,
            showDate: show.startTime
              ? new Date(show.startTime).toLocaleDateString("vi-VN")
              : "Không rõ ngày chiếu",
            showTime: show.startTime
              ? new Date(show.startTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Không rõ giờ chiếu",
            revenue: 0,
          });
        }
      }
      setShowRevenueData(showRevenues);
    } catch (err) {
      setError(err.message);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchRealTimeRevenue(), fetchDailyRevenue(), fetchMonthlyRevenue(), fetchShowRevenue()]);
        await fetchRevenueByDate(selectedDate);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Real-time update every 30 seconds
    const interval = setInterval(fetchRealTimeRevenue, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Fetch revenue when selected date changes
  useEffect(() => {
    fetchRevenueByDate(selectedDate);
  }, [selectedDate]);

  // Daily line chart data
  const dailyLineChartData = {
    labels: dailyRevenueData.labels || [],
    datasets: [
      {
        label: "Doanh thu theo ngày (30 ngày gần nhất)",
        data: dailyRevenueData.data || [],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // Monthly line chart data
  const monthlyLineChartData = {
    labels: monthlyRevenueData.labels || [],
    datasets: [
      {
        label: "Doanh thu theo tháng (12 tháng gần nhất)",
        data: monthlyRevenueData.data || [],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // Pie chart data (revenue by show)
  const totalShowRevenue = showRevenueData.reduce((sum, show) => sum + show.revenue, 0);
  const pieChartData = {
    labels: showRevenueData.map(
      (show) => `${show.showName} (${show.showDate}, ${show.showTime})`
    ),
    datasets: [
      {
        label: "Tỷ lệ doanh thu theo suất chiếu",
        data: showRevenueData.map((show) => (totalShowRevenue ? (show.revenue / totalShowRevenue) * 100 : 0)),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full"
        />
        <p className="ml-4 text-sm">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Thử lại
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full bg-[#1a1a1d] shadow-lg z-20 p-4"
      >
        <h1 className="text-xl sm:text-2xl font-bold">Quản Lý Thanh Toán</h1>
      </motion.header>

      <div className="pt-[80px] px-4 sm:px-6">
        {/* Real-time Revenue */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#1a1a1d] rounded-lg shadow-lg p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Doanh Thu Theo Thời Gian Thực</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Ngày hôm nay ({moment().format("DD/MM/YYYY")})</p>
              <p className="text-2xl font-bold text-green-400">{todayRevenue.toLocaleString("vi-VN")} VNĐ</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Tháng này ({moment().format("MM/YYYY")})</p>
              <p className="text-2xl font-bold text-blue-400">{monthRevenue.toLocaleString("vi-VN")} VNĐ</p>
            </div>
          </div>
        </motion.div>

        {/* Date Filter and Filtered Revenue */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#1a1a1d] rounded-lg shadow-lg p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Lọc Doanh Thu Theo Ngày</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded-lg"
              max={moment().format("YYYY-MM-DD")}
            />
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Doanh thu ngày {moment(selectedDate).format("DD/MM/YYYY")}</p>
              <p className="text-xl font-bold text-yellow-400">{filteredDailyRevenue.toLocaleString("vi-VN")} VNĐ</p>
            </div>
          </div>
        </motion.div>

        {/* Daily Line Chart */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#1a1a1d] rounded-lg shadow-lg p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Biểu Đồ Doanh Thu Theo Ngày</h2>
          <div className="w-full h-[400px]">
            <Line
              data={dailyLineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { title: { display_connect: true, text: "Ngày", color: "#fff" }, ticks: { color: "#fff" } },
                  y: { title: { display: true, text: "Doanh thu (VNĐ)", color: "#fff" }, ticks: { color: "#fff" } },
                },
                plugins: { legend: { labels: { color: "#fff" } } },
              }}
            />
          </div>
        </motion.div>

        {/* Monthly Line Chart */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#1a1a1d] rounded-lg shadow-lg p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Biểu Đồ Doanh Thu Theo Tháng</h2>
          <div className="w-full h-[400px]">
            <Line
              data={monthlyLineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { title: { display: true, text: "Tháng", color: "#fff" }, ticks: { color: "#fff" } },
                  y: { title: { display: true, text: "Doanh thu (VNĐ)", color: "#fff" }, ticks: { color: "#fff" } },
                },
                plugins: { legend: { labels: { color: "#fff" } } },
              }}
            />
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#1a1a1d] rounded-lg shadow-lg p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Tỷ Lệ Doanh Thu Theo Suất Chiếu</h2>
          <div className="w-full max-w-[400px] mx-auto h-[400px]">
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: "#fff" } },
                  tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw.toFixed(2)}%` } },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Detailed Revenue */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#1a1a1d] rounded-lg shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Chi Tiết Doanh Thu</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Doanh Thu Theo Suất Chiếu</h3>
              {showRevenueData.map((show) => (
                <div key={show.showId} className="bg-gray-800 p-3 rounded-lg mt-2">
                  <p className="text-sm">
                    {show.showName} ({show.showDate}, {show.showTime}): <span className="text-yellow-400">{show.revenue.toLocaleString("vi-VN")} VNĐ</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentManagementPage;