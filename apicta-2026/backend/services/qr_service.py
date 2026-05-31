import qrcode
import os
import base64
from io import BytesIO
from PIL import Image

class QRService:
    @staticmethod
    def generate_qr(data, filename=None):
        """Generate a QR code for the given data"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        if filename:
            img.save(filename)
            return filename
        
        # Return as base64 for API response
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    
    @staticmethod
    def generate_qr_for_registration(registration_id, email, registration_type):
        """Generate QR code for a registration"""
        data = f"APICTA2026|{registration_id}|{email}|{registration_type}"
        return QRService.generate_qr(data)
