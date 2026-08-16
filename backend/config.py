import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    WHATSAPP_NUMBER = os.getenv("WHATSAPP_NUMBER", "918090905900")
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    PORT = int(os.getenv("PORT", "5000"))

    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
    RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

    APPOINTMENT_HOLD_MINUTES = int(os.getenv("APPOINTMENT_HOLD_MINUTES", "10"))
    CONSULTATION_FEE_INR = float(os.getenv("CONSULTATION_FEE_INR", "500"))

    # Clinic notifications (sent on every successful payment)
    CLINIC_NOTIFY_PHONE = os.getenv("CLINIC_NOTIFY_PHONE", "")
    CLINIC_NOTIFY_EMAIL = os.getenv("CLINIC_NOTIFY_EMAIL", "")

    # Resend (used to email both the clinic and the patient). Gmail SMTP
    # doesn't work from Railway - its network hangs on outbound SMTP - so
    # notifications go through Resend's HTTPS API instead.
    RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
    RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "")

    # Twilio (WhatsApp + SMS + voice call)
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_SMS_NUMBER = os.getenv("TWILIO_SMS_NUMBER", "")
    TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "")
    TWILIO_VOICE_NUMBER = os.getenv("TWILIO_VOICE_NUMBER", "")
    PATIENT_CONFIRMATION_CALL = os.getenv("PATIENT_CONFIRMATION_CALL", "true").lower() == "true"
