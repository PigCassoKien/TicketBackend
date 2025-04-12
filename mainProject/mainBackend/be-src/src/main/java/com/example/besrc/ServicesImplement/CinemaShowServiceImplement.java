package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.*;
import com.example.besrc.Entities.EnumEntities.ESeat;
import com.example.besrc.Entities.EnumEntities.ESeatStatus;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.*;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.ShowInformationResponse;
import com.example.besrc.ServerResponse.ShowSeatResponse;
import com.example.besrc.Service.CinemaShowService;
import com.example.besrc.requestClient.ShowRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class CinemaShowServiceImplement implements CinemaShowService {

    @Autowired
    HallRepository hallRepository;
    @Autowired
    private FilmRepository filmRepository;
    @Autowired
    private CinemaShowRepository cinemaShowRepository;
    @Autowired
    private ShowSeatRepository showSeatRepository;
    @Autowired
    private SeatRepository seatRepository;

    // 🔹 Tạo danh sách ghế từ row & col của Hall
    private void createSeatsForShow(Show show) {
        Hall hall = show.getHall();
        int totalRows = hall.getTotalRow();
        int totalCols = hall.getTotalCol();

        if (totalRows <= 0 || totalCols <= 0) {
            throw new BadRequestException("Invalid hall configuration: Rows and Columns must be greater than 0");
        }

        // Tạo danh sách ghế (Seat) cho show
        List<Seat> seats = new ArrayList<>();
        List<ShowSeat> showSeats = new ArrayList<>();
        for (int row = 0; row < totalRows; row++) {
            char rowLabel = (char) ('A' + row); // Tạo nhãn hàng ghế (A, B, C, ...)

            for (int col = 1; col <= totalCols; col++) {
                String seatIndex = rowLabel + String.valueOf(col); // Ví dụ: A1, A2, B1, B2...

                // Kiểm tra xem ghế có phải ở hàng đầu, hàng cuối, cột đầu và cột cuối không
                ESeat seatType = (row == 0 || row == 1 || row == 2 || row == totalRows - 1 || col == 1 || col == totalCols)
                        ? ESeat.NORMAL : ESeat.VIP;

                // Tạo ghế (Seat) và lưu vào danh sách
                Seat seat = new Seat(hall, row, col, seatType);
                seats.add(seat);

                // Tạo ShowSeat cho từng ghế
                ShowSeat showSeat = new ShowSeat(UUID.randomUUID().toString(), show, seatIndex, ESeatStatus.AVAILABLE);
                showSeat.setSeat(seat); // Liên kết ShowSeat với Seat
                showSeats.add(showSeat);
            }
        }

        // Lưu tất cả ghế vào cơ sở dữ liệu
        seatRepository.saveAll(seats);

        // Lưu tất cả ShowSeat vào cơ sở dữ liệu
        showSeatRepository.saveAll(showSeats);
    }
    // 🔹 Tạo một Show mới
    private String createOneShow(ShowRequest request) {
        // Lấy Hall và Film từ request
        Hall hall = hallRepository.findById(request.getHallId())
                .orElseThrow(() -> new NotFoundException("Hall ID: " + request.getHallId() + " NOT FOUND"));
        Film film = filmRepository.findById(Long.valueOf(request.getFilmId()))
                .orElseThrow(() -> new NotFoundException("Film ID: " + request.getFilmId() + " NOT FOUND"));

        // Kiểm tra thời gian bắt đầu của Show
        LocalDateTime startTime = request.getStartingTime();
        if (startTime == null) {
            throw new BadRequestException("Starting time cannot be null");
        }
        LocalDateTime endTime = startTime.plusMinutes(film.getDurationInMins()).plusMinutes(10);

        // Tạo Show
        Show show = new Show(hall, film, startTime, endTime);
        Show savedShow = cinemaShowRepository.save(show);

        // Tạo các ghế cho Show (liên kết với ShowSeat)
        createSeatsForShow(savedShow);

        return savedShow.getId();
    }


    @Override
    public MyApiResponse createShow(ShowRequest request) {
        return new MyApiResponse(this.createOneShow(request));
    }

    // 🔹 Cập nhật Show
    @Override
    public MyApiResponse updateShow(ShowRequest request, String showId) {
        Show show = cinemaShowRepository.findById(showId)
                .orElseThrow(() -> new NotFoundException("Show ID: " + showId + " NOT FOUND"));

        // Cập nhật film nếu khác
        if (!Objects.equals(show.getFilm().getId(), request.getFilmId())) {
            Film film = filmRepository.findById(Long.valueOf(request.getFilmId()))
                    .orElseThrow(() -> new NotFoundException("Film ID: " + request.getFilmId() + " NOT FOUND"));
            show.setFilm(film);
        }

        // Cập nhật Hall nếu khác -> Xoá ghế cũ, tạo ghế mới
        if (!show.getHall().getId().equals(request.getHallId())) {
            Hall newHall = hallRepository.findById(request.getHallId())
                    .orElseThrow(() -> new NotFoundException("Hall ID: " + request.getHallId() + " NOT FOUND"));

            showSeatRepository.deleteAllByShowId(show.getId());
            show.setHall(newHall);
            createSeatsForShow(show);
        }

        // Cập nhật thời gian nếu khác
        LocalDateTime newStartTime = request.getStartingTime();
        if (newStartTime != null && !newStartTime.equals(show.getStartTime())) {
            LocalDateTime endTime = newStartTime.plusMinutes(show.getFilm().getDurationInMins()).plusMinutes(10);
            show.setStartTime(newStartTime);
            show.setEndTime(endTime);
        }

        cinemaShowRepository.save(show);
        return new MyApiResponse("Show updated successfully");
    }

    // 🔹 Xoá Show và tất cả các Seats liên quan
    @Override
    public MyApiResponse deleteShow(String showId) {
        Show show = cinemaShowRepository.findById(showId)
                .orElseThrow(() -> new NotFoundException("Show ID: " + showId + " NOT FOUND"));

        // Xoá tất cả các bản ghi trong bảng show_seat có show_id tương ứng
        showSeatRepository.deleteAllByShowId(showId);

        // Xoá bản ghi trong bảng cinema_show
        cinemaShowRepository.delete(show);

        return new MyApiResponse("Show and its seats deleted successfully");
    }


    @Override
    public MyApiResponse deleteShowByHallIdAndFilmId(ShowRequest request) {
        LocalDateTime startingTime = request.getStartingTime();

        Show show = cinemaShowRepository.findByHallHallIdAndFilmFilmId(request.getHallId(), request.getFilmId(), startingTime);
        if (show == null) {
            throw new NotFoundException("No show found with the given Hall ID, Film ID, and Start Time.");
        }

        showSeatRepository.deleteAllByShowId(show.getId());
        cinemaShowRepository.deleteById(show.getId());

        return new MyApiResponse("Show deleted successfully");
    }

    // 🔹 Thêm danh sách Show
    @Override
    public List<MyApiResponse> addListShow(List<ShowRequest> requestList) {
        List<MyApiResponse> responses = new ArrayList<>();
        for (ShowRequest request : requestList) {
            String showId = this.createOneShow(request);
            responses.add(new MyApiResponse(showId));
        }
        return responses;
    }

    @Override
    public ShowInformationResponse getShowInformation(String showId) {
        Show show = cinemaShowRepository.findById(showId)
                .orElseThrow(() -> new NotFoundException("Show ID: " + showId + " NOT FOUND"));

        int availableSeat = showSeatRepository.countByShowIdAndStatus(show.getId(), ESeatStatus.AVAILABLE);
        int bookedSeat = showSeatRepository.countByShowIdAndStatus(show.getId(), ESeatStatus.BOOKED);

        return new ShowInformationResponse(show, bookedSeat, availableSeat);
    }

    @Override
    public List<ShowInformationResponse> getAllShows() {
        List<Show> shows = cinemaShowRepository.findAll();
        return convertToListInformation(shows);
    }

    @Override
    public List<ShowInformationResponse> getAllShowsByHallId(String hallId) {
        List<Show> shows = cinemaShowRepository.findByHallId(hallId);
        return convertToListInformation(shows);
    }

    @Override
    public List<ShowInformationResponse> getAllShowByFilmId(String filmId) {
        List<Show> shows = cinemaShowRepository.findByFilmId(Long.valueOf(filmId));
        return convertToListInformation(shows);
    }

    @Override
    public List<ShowSeatResponse> getAllShowSeats(String showId) {

        List<ShowSeatResponse> seatResponses = new ArrayList<>();

        List<ShowSeat> seats = showSeatRepository.findByShowId(showId);
        for (ShowSeat seat : seats) {
            seatResponses.add(new ShowSeatResponse(seat));
        }

        return seatResponses;
    }

    private List<ShowInformationResponse> convertToListInformation(List<Show> shows) {
        List<ShowInformationResponse> list = new ArrayList<>();
        for (Show show : shows) {
            int availableSeat = showSeatRepository.countByShowIdAndStatus(show.getId(), ESeatStatus.AVAILABLE);
            int unavailableSeat = showSeatRepository.countByShowIdAndStatus(show.getId(), ESeatStatus.BOOKED);
            ShowInformationResponse response = new ShowInformationResponse(show, unavailableSeat, availableSeat);
            list.add(response);
        }
        return list;
    }
}
