package com.example.besrc.Service;

import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.ShowInformationResponse;
import com.example.besrc.ServerResponse.ShowSeatResponse;
import com.example.besrc.requestClient.ShowRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CinemaShowService {
    MyApiResponse createShow(ShowRequest request);
    MyApiResponse updateShow(ShowRequest request, String showId);
    MyApiResponse deleteShow(String showId);
    MyApiResponse deleteShowByHallIdAndFilmId(ShowRequest request);

    List<MyApiResponse> addListShow(List<ShowRequest> request);
    ShowInformationResponse getShowInformation(String showId);
    List<ShowInformationResponse> getAllShows();
    List<ShowInformationResponse> getAllShowsByHallId(String hallId);
    List<ShowInformationResponse> getAllShowByFilmId(String filmId);
    List<ShowSeatResponse> getAllShowSeats(String showId);
}
