package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.EnumEntities.ESeat;
import com.example.besrc.Entities.EnumEntities.ESeatStatus;
import com.example.besrc.Entities.Hall;
import com.example.besrc.Entities.Seat;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.HallRepository;
import com.example.besrc.Repository.SeatRepository;
import com.example.besrc.Repository.ShowRepository;
import com.example.besrc.Security.InputValidationFilter;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.ErrorResponse;
import com.example.besrc.Service.SeatService;
import com.example.besrc.Service.HallService;
import com.example.besrc.requestClient.HallRequest;
import org.apache.logging.log4j.util.InternalException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HallImplement implements HallService {

    private final HallRepository hallRepository;
    private final SeatService seatService;
    private final ShowRepository showRepository;
    private final InputValidationFilter inputValidationFilter;
    private final SeatRepository seatRepository;

    public HallImplement(HallRepository hallRepository, SeatService seatService, ShowRepository showRepository, InputValidationFilter inputValidationFilter, SeatRepository seatRepository) {
        this.hallRepository = hallRepository;
        this.seatService = seatService;
        this.showRepository = showRepository;
        this.inputValidationFilter = inputValidationFilter;
        this.seatRepository = seatRepository;
    }

    @Override
    public List<Hall> getAll() {
        return hallRepository.findAll();
    }

    @Override
    public Hall getHallById(String id) {
        return hallRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Hall not found"));
    }

    @Override
    public MyApiResponse newHall(Hall hall) {
        // Kiểm tra tính hợp lệ của tên Hall
        if (!inputValidationFilter.checkInput(hall.getName())) {
            throw new BadRequestException("Name is not valid");
        }

        // Kiểm tra nếu Hall đã tồn tại
        if (hallRepository.existsByName(hall.getName())) {
            throw new BadRequestException("Hall name already exists");
        }

        // Kiểm tra số hàng và số cột
        if (hall.getTotalCol() <= 10 || hall.getTotalRow() <= 10) {
            throw new BadRequestException("Row/Column number must be greater than 10");
        }

        // Lưu Hall vào cơ sở dữ liệu
        hallRepository.save(hall);

        // Tạo các ghế cho Hall
        createSeatsForHall(hall);

        return new MyApiResponse("Hall created successfully");
    }

    private void createSeatsForHall(Hall hall) {
        int totalRows = hall.getTotalRow();
        int totalCols = hall.getTotalCol();

        // Kiểm tra tính hợp lệ của cấu hình hàng và cột
        if (totalRows <= 0 || totalCols <= 0) {
            throw new BadRequestException("Invalid hall configuration: Rows and Columns must be greater than 0");
        }

        List<Seat> seats = new ArrayList<>();
        for (int row = 0; row < totalRows; row++) {
            char rowLabel = (char) ('A' + row); // Tạo nhãn hàng ghế (A, B, C, ...)

            for (int col = 1; col <= totalCols; col++) {
                String seatIndex = rowLabel + String.valueOf(col); // Ví dụ: A1, A2, B1, B2

                // Ghế loại VIP hoặc NORMAL tùy thuộc vào vị trí
                ESeat seatType = (row == 0 || row == totalRows - 1 || col == 1 || col == totalCols)
                        ? ESeat.NORMAL : ESeat.VIP;

                // Tạo Seat và thêm vào danh sách
                Seat seat = new Seat(hall, row, col, seatType);
                seats.add(seat);
            }
        }

        // Lưu ghế vào cơ sở dữ liệu
        seatRepository.saveAll(seats);
    }


    @Override
    public MyApiResponse updateHall(String hallId, HallRequest request) {
        if (!inputValidationFilter.checkInput(request.getHallName()))
            return new ErrorResponse("Name is not valid", HttpStatus.BAD_REQUEST);

        if (request.getTotalCol() <= 10 || request.getTotalRow() <= 10)
            return new ErrorResponse("Row/Column number must be greater than 10", HttpStatus.BAD_REQUEST);

        Hall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new NotFoundException("Hall not found"));

        int oldRow = hall.getTotalRow();
        int oldCol = hall.getTotalCol();
        int newRow = request.getTotalRow();
        int newCol = request.getTotalCol();

        hall.setName(request.getHallName());
        hall.setTotalCol(newCol);
        hall.setTotalRow(newRow);

        hallRepository.save(hall);

        // Cập nhật danh sách ghế khi thay đổi số hàng/cột
        updateSeatsInHall(hall, oldRow, oldCol, newRow, newCol);

        return new MyApiResponse("Hall and seats updated successfully");
    }

    private void updateSeatsInHall(Hall hall, int oldRow, int oldCol, int newRow, int newCol) {
        // Nếu số hàng/cột giảm, xóa ghế dư thừa
        if (newRow < oldRow || newCol < oldCol) {
            seatRepository.deleteByHallAndRowIndexGreaterThanOrColIndexGreaterThan(hall, newRow, newCol);
        }

        List<Seat> newSeats = new ArrayList<>();

        for (int row = 0; row < newRow; row++) {
            char rowLabel = (char) ('A' + row); // Tạo nhãn hàng ghế (A, B, C, ...)

            for (int col = 1; col <= newCol; col++) {
                // ✅ Kiểm tra xem ghế đã tồn tại chưa
                Optional<Seat> existingSeat = seatRepository.findByHallIdAndRowIndexAndColIndex(hall.getId(), row, col);
                if (existingSeat.isPresent()) continue; // Bỏ qua nếu đã có ghế

                // ✅ Định nghĩa seatType giống như createSeatsForHall()
                ESeat seatType = (row == 0 || row == newRow - 1 || col == 1 || col == newCol)
                        ? ESeat.NORMAL : ESeat.VIP;

                // ✅ Tạo ghế mới với thông tin đầy đủ
                Seat newSeat = new Seat();
                newSeat.setHall(hall);
                newSeat.setRowIndex(row);
                newSeat.setColIndex(col);
                newSeat.setName(hall.getName() + " " + (row + 1) + "." + col); // "HallName RowIndex.ColIndex"
                newSeat.setSeatType(seatType);
                newSeat.setStatus(ESeatStatus.AVAILABLE);

                newSeats.add(newSeat);
            }
        }

        // ✅ Lưu tất cả ghế mới vào DB
        if (!newSeats.isEmpty()) {
            seatRepository.saveAll(newSeats);
        }
    }



    @Override
    public MyApiResponse removeHall(String id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Hall not found"));

        // Kiểm tra xem có Show nào đang sử dụng Hall này không
        boolean hasShows = showRepository.existsByHall(hall);
        if (hasShows) {
            return new ErrorResponse("Cannot delete Hall because it is linked to existing Shows", HttpStatus.BAD_REQUEST);
        }

        try {
            seatRepository.deleteAllByHallId(id);
            hallRepository.delete(hall);
            return new MyApiResponse("Hall deleted successfully");
        } catch (Exception e) {
            return new ErrorResponse("Failed to delete Hall: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public boolean isExistByName(String name) {
        return hallRepository.existsByName(name);
    }

    @Override
    public boolean isExistById(String Id) {
        return hallRepository.existsById(Id);
    }
}
