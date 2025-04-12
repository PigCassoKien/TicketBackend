package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.EnumEntities.ESeat;
import com.example.besrc.Entities.EnumEntities.ESeatStatus;
import com.example.besrc.Entities.Hall;
import com.example.besrc.Entities.Seat;
import com.example.besrc.Entities.ShowSeat;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.HallRepository;
import com.example.besrc.Repository.SeatRepository;
import com.example.besrc.Repository.ShowRepository;
import com.example.besrc.Repository.ShowSeatRepository;
import com.example.besrc.Security.InputValidationFilter;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.ErrorResponse;
import com.example.besrc.Service.SeatService;
import com.example.besrc.Service.HallService;
import com.example.besrc.requestClient.HallRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HallServiceImplement implements HallService {

    private final HallRepository hallRepository;
    private final SeatService seatService;
    private final ShowRepository showRepository;
    private final InputValidationFilter inputValidationFilter;
    private final SeatRepository seatRepository;
    private final ShowSeatRepository showSeatRepository;

    public HallServiceImplement(HallRepository hallRepository, SeatService seatService, ShowRepository showRepository, InputValidationFilter inputValidationFilter, SeatRepository seatRepository, ShowSeatRepository showSeatRepository) {
        this.hallRepository = hallRepository;
        this.seatService = seatService;
        this.showRepository = showRepository;
        this.inputValidationFilter = inputValidationFilter;
        this.seatRepository = seatRepository;
        this.showSeatRepository = showSeatRepository;
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

        if (totalRows <= 0 || totalCols <= 0) {
            throw new BadRequestException("Invalid hall configuration: Rows and Columns must be greater than 0");
        }

        List<Seat> seats = new ArrayList<>();
        for (int row = 0; row < totalRows; row++) {
            char rowLabel = (char) ('A' + row); // Tạo nhãn hàng ghế (A, B, C, ...)

            for (int col = 1; col <= totalCols; col++) {
                String seatIndex = rowLabel + String.valueOf(col); // Ví dụ: A1, A2, B1, B2
                ESeat seatType = (row == 0 || row == 1 || row == 2 || row == totalRows - 1 || col == 1 || col == totalCols)
                        ? ESeat.NORMAL : ESeat.VIP;

                Seat seat = new Seat(hall, row, col, seatType);
                seat.setName(seatIndex); // Đặt tên ghế theo nhãn: A1, B2, ...
                seats.add(seat);
            }
        }

        seatRepository.saveAll(seats);
    }


    @Override
    public MyApiResponse updateHall(String hallId, HallRequest request) {
        // Validate input
        if (!inputValidationFilter.checkInput(request.getHallName()))
            return new ErrorResponse("Name is not valid", HttpStatus.BAD_REQUEST);

        if (request.getTotalCol() <= 10 || request.getTotalRow() <= 10)
            return new ErrorResponse("Row/Column number must be greater than 10", HttpStatus.BAD_REQUEST);

        // Find existing hall
        Hall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new NotFoundException("Hall not found"));

        // Check if hall is linked to any shows
        boolean hasShows = showRepository.existsByHall(hall);
        if (hasShows) {
            return new ErrorResponse("Cannot update Hall because it is linked to existing Shows", HttpStatus.CONFLICT);
        }

        // Get old dimensions
        int oldRow = hall.getTotalRow();
        int oldCol = hall.getTotalCol();
        int newRow = request.getTotalRow();
        int newCol = request.getTotalCol();

        // Update hall basic info
        hall.setName(request.getHallName());
        hall.setTotalCol(newCol);
        hall.setTotalRow(newRow);
        hallRepository.save(hall);

        // Update seats using the helper method
        updateSeatsInHall(hall, oldRow, oldCol, newRow, newCol);

        return new MyApiResponse("Hall and seats updated successfully");
    }

    private void updateSeatsInHall(Hall hall, int oldRow, int oldCol, int newRow, int newCol) {
        // Step 1: Lấy tất cả ghế hiện có
        List<Seat> existingSeats = seatRepository.findByHallId(hall.getId());
        List<Seat> seatsToUpdate = new ArrayList<>();
        List<Seat> seatsToDelete = new ArrayList<>();
        List<Seat> seatsToAdd = new ArrayList<>();

        // Step 2: Xử lý ghế hiện có
        for (Seat seat : existingSeats) {
            int rowIndex = seat.getRowIndex();
            int colIndex = seat.getColIndex();

            if (rowIndex < newRow && colIndex <= newCol) {
                // Ghế vẫn trong phạm vi mới, cập nhật thông tin
                char rowLabel = (char) ('A' + rowIndex); // Nhãn hàng ghế: A, B, C, ...
                String newName = rowLabel + String.valueOf(colIndex); // Ví dụ: A1, B2
                ESeat newSeatType = (rowIndex == 0 || rowIndex == newRow - 1 || colIndex == 1 || colIndex == newCol)
                        ? ESeat.NORMAL : ESeat.VIP;

                // Chỉ cập nhật nếu có thay đổi
                if (!seat.getName().equals(newName) || seat.getSeatType() != newSeatType) {
                    seat.setName(newName);
                    seat.setSeatType(newSeatType);
                    seatsToUpdate.add(seat);
                }
            } else {
                // Ghế ngoài phạm vi mới, đánh dấu để xóa
                seatsToDelete.add(seat);
            }
        }

        // Step 3: Thêm ghế mới nếu kích thước tăng
        for (int row = 0; row < newRow; row++) {
            char rowLabel = (char) ('A' + row); // Nhãn hàng ghế: A, B, C, ...
            for (int col = 1; col <= newCol; col++) {
                Optional<Seat> existingSeat = seatRepository.findByHallIdAndRowIndexAndColIndex(hall.getId(), row, col);
                if (!existingSeat.isPresent()) {
                    // Tạo ghế mới
                    ESeat seatType = (row == 0 || row == newRow - 1 || col == 1 || col == newCol)
                            ? ESeat.NORMAL : ESeat.VIP;
                    String seatName = rowLabel + String.valueOf(col); // Ví dụ: A1, B2
                    Seat newSeat = new Seat();
                    newSeat.setHall(hall);
                    newSeat.setRowIndex(row);
                    newSeat.setColIndex(col);
                    newSeat.setName(seatName);
                    newSeat.setSeatType(seatType);
                    newSeat.setStatus(ESeatStatus.AVAILABLE);
                    seatsToAdd.add(newSeat);
                }
            }
        }

        // Step 4: Áp dụng thay đổi vào cơ sở dữ liệu
        if (!seatsToDelete.isEmpty()) {
            List<Long> seatIdsToDelete = seatsToDelete.stream()
                    .map(Seat::getId)
                    .collect(Collectors.toList());
            showSeatRepository.deleteBySeatIdIn(seatIdsToDelete); // Xóa ShowSeat liên quan
            seatRepository.deleteAll(seatsToDelete); // Xóa ghế thừa
        }
        if (!seatsToUpdate.isEmpty()) {
            seatRepository.saveAll(seatsToUpdate); // Cập nhật ghế hiện có
        }
        if (!seatsToAdd.isEmpty()) {
            seatRepository.saveAll(seatsToAdd); // Thêm ghế mới
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

    @Override
    public List<Seat> getAllSeatsByHall(String hallId) {
        // Kiểm tra xem hall có tồn tại không
        if (!hallRepository.existsById(hallId)) {
            throw new NotFoundException("Hall not found with ID: " + hallId);
        }
        // Lấy tất cả ghế của hall
        return seatRepository.findByHallId(hallId);
    }
}
