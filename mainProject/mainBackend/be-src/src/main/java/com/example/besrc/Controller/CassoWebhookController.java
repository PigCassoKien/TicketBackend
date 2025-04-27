package com.example.besrc.Controller;

import com.example.besrc.Entities.*;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.*;
import com.example.besrc.ServicesImplement.PaymentServiceImplement;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("api/casso-webhook")
public class CassoWebhookController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private PaymentServiceImplement paymentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JavaMailSender mailSender;

    @GetMapping
    public String handleGetWebhook() {
        return "Webhook endpoint is active.";
    }

    @PostMapping
    @ResponseBody
    @Transactional
    public Map<String, Object> handleCassoWebhook(@RequestBody String payload) {
        System.out.println("Received webhook payload: " + payload);
        try {
            Map<String, Object> dataMap = objectMapper.readValue(payload, Map.class);

            Integer error = (Integer) dataMap.get("error");
            if (error != null && error != 0) {
                System.out.println("Webhook error: " + error);
                return Map.of("success", false, "message", "Webhook error: " + error);
            }

            List<Map<String, Object>> dataList = (List<Map<String, Object>>) dataMap.get("data");
            if (dataList == null || dataList.isEmpty()) {
                System.out.println("No data found in webhook payload");
                return Map.of("success", false, "message", "No data found");
            }

            Map<String, Object> transaction = dataList.get(0);
            String description = (String) transaction.get("description");
            String tid = (String) transaction.get("tid");

            if (description == null) {
                System.out.println("Description is null in webhook payload");
                return Map.of("success", false, "message", "Description is null");
            }

            // Kiểm tra giao dịch thử nghiệm
            if ("MA_GIAO_DICH_THU_NGHIEM".equals(tid) || description.contains("giao dich thu nghiem")) {
                System.out.println("Detected test transaction: " + tid);
                return Map.of("success", true, "message", "Test webhook processed successfully");
            }

            String orderId = extractOrderId(description);
            if (orderId == null) {
                System.out.println("No orderId found in description: " + description);
                return Map.of("success", false, "message", "No orderId found");
            }

            // Cập nhật trạng thái sử dụng PaymentService
            boolean isSuccess = error == 0;
            paymentService.updateBookingAndPaymentStatus(orderId, isSuccess);

            // Gửi thông báo nếu thanh toán thành công
            if (isSuccess) {
                sendPaymentSuccessNotification(orderId);
            }

            // Lấy lại Payment để đảm bảo trạng thái mới nhất
            Payment payment = paymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new NotFoundException("No payment found for orderId: " + orderId));

            return Map.of(
                    "success", true,
                    "message", "Webhook processed successfully",
                    "orderId", orderId,
                    "status", payment.getStatus().toString(),
                    "amount", payment.getAmount()
            );

        } catch (Exception e) {
            System.out.println("Error processing webhook: " + e.getMessage());
            return Map.of("success", false, "message", "Error processing webhook: " + e.getMessage());
        }
    }

    @PostMapping("/notify-success")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> notifyPaymentSuccess(@RequestParam("orderId") String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElse(null);
        if (payment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Không tìm thấy thanh toán cho orderId: " + orderId));
        }

        // Gửi thông báo
        sendPaymentSuccessNotification(orderId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thanh toán thành công cho orderId: " + orderId,
                "orderId", orderId,
                "amount", payment.getAmount(),
                "status", payment.getStatus().toString()
        ));
    }

    private void sendPaymentSuccessNotification(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElse(null);
        if (payment == null) {
            System.out.println("Không tìm thấy thanh toán để thông báo cho orderId: " + orderId);
            return;
        }

        // Gửi email thông báo
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(payment.getBooking().getAccount().getEmail());
            message.setSubject("Thanh toán thành công");
            message.setText("Thanh toán cho đơn hàng " + orderId + " đã thành công với số tiền: " + payment.getAmount() + " VND.");
            mailSender.send(message);
            System.out.println("Đã gửi email thông báo thanh toán thành công cho orderId: " + orderId);
        } catch (Exception e) {
            System.out.println("Lỗi khi gửi email thông báo cho orderId: " + orderId + ": " + e.getMessage());
        }
    }

    private String extractOrderId(String description) {
        String uuidPattern = "[0-9a-fA-F]{32}";
        Pattern pattern = Pattern.compile(uuidPattern);
        Matcher matcher = pattern.matcher(description);

        if (matcher.find()) {
            String rawOrderId = matcher.group();
            return rawOrderId.replaceAll(
                    "([0-9a-fA-F]{8})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{12})",
                    "$1-$2-$3-$4-$5"
            ).toLowerCase();
        }
        return null;
    }
}