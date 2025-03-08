package com.example.besrc.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtils {

    public static String getDateAfter(int hours) {
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime dateTimeAfterTwoHours = currentDateTime.plusHours(hours);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String dateString = dateTimeAfterTwoHours.format(formatter);
        return dateString;
    }

    public static Boolean YourDateIsGreaterThanNow(String date, int hours_to_compare) {
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime dateTimeAfter = currentDateTime.plusHours(hours_to_compare);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        LocalDateTime parsedDateTime = LocalDateTime.parse(date, formatter);

        if (dateTimeAfter.isBefore(parsedDateTime))
            return true;
        return false;
    }

    public static LocalDateTime convertStringDateToDate(String dateString, String pattern) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            return LocalDateTime.parse(dateString, formatter);
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format: " + dateString);
        }
    }

    public static LocalDateTime convertStringDateToDate(String dateString) {
        try {
            return LocalDateTime.parse(dateString); // ISO-8601 mặc định
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format: " + dateString);
        }
    }

}
