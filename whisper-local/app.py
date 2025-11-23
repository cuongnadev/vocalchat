from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import shutil
import os
import uuid

app = FastAPI()

# Load model (tiny | base | small | medium | large-v3)
model = WhisperModel("large-v3", device="cpu", compute_type="int8")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "..", "server", "uploads", "audio")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_filename = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.webm")

    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    segments, info = model.transcribe(temp_filename)

    text = " ".join([segment.text for segment in segments])

    os.remove(temp_filename)

    return {"text": text.strip()}

# To run the app, use the command:  uvicorn app:app --host 0.0.0.0 --port 8000 --reload
