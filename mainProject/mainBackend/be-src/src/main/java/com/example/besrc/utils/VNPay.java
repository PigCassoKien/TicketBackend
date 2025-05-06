package com.example.besrc.utils;

import com.example.besrc.Entities.Payment;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServlet;
import org.json.JSONObject;
import org.springframework.web.server.ServerErrorException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.DatagramSocket;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;

public class VNPay extends HttpServlet {

    private static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private static final String vnp_Version = "2.1.0";
    private static final String vnp_TmnCode = "S9J1L8QI";
    private static final String vnp_HashSecret = "BI2UVPUUVRBTZTTBWO56PB48OZBUT37A";
    private static final String vnp_Returnurl = "https://localhost:8080/api/payment/order-complete";
    private static final String vnp_apiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

    public static String getVnp_TmnCode() {
        return vnp_TmnCode;
    }
    public static String create(Payment payment, String bankCode, String ip_address)
            throws ServerErrorException, IOException, NoSuchAlgorithmException {
        String vnpCommand = "pay";

        long amount = Math.round(payment.getAmount() * 100);
        String vnpTxnRef = payment.getPaymentId();

        if (amount <= 0 || vnpTxnRef == null) {
            throw new IllegalArgumentException("Invalid payment details");
        }

        Map<String, String> vnpParams = new TreeMap<>();

        vnpParams.put("vnp_Version", vnp_Version);
        vnpParams.put("vnp_Command", vnpCommand);
        vnpParams.put("vnp_TmnCode", vnp_TmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + vnpTxnRef);
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_IpAddr", ip_address != null ? ip_address : "127.0.0.1");
        vnpParams.put("vnp_ReturnUrl", vnp_Returnurl);
        vnpParams.put("vnp_OrderType", "other");

        if (bankCode != null && !bankCode.isEmpty() && !bankCode.equals("VNPAY")) {
            vnpParams.put("vnp_BankCode", bankCode);
        }
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = simpleDateFormat.format(calendar.getTime());
        vnpParams.put("vnp_CreateDate", vnp_CreateDate);

        calendar.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = simpleDateFormat.format(calendar.getTime());
        vnpParams.put("vnp_ExpireDate", vnp_ExpireDate);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<Map.Entry<String, String>> iterator = vnpParams.entrySet().iterator();
        boolean first = true;
        while (iterator.hasNext()) {
            Map.Entry<String, String> entry = iterator.next();
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {

                if (!first) {
                    hashData.append("&");
                    query.append("&");
                }
                hashData.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                first = false;

            }
        }
        String vnp_SecureHash = hmacSHA512(hashData.toString());

        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        return vnp_PayUrl + "?" + query.toString();
    }
    /*
     * Return 0 -> Payment success
     * Return 1 -> Payment is in processing or error while request
     * Return 2 -> Payment is canceled or not completed
     */
    private static String getRandomID() {
        return String.valueOf((Math.random() * (99999 - 10000)) + 10000);
    }

    public static String hmacSHA512(final String data) {
        try {

            if (data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = VNPay.vnp_HashSecret.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception ex) {
            return "";
        }
    }
    public static Integer verifyPayment(Payment payment) throws ServerErrorException, IOException, NoSuchAlgorithmException {
        String vnp_RequestId = payment.getPaymentId() + getRandomID();
        String vnp_Command = "querydr";
        String vnp_TxnRef = payment.getPaymentId();
        String vnp_OrderInfo = "Check the bill " + vnp_TxnRef;

        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = simpleDateFormat.format(calendar.getTime());

        calendar.setTime(payment.getCreateAt());
        String vnp_ExpireDate = simpleDateFormat.format(calendar.getTime());
        String vnp_IpAddress = "127.0.0.1";

        try (final DatagramSocket socket = new DatagramSocket()) {
            socket.connect(java.net.InetAddress.getByName("8.8.8.8"), 10002);
            vnp_IpAddress = socket.getLocalAddress().getHostAddress();
        }

        JsonObject vnp_Params = new JsonObject();

        vnp_Params.addProperty("vnp_RequestId", vnp_RequestId);
        vnp_Params.addProperty("vnp_Version", vnp_Version);
        vnp_Params.addProperty("vnp_Command", vnp_Command);
        vnp_Params.addProperty("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.addProperty("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.addProperty("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.addProperty("vnp_TransactionDate", vnp_ExpireDate);
        vnp_Params.addProperty("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.addProperty("vnp_IpAddr", vnp_IpAddress);

        String hash_Data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TxnRef
                + "|" + vnp_ExpireDate + "|" + vnp_CreateDate + "|" + vnp_IpAddress + "|" + vnp_OrderInfo;
        String vnp_SecureHash = hmacSHA512(hash_Data);

        vnp_Params.addProperty("vnp_SecureHash", vnp_SecureHash);

        URL url = new URL(vnp_apiUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Content-Length", String.valueOf(vnp_Params.toString().length()));
        connection.setDoOutput(true);
        DataOutputStream os = new DataOutputStream(connection.getOutputStream());
        os.write(vnp_Params.toString().getBytes(StandardCharsets.UTF_8));
        os.flush();
        os.close();

        BufferedReader bufferedReader;
        int responseCode = connection.getResponseCode();
        if (responseCode >= 200 && responseCode <= 300) {
            bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        } else {
            bufferedReader = new BufferedReader(new InputStreamReader(connection.getErrorStream()));
        }

        String output;
        StringBuilder response = new StringBuilder();
        while ((output = bufferedReader.readLine()) != null) {
            response.append(output);
        }
        bufferedReader.close();

        if (responseCode >= 200 && responseCode < 300) {
            JSONObject jsonObject = new JSONObject(response.toString());

            String res_ResponseCode = jsonObject.optString("vnp_ResponseCode", "99");
            String res_TxnRef = jsonObject.optString("vnp_TxnRef", "");
            String res_Message = jsonObject.optString("vnp_Message", "Unknown Error");

            double res_Amount = 0.0;
            if (jsonObject.has("vnp_Amount")) {
                try {
                    res_Amount = Double.parseDouble(jsonObject.getString("vnp_Amount"));
                } catch ( NumberFormatException e) {
                    res_Amount = 0.0;
                }
            }

            String res_TransactionType = jsonObject.optString("vnp_TransactionType", "");
            String res_TransactionStatus = jsonObject.optString("vnp_TransactionStatus", "");

            if (!res_ResponseCode.equals("00")) // Response Code invaild
                return 1;

            if (!res_TxnRef.equals(payment.getPaymentId())) // Payment ID not equal
                return 1;

            if (res_Amount != payment.getAmount()) // Amount payment not equal
                return 2;

            if (!res_TransactionType.equals("01")) // Transaction Type invaild
                return 2;

            if (res_TransactionStatus.equals("01")) // Transaction is pending
                return 1;

            if (!res_TransactionStatus.equals("00")) // Transaction Status invaild
                return 2;

            return 0;
        } else {
            return 1;
        }
    }
}
