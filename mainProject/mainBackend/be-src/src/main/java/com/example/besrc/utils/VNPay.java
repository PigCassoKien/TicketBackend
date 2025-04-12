package com.example.besrc.utils;

import com.example.besrc.Entities.Payment;
import jakarta.servlet.http.HttpServlet;
import org.json.JSONObject;
import com.google.gson.JsonObject;

import org.springframework.web.server.ServerErrorException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.net.DatagramSocket;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;

public class VNPay extends HttpServlet {

    private static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private static final String vnp_Version = "2.1.0";
    private static final String vnp_TmnCode = "064H1LVP";
    private static final String vnp_HashSecret = "AEQQSYJOSEUTZRKRSQSLXXVLIASCSNXM";
    private static final String vnp_Returnurl = "http://localhost/order-complete";
    private static final String vnp_apiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

    public static String create(Payment payment, String bankCode, String ip_address)
            throws ServerErrorException, IOException, NoSuchAlgorithmException {
        String vnpCommand = "pay";

        long amount = Math.round(payment.getAmount() * 100);
        String vnpTxnRef = payment.getPaymentId();

        Map<String, String> vnpParams = new TreeMap<>();

        vnpParams.put("vnp_Version", vnp_Version);
        vnpParams.put("vnp_Command", vnpCommand);
        vnpParams.put("vnp_TmnCode", vnp_TmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + bankCode);
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_BankCode", "");
        vnpParams.put("vnp_CreateDate", "");
        vnpParams.put("vnp_IpAddr", ip_address);
        vnpParams.put("vnp_ReturnUrl", vnp_Returnurl);
        vnpParams.put("vnp_ExpireDate", "");
        vnpParams.put("vnp_Bill_Mobile", "");
        vnpParams.put("vnp_Bill_Email", "");
        vnpParams.put("vnp_Bill_Fax", "");
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

        List fieldNames = new ArrayList(vnpParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator iterator = fieldNames.iterator();
        while (iterator.hasNext()) {
            String fieldName = (String) iterator.next();
            String fieldValue = vnpParams.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(fieldValue);
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (iterator.hasNext()) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = Base64.getEncoder().encodeToString(MessageDigest.getInstance("SHA256").digest(hashData.toString().getBytes(StandardCharsets.US_ASCII)));
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnp_PayUrl + "?" + queryUrl;
    }
    /*
     * Return 0 -> Payment success
     * Return 1 -> Payment is in processing or error while request
     * Return 2 -> Payment is canceled or not completed
     */
    private static String getRandomID() {
        return String.valueOf((Math.random() * (99999 - 10000)) + 10000);
    }

    private static String hmacSHA512(final String data) {
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

        calendar.setTime(payment.getCreate_at());
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
        os.writeByte(Integer.parseInt(vnp_Params.toString()));
        os.flush();
        os.close();

        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        String output;
        StringBuilder response = new StringBuilder();
        while ((output = bufferedReader.readLine()) != null) {
            response.append(output);
        }
        bufferedReader.close();

        JSONObject jsonObject = new JSONObject(response.toString());

        String res_ResponseCode = (String) jsonObject.get("vnp_ResponseCode");
        String res_TxnRef = (String) jsonObject.get("vnp_TxnRef");
        String res_Message = (String) jsonObject.get("vnp_Message");
        double res_Amount = Double.parseDouble((String) jsonObject.get("vnp_Amount")) / 100;
        String res_TransactionType = (String) jsonObject.get("vnp_TransactionType");
        String res_TransactionStatus = (String) jsonObject.get("vnp_TransactionStatus");

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
    }
}
