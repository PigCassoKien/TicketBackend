import { useState } from "react";
import ManageHalls from "../component/ManageHalls";
import ManageShowtimes from "../component/ManageShowtimes";

const ManageShowtimesPage = () => {
  const [view, setView] = useState("halls"); // "halls" or "showtimes"

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý suất chiếu</h1>

      {/* Toggle Buttons for Views */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView("halls")}
          className={`px-4 py-2 rounded-lg transition-all ${
            view === "halls" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          Quản lý phòng chiếu
        </button>
        <button
          onClick={() => setView("showtimes")}
          className={`px-4 py-2 rounded-lg transition-all ${
            view === "showtimes" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          Quản lý suất chiếu
        </button>
      </div>

      {/* Render the Appropriate View */}
      {view === "halls" && <ManageHalls />}
      {view === "showtimes" && <ManageShowtimes />}
    </div>
  );
};

export default ManageShowtimesPage;