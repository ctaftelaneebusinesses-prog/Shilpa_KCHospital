from flask import Flask, jsonify
from flask_cors import CORS

from admin import admin_bp
from appointments import appointments_bp
from booking import booking_bp
from config import Config
from payments import payments_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    app.register_blueprint(appointments_bp, url_prefix="/api")
    app.register_blueprint(booking_bp, url_prefix="/api/booking")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=app.config["PORT"], debug=app.config["DEBUG"])
