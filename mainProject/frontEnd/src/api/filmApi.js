// src/api/filmApi.js
const BASE_URL = "https://ticketcinemaweb.onrender.com/api/film";

export const getMoviesByStatus = async (status) => {
  try {
    if (!status) {
      console.error("Error: status is undefined or null");
      return [];
    }

    console.log(`Fetching movies with status: ${status}`);

    const response = await fetch(`${BASE_URL}/getFilmsByStatus?status=${encodeURIComponent(status)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch movies: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching movies:", error.message);
    return [];
  }
};

export const getShowtimesByFilm = async (filmId) => {
  try {
    if (!filmId) {
      console.error("Error: filmId is undefined or null");
      return [];
    }

    console.log(`Fetching showtimes for filmId: ${filmId}`);

    const response = await fetch(`https://ticketcinemaweb.onrender.com/api/show/getByFilm?filmId=${filmId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch showtimes: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching showtimes:", error.message);
    return [];
  }
};

export const getAllFilms = async (pageNumber = 0, pageSize = 10000) => {
  try {
    const token = localStorage.getItem("accessToken");
    console.log("Access Token:", token); // Log token để debug
    if (!token) {
      console.error("Error: No access token found in localStorage");
      return [];
    }

    console.log(`Fetching all films with pageNumber: ${pageNumber}, pageSize: ${pageSize}`);

    const response = await fetch(
      `${BASE_URL}/getFilms?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch films: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Films Data:", data); // Log dữ liệu trả về để kiểm tra
    return data;
  } catch (error) {
    console.error("Error fetching films:", error.message);
    return [];
  }
};