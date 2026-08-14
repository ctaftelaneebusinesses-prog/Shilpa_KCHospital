import logging
import smtplib
import socket
import threading
from email.mime.text import MIMEText
from xml.sax.saxutils import escape

from flask import current_app
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client as TwilioClient

from settings import get_consultation_fee
from slots import appointment_time_label

logger = logging.getLogger(__name__)


class _IPv4SMTP(smtplib.SMTP):
    """Railway's outbound networking prefers IPv6, which currently has no
    working route to smtp.gmail.com and fails with "Network is unreachable".
    Forcing the socket connection to an IPv4 address works around that while
    still validating TLS against the original hostname."""

    def _get_socket(self, host, port, timeout):
        addr_info = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        return socket.create_connection(addr_info[0][4], timeout, self.source_address)


def _to_e164(phone: str) -> str:
    phone = (phone or "").strip()
    if phone.startswith("+"):
        return phone
    if len(phone) == 10:
        return f"+91{phone}"
    return phone


def _twilio_client():
    sid = current_app.config["TWILIO_ACCOUNT_SID"]
    token = current_app.config["TWILIO_AUTH_TOKEN"]
    if not sid or not token:
        logger.warning("Twilio not configured; skipping message.")
        return None
    return TwilioClient(sid, token)


def _send_email_blocking(host, port, user, password, from_addr, to_email, message) -> None:
    try:
        with _IPv4SMTP(host, port, timeout=8) as server:
            server.starttls()
            server.login(user, password)
            server.sendmail(from_addr, [to_email], message.as_string())
    except Exception:
        logger.exception("Failed to send email to %s", to_email)


def send_email(to_email: str, subject: str, body: str) -> None:
    """Fires the SMTP send on a background daemon thread. Gmail SMTP has been
    observed to hang (not just fail) from Railway's network, and blocking the
    request thread on that risks the whole booking/payment request timing out
    and getting killed by gunicorn - a failed notification must never cost a
    patient their booking."""
    host = current_app.config["SMTP_HOST"]
    user = current_app.config["SMTP_USER"]
    password = current_app.config["SMTP_PASSWORD"]
    from_addr = current_app.config["SMTP_FROM"] or user
    port = current_app.config["SMTP_PORT"]

    if not to_email:
        return
    if not (host and user and password):
        logger.warning("SMTP not configured; skipping email to %s", to_email)
        return

    message = MIMEText(body)
    message["Subject"] = subject
    message["From"] = from_addr
    message["To"] = to_email

    threading.Thread(
        target=_send_email_blocking,
        args=(host, port, user, password, from_addr, to_email, message),
        daemon=True,
    ).start()


def send_whatsapp(to_phone: str, body: str) -> None:
    if not to_phone:
        return
    from_number = current_app.config["TWILIO_WHATSAPP_NUMBER"]
    client = _twilio_client()
    if not client or not from_number:
        return
    try:
        client.messages.create(
            to=f"whatsapp:{_to_e164(to_phone)}", from_=f"whatsapp:{from_number}", body=body
        )
    except TwilioRestException:
        logger.exception("Failed to send WhatsApp message to %s", to_phone)


def make_call(to_phone: str, spoken_message: str) -> None:
    if not to_phone:
        return
    from_number = current_app.config["TWILIO_VOICE_NUMBER"] or current_app.config["TWILIO_SMS_NUMBER"]
    client = _twilio_client()
    if not client or not from_number:
        return
    twiml = f"<Response><Say>{escape(spoken_message)}</Say></Response>"
    try:
        client.calls.create(to=_to_e164(to_phone), from_=from_number, twiml=twiml)
    except TwilioRestException:
        logger.exception("Failed to place confirmation call to %s", to_phone)


def notify_payment_success(appointment: dict, payment: dict) -> None:
    """Fires clinic (WhatsApp + Email) and patient (Email + WhatsApp + call)
    notifications for a just-confirmed, paid appointment. Each channel fails
    independently and only logs, so one broken integration never blocks the
    others or the payment response itself."""
    patient_name = appointment["patient_name"]
    patient_phone = appointment["patient_phone"]
    patient_email = appointment.get("patient_email")
    appointment_date = appointment["appointment_date"]
    time_label = appointment_time_label(appointment)
    when = f"{appointment_date} at {time_label}" if time_label else appointment_date
    amount = payment.get("amount") if payment else get_consultation_fee()

    clinic_phone = current_app.config["CLINIC_NOTIFY_PHONE"]
    clinic_email = current_app.config["CLINIC_NOTIFY_EMAIL"]

    clinic_message = (
        f"New paid appointment - Dr. Shilpa (KC Hospital, Kuppam)\n"
        f"Patient: {patient_name}\n"
        f"Phone: {patient_phone}\n"
        f"Date: {when}\n"
        f"Amount paid: Rs. {amount}"
    )
    patient_message = (
        f"Hi {patient_name}, your appointment with Dr. Shilpa (KC Hospital, Kuppam) is "
        f"confirmed for {when}. Payment of Rs. {amount} "
        f"received. See you soon!"
    )

    send_whatsapp(clinic_phone, clinic_message)
    send_email(clinic_email, "New paid appointment - Dr. Shilpa", clinic_message)

    send_email(patient_email, "Your appointment is confirmed - Dr. Shilpa", patient_message)
    send_whatsapp(patient_phone, patient_message)
    if current_app.config["PATIENT_CONFIRMATION_CALL"]:
        make_call(
            patient_phone,
            f"Hello {patient_name}. This is a confirmation call from Doctor Shilpa's clinic. "
            f"Your appointment is confirmed for {when}. Thank you.",
        )


def notify_free_booking(appointment: dict) -> None:
    """Same channels as notify_payment_success, but for a booking that was
    confirmed immediately because the admin has set the consultation fee to
    zero (no payment step)."""
    patient_name = appointment["patient_name"]
    patient_phone = appointment["patient_phone"]
    patient_email = appointment.get("patient_email")
    appointment_date = appointment["appointment_date"]
    time_label = appointment_time_label(appointment)
    when = f"{appointment_date} at {time_label}" if time_label else appointment_date

    clinic_phone = current_app.config["CLINIC_NOTIFY_PHONE"]
    clinic_email = current_app.config["CLINIC_NOTIFY_EMAIL"]

    clinic_message = (
        f"New free appointment - Dr. Shilpa (KC Hospital, Kuppam)\n"
        f"Patient: {patient_name}\n"
        f"Phone: {patient_phone}\n"
        f"Date: {when}"
    )
    patient_message = (
        f"Hi {patient_name}, your appointment with Dr. Shilpa (KC Hospital, Kuppam) is "
        f"confirmed for {when}. This consultation is free "
        f"of charge. See you soon!"
    )

    send_whatsapp(clinic_phone, clinic_message)
    send_email(clinic_email, "New free appointment - Dr. Shilpa", clinic_message)

    send_email(patient_email, "Your appointment is confirmed - Dr. Shilpa", patient_message)
    send_whatsapp(patient_phone, patient_message)
    if current_app.config["PATIENT_CONFIRMATION_CALL"]:
        make_call(
            patient_phone,
            f"Hello {patient_name}. This is a confirmation call from Doctor Shilpa's clinic. "
            f"Your appointment is confirmed for {when}. Thank you.",
        )
