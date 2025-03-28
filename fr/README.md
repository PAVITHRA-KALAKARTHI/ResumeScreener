
# Resume Parser and Analyzer

A modern web application for parsing, analyzing and extracting information from resumes using AI. This application provides a beautiful UI for resume analysis and job matching.

## Features

- Resume upload and parsing
- AI-powered resume information extraction
- Visual resume analytics
- Job matching and recommendations
- Interactive chat assistant
- Camera and voice input support

## Frontend-Backend Connection Guide

### API Integration Points

The frontend and backend connect at these key points:

1. **Resume Parsing** - `src/services/api.ts` contains the `parseResumes()` function that sends resume files to the backend
2. **Resume Data Retrieval** - `getParsedResumes()` function in `api.ts` retrieves processed resume data
3. **Job Recommendations** - The Jobs page fetches job matches from the `/job-matches` endpoint

### Connection Steps

1. **Start the Backend Server**
   - Run your Flask application (`python app.py`)
   - Ensure it's running on `http://localhost:5000` (or update the frontend's API URLs)

2. **Configure CORS on Backend**
   - Make sure your Flask app has CORS enabled to accept requests from the frontend

3. **Test the Integration**
   - Upload a resume in the frontend
   - Check the backend logs to confirm receipt
   - Verify the parsed results appear in the frontend

### Backend Setup

1. Install the required Python packages:
```bash
pip install flask flask-cors google-generativeai pypdf2 pillow pytesseract python-docx
```

2. Install Tesseract OCR (required for image processing):
   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - Mac: `brew install tesseract`
   - Linux: `sudo apt install tesseract-ocr`

3. Set your Gemini API key in the Flask application:
```python
import os
os.environ["GOOGLE_API_KEY"] = "your-gemini-api-key"
```

4. Run the Flask application:
```bash
python app.py
```

### Required Backend API Endpoints

The frontend expects these endpoints to be available on the backend:

1. **POST /parse-resumes**
   - Accepts uploaded resume files (PDF, DOCX, images)
   - Returns parsed resume data in JSON format

2. **GET /get-parsed-resume**
   - Returns the most recently parsed resume data
   - Format must match the `ParsedResume` interface in `api.ts`

3. **GET /job-matches**
   - Returns job recommendations based on the parsed resume
   - Format should match the `Job` interface in `Jobs.tsx`

### Sample Backend Code

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
# ... other imports

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/parse-resumes', methods=['POST'])
def parse_resumes():
    # Get files from request
    files = request.files.getlist('files')
    
    # Process files and extract text
    # Use Gemini API to parse resume content
    # Return structured resume data
    
    return jsonify({"message": "Resume parsed successfully", "resume": parsed_data})

@app.route('/get-parsed-resume', methods=['GET'])
def get_parsed_resume():
    # Return the most recently parsed resume data
    return jsonify({"resumes": [saved_resume_data]})

@app.route('/job-matches', methods=['GET'])
def get_job_matches():
    # Generate or retrieve job matches based on the parsed resume
    # Return job recommendations
    return jsonify(job_matches)

if __name__ == '__main__':
    app.run(debug=True)
```

## Frontend Development

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation
- Tanstack Query for data fetching

### Backend
- Python Flask
- Google Generative AI (Gemini)
- OCR with Tesseract
- Document parsing libraries (PyPDF2, docx)

## License

MIT
