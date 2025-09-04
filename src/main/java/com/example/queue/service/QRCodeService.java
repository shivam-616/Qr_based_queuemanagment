package com.example.queue.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class QRCodeService {

    @Value("${app.base-url}")
    private String baseUrl;

    public String generateQRCodeForQueue(Long queueId) throws WriterException, IOException {
        String visitorUrl = baseUrl + "/visitor/" + queueId;
        return generateQRCode(visitorUrl, 300, 300);
    }

    public String generateQRCode(String content, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        byte[] qrCodeBytes = outputStream.toByteArray();
        
        return Base64.getEncoder().encodeToString(qrCodeBytes);
    }
}