import os
import sys
import json
import base64
import mimetypes
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from sarvamai import SarvamAI
from sarvamai.core.api_error import ApiError

# Ensure UTF-8 standard output
sys.stdout.reconfigure(encoding='utf-8')

# Load .env if present
env_file = Path(__file__).resolve().parent / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip().strip("'\""))

STATIC_DIR = Path(__file__).resolve().parent / "public"

def get_sarvam_client(headers=None, req_data=None):
    # 1. Environment variable
    key = os.getenv("SARVAM_API_KEY")
    if key and key.strip():
        return SarvamAI(api_subscription_key=key.strip())

    # 2. Custom header or body fallback
    custom_key = None
    if headers:
        custom_key = headers.get("X-API-Key") or headers.get("x-api-key")
    if not custom_key and req_data:
        custom_key = req_data.get("api_key")

    if custom_key and custom_key.strip():
        return SarvamAI(api_subscription_key=custom_key.strip())

    # 3. Reload .env just in case
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("SARVAM_API_KEY="):
                    val = line.strip().split("=", 1)[1].strip().strip("'\"")
                    if val:
                        os.environ["SARVAM_API_KEY"] = val
                        return SarvamAI(api_subscription_key=val)

    return None

class SarvamHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-API-Key, Authorization")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-API-Key, Authorization")
        self.end_headers()

    def do_GET(self):
        url_path = self.path.split("?")[0]

        if url_path == "/api/health":
            client = get_sarvam_client(headers=self.headers)
            self._send_json(200, {
                "status": "ok",
                "sarvam_connected": client is not None,
                "supported_languages": 23,
                "features": ["text-translate", "text-transliterate", "language-identification", "speech-to-text"]
            })
            return

        # Serve static files from public/
        if url_path in ["/", ""]:
            rel_file = "index.html"
        else:
            rel_file = url_path.lstrip("/")

        target_file = (STATIC_DIR / rel_file).resolve()
        try:
            target_file.relative_to(STATIC_DIR)
        except ValueError:
            self.send_error(403, "Access denied")
            return

        if target_file.is_file():
            mime_type, _ = mimetypes.guess_type(str(target_file))
            if not mime_type:
                mime_type = "application/octet-stream"
            if mime_type.startswith("text/") or mime_type in ["application/javascript", "application/json"]:
                mime_type += "; charset=utf-8"

            try:
                with open(target_file, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", mime_type)
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                self.send_error(500, f"Error reading file: {e}")
        else:
            self.send_error(404, "File Not Found")

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            req_data = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            self._send_json(400, {"success": False, "error": "Invalid JSON payload"})
            return

        client = get_sarvam_client(headers=self.headers, req_data=req_data)
        if not client:
            self._send_json(500, {
                "success": False,
                "error": "SARVAM_API_KEY is not configured on the server. Please add SARVAM_API_KEY to your Render environment variables or click the Key icon in the header."
            })
            return

        url_path = self.path.split("?")[0]

        if url_path == "/api/translate":
            text_input = req_data.get("input", "").strip()
            if not text_input:
                self._send_json(400, {"success": False, "error": "input text is required"})
                return

            source_lang = req_data.get("source_language_code", "auto")
            target_lang = req_data.get("target_language_code", "hi-IN")
            model = req_data.get("model", "sarvam-translate:v1")
            mode = req_data.get("mode")
            speaker_gender = req_data.get("speaker_gender")
            output_script = req_data.get("output_script")
            numerals_format = req_data.get("numerals_format")

            kwargs = {
                "input": text_input,
                "source_language_code": source_lang,
                "target_language_code": target_lang,
            }
            if model:
                kwargs["model"] = model
            if mode:
                kwargs["mode"] = mode
            if speaker_gender:
                kwargs["speaker_gender"] = speaker_gender
            if numerals_format:
                kwargs["numerals_format"] = numerals_format
            if output_script and model == "mayura:v1":
                kwargs["output_script"] = output_script

            try:
                response = client.text.translate(**kwargs)
                self._send_json(200, {
                    "success": True,
                    "translated_text": response.translated_text,
                    "source_language_code": getattr(response, "source_language_code", source_lang),
                    "target_language_code": target_lang,
                    "model_used": model,
                })
            except ApiError as e:
                self._send_json(e.status_code or 500, {"success": False, "error": str(e.body)})
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})

        elif url_path == "/api/speech-to-text":
            audio_base64 = req_data.get("audio_base64", "")
            if not audio_base64:
                self._send_json(400, {"success": False, "error": "audio_base64 is required"})
                return

            try:
                audio_bytes = base64.b64decode(audio_base64)
            except Exception as e:
                self._send_json(400, {"success": False, "error": f"Invalid base64 audio: {e}"})
                return

            mime_type = req_data.get("mime_type", "audio/webm")
            language_code = req_data.get("language_code", "unknown")
            model = req_data.get("model", "saaras:v3")

            ext = "webm"
            if "wav" in mime_type:
                ext = "wav"
            elif "mp3" in mime_type or "mpeg" in mime_type:
                ext = "mp3"
            elif "ogg" in mime_type or "opus" in mime_type:
                ext = "ogg"
            elif "mp4" in mime_type or "m4a" in mime_type:
                ext = "mp4"

            try:
                stt_kwargs = {
                    "file": (f"audio.{ext}", audio_bytes, mime_type),
                    "model": model,
                }
                if language_code:
                    stt_kwargs["language_code"] = language_code

                response = client.speech_to_text.transcribe(**stt_kwargs)
                self._send_json(200, {
                    "success": True,
                    "transcript": response.transcript,
                    "detected_language_code": response.language_code,
                    "model_used": model
                })
            except ApiError as e:
                self._send_json(e.status_code or 500, {"success": False, "error": str(e.body)})
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})

        elif url_path == "/api/transliterate":
            text_input = req_data.get("input", "").strip()
            if not text_input:
                self._send_json(400, {"success": False, "error": "input text is required"})
                return

            source_lang = req_data.get("source_language_code", "en-IN")
            target_lang = req_data.get("target_language_code", "hi-IN")
            numerals_format = req_data.get("numerals_format")

            kwargs = {
                "input": text_input,
                "source_language_code": source_lang,
                "target_language_code": target_lang,
            }
            if numerals_format:
                kwargs["numerals_format"] = numerals_format

            try:
                response = client.text.transliterate(**kwargs)
                self._send_json(200, {
                    "success": True,
                    "transliterated_text": response.transliterated_text,
                    "source_language_code": source_lang,
                    "target_language_code": target_lang,
                })
            except ApiError as e:
                self._send_json(e.status_code or 500, {"success": False, "error": str(e.body)})
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})

        elif url_path == "/api/identify":
            text_input = req_data.get("input", "").strip()
            if not text_input:
                self._send_json(400, {"success": False, "error": "input text is required"})
                return

            try:
                response = client.text.identify_language(input=text_input)
                self._send_json(200, {
                    "success": True,
                    "language_code": response.language_code,
                    "script_code": response.script_code,
                })
            except ApiError as e:
                self._send_json(e.status_code or 500, {"success": False, "error": str(e.body)})
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})

        else:
            self.send_error(404, "Endpoint not found")

def run(port=8000):
    server_address = ("0.0.0.0", port)
    httpd = ThreadingHTTPServer(server_address, SarvamHandler)
    print(f"🚀 Sarvam Indic Studio Server running on port {port} (http://localhost:{port})")
    httpd.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run(port)
