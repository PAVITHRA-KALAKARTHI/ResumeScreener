import google.generativeai as genai
import os
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
import docx
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from flask import Flask, request, jsonify
import logging
from glob import glob
import threading
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime as dt

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Setup logging with file and console output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("resume_parser.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configure Gemini API key
API_KEY = "AIzaSyAoDBhQ2NzB-KCu95Ur984zpGgFi_g1L9Q"
genai.configure(api_key=API_KEY)

# MongoDB connection
MONGO_URI = "mongodb+srv://Deepan:Interstellar143@resumedata.bpkwtpe.mongodb.net/?retryWrites=true&w=majority&appName=Resumedata"
client = MongoClient(MONGO_URI)
db = client["resume_screener"]
users_collection = db["users"]
parsed_resumes_collection = db["parsed_resumes"]

# JWT Secret Key
JWT_SECRET = "your_jwt_secret_key"

# Thread-local Gemini model for safety
thread_local = threading.local()

def get_gemini_model():
    if not hasattr(thread_local, 'model'):
        thread_local.model = genai.GenerativeModel('gemini-1.5-flash')
    return thread_local.model

# Directories for storing files
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "processed_data"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Flask app
app = Flask(__name__)

# Configure CORS to allow requests from your frontend
CORS(app, resources={r"/*": {"origins": "*"}})

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file with improved error handling"""
    try:
        reader = PdfReader(pdf_path)
        text = "".join(page.extract_text() or "" for page in reader.pages)
        return text.strip() or "No text extracted from PDF"
    except Exception as e:
        logger.error(f"PDF processing error for {pdf_path}: {str(e)}")
        return f"Error processing PDF: {str(e)}"

def extract_text_from_image(image_path):
    """Extract text from image file with OCR optimization"""
    try:
        image = Image.open(image_path).convert('RGB')
        text = pytesseract.image_to_string(image, config='--psm 6 -l eng')
        return text.strip() or "No text extracted from image"
    except Exception as e:
        logger.error(f"Image processing error for {image_path}: {str(e)}")
        return f"Error processing image: {str(e)}"

def extract_text_from_docx(docx_path):
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(docx_path)
        text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
        return text.strip() or "No text extracted from DOCX"
    except Exception as e:
        logger.error(f"DOCX processing error for {docx_path}: {str(e)}")
        return f"Error processing DOCX: {str(e)}"

def extract_text(file_path):
    """Determine file type and extract text"""
    file_extension = os.path.splitext(file_path.lower())[1]
    extractors = {
        '.pdf': extract_text_from_pdf,
        '.png': extract_text_from_image,
        '.jpg': extract_text_from_image,
        '.jpeg': extract_text_from_image,
        '.docx': extract_text_from_docx
    }
    return extractors.get(file_extension, lambda x: "Unsupported file format")(file_path)

def get_structured_resume_data(text, filename):
    """Get structured JSON from Gemini API with retry mechanism"""
    prompt = f"""
    Analyze the resume text and return a JSON object with the following structure:
    {{
        "name": "string",
        "email": "string",
        "phone": "string",
        "location": "string (City, State)",
        "summary": "string (brief professional summary)",
        "skills": ["array of skills"],
        "experience": [
            {{
                "title": "string (job title)",
                "company": "string (company name)",
                "date": "string (employment period)",
                "description": "string (job description)"
            }}
        ],
        "education": [
            {{
                "degree": "string (degree name)",
                "institution": "string (school/university name)",
                "date": "string (education period)",
                "gpa": "string (if available)"
            }}
        ],
        "projects": [
            {{
                "name": "string (project name)",
                "description": "string (project details)",
                "technologies": ["array of technologies used"]
            }}
        ],
        "certifications": ["array of certification strings"],
        "languages": ["array of language strings only human languages"],
        "social": {{
            "linkedin": "string (LinkedIn URL if available)",
            "github": "string (GitHub URL if available)",
            "twitter": "string (Twitter URL if available)",
            "leetcode": "string (LeetCode URL if available)".,
            "more_info": "string (any other relevant URLs)"
        }},
        "achievements": ["array of achievement strings"],
        "leadership": [
            {{
                "role": "string (leadership role)",
                "organization": "string (organization name)",
                "date": "string (period)",
                "achievements": ["array of achievements in this role"]
            }}
        ]
    }}

    Instructions:
    1. Extract all information exactly as shown in the structure above
    3. Use empty arrays [] for missing array fields
    5. Maintain the exact field names as shown
    7. Do not ask questions or add explanatory text
    8. Extract information only from the provided text
    9. Understand correct information and split based on labels (experience and projects and leaderships)

    Resume text:
    {text}
    """
    
    model = get_gemini_model()
    for attempt in range(3):
        try:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text)
            data["source_file"] = filename  # Ensure source_file is included
            return data
        except Exception as e:
            logger.warning(f"API attempt {attempt + 1} failed for {filename}: {str(e)}")
            if attempt == 2:
                return {"error": f"API processing failed after 3 attempts: {str(e)}", "source_file": filename}

def save_structured_data(data, filename):
    """Save structured data to a JSON file in the processed_data folder"""
    try:
        output_filename = f"{os.path.splitext(filename)[0]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        logger.info(f"Saved parsed data to {output_path}")
    except Exception as e:
        logger.error(f"Error saving parsed data for {filename}: {str(e)}")

def process_single_resume(file_path, original_filename):
    """Process a single resume, save the result, and return structured data"""
    try:
        extracted_text = extract_text(file_path)
        if "Error" in extracted_text or "Unsupported" in extracted_text:
            result = {"error": extracted_text, "source_file": original_filename}
            save_structured_data(result, original_filename)
            return result

        structured_data = get_structured_resume_data(extracted_text, original_filename)
        save_structured_data(structured_data, original_filename)  # Save the parsed data
        logger.info(f"Successfully processed {original_filename}")
        return structured_data
    except Exception as e:
        logger.error(f"Error processing {original_filename}: {str(e)}")
        result = {"error": str(e), "source_file": original_filename}
        save_structured_data(result, original_filename)
        return result

def get_latest_parsed_resume():
    """Retrieve the most recently parsed resume from processed_data"""
    try:
        json_files = glob(os.path.join(OUTPUT_DIR, "*.json"))
        if not json_files:
            logger.info("No parsed resume data available")
            return None
        latest_file = max(json_files, key=os.path.getmtime)  # Get the most recently modified file
        with open(latest_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error retrieving latest parsed resume: {str(e)}")
        return None

def get_job_recommendations(resume_data):
    """Generate job recommendations using Gemini API based on resume data"""
    try:
        if "error" in resume_data:
            return {"error": "Cannot generate recommendations due to resume parsing error"}

        # Prepare prompt for Gemini API with specific format matching frontend requirements
        prompt = f"""
        Based on the following resume data, provide exactly 5 job recommendations in JSON array format.
        Each job should have this structure:
        {{
            "title": "string (job title)",
            "company": "string (company name)",
            "location": "string (job location)",
            "description": "string (detailed job description)",
            "match_score": number (must give some score 10-100),
            "salary": "string (salary range)",
            "skills": ["array of required skills"]
        }}

        Instructions:
        1. Use the candidate's skills, experience, and education to suggest relevant jobs
        2. Include relevant skills required for each position
        3. Format as a JSON array without any additional text

        Resume data:
        {json.dumps(resume_data, indent=2)}
        """

        model = get_gemini_model()
        for attempt in range(3):
            try:
                response = model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": 0.7,
                        "response_mime_type": "application/json"
                    }
                )
                
                # Parse the response and ensure it's an array
                job_matches = json.loads(response.text)
                if not isinstance(job_matches, list):
                    raise ValueError("API did not return an array of jobs")
                
                # Format and validate each job recommendation
                formatted_matches = []
                for idx, job in enumerate(job_matches[:5]):  # Ensure exactly 5 jobs
                    formatted_job = {
                        "id": idx + 1,
                        "title": job.get("title", "Position Not Specified"),
                        "company": job.get("company", "Company Not Specified"),
                        "location": job.get("location", "Location Not Specified"),
                        "matchScore": min(100, max(0, int(float(job.get("match_score", 0))))),  # Ensure 0-100
                        "salary": job.get("salary", "Salary Not Specified"),
                        "description": job.get("description", "No description available"),
                        "skills": job.get("skills", [])
                    }
                    formatted_matches.append(formatted_job)
                
                logger.info(f"Successfully generated {len(formatted_matches)} job recommendations")
                return formatted_matches

            except Exception as e:
                logger.warning(f"Job recommendation attempt {attempt + 1} failed: {str(e)}")
                if attempt == 2:
                    return {"error": f"Failed to generate job recommendations after 3 attempts: {str(e)}"}

    except Exception as e:
        logger.error(f"Error generating job recommendations: {str(e)}")
        return {"error": str(e)}

@app.route('/parse-resumes', methods=['POST'])
def parse_resumes():
    """API endpoint to handle multiple resume uploads and return parsed data"""
    if 'files' not in request.files:
        logger.error("No files provided in request")
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist('files')
    if not files or all(not f.filename for f in files):
        logger.error("No valid files in request")
        return jsonify({"error": "No valid files provided"}), 400

    results = []
    with ThreadPoolExecutor(max_workers=min(4, os.cpu_count() or 4)) as executor:
        future_to_file = {}

        for file in files:
            if file.filename:
                filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
                file_path = os.path.join(UPLOAD_DIR, filename)
                file.save(file_path)
                future = executor.submit(process_single_resume, file_path, file.filename)
                future_to_file[future] = filename

        for future in future_to_file:
            try:
                results.append(future.result())
            except Exception as e:
                results.append({"error": str(e), "source_file": future_to_file[future]})

    return jsonify({"results": results}), 200

@app.route('/get-parsed-resume', methods=['GET'])
def get_parsed_resume():
    """API endpoint to fetch all parsed resume data with most recent first"""
    try:
        json_files = glob(os.path.join(OUTPUT_DIR, "*.json"))
        if not json_files:
            logger.info("No parsed resume data available")
            return jsonify({"error": "No parsed resume data available"}), 404

        parsed_resumes = []
        for json_file in json_files:
            try:
                file_mtime = os.path.getmtime(json_file)
                with open(json_file, 'r', encoding='utf-8') as f:
                    resume_data = json.load(f)
                    parsed_resumes.append((file_mtime, resume_data))
            except Exception as e:
                logger.error(f"Error reading {json_file}: {str(e)}")
                continue

        parsed_resumes.sort(key=lambda x: x[0], reverse=True)
        sorted_resumes = [resume[1] for resume in parsed_resumes]

        logger.info(f"Returning {len(sorted_resumes)} parsed resumes")
        return jsonify({"resumes": sorted_resumes}), 200
    except Exception as e:
        logger.error(f"Error fetching parsed resume data: {str(e)}")
        return jsonify({"error": f"Failed to fetch resume data: {str(e)}"}), 500

@app.route('/job-matches', methods=['GET'])
def get_job_matches():
    try:
        # Get resume_id from query parameter
        resume_id = request.args.get('resume_id')
        
        if (resume_id):
            # Get specific resume by ID/filename
            json_files = glob(os.path.join(OUTPUT_DIR, f"*{resume_id}*.json"))
            if not json_files:
                return jsonify({"error": "Resume not found"}), 404
            with open(json_files[0], 'r', encoding='utf-8') as f:
                resume_data = json.load(f)
        else:
            # Get the latest parsed resume (default behavior)
            resume_data = get_latest_parsed_resume()
            
        if not resume_data:
            return jsonify([]), 200
            
        job_matches = get_job_recommendations(resume_data)
        # Format the response to match the frontend interface
        formatted_matches = []
        for idx, job in enumerate(job_matches):
            formatted_job = {
                "id": idx + 1,
                "title": job.get("title", ""),
                "company": job.get("company", ""),
                "location": job.get("location", ""),
                "matchScore": int(float(job.get("match_score", 0))),
                "salary": job.get("salary", "Not specified"),
                "description": job.get("description", ""),
                "skills": job.get("skills", [])
            }
            formatted_matches.append(formatted_job)
            
        return jsonify(formatted_matches), 200
        
    except Exception as e:
        logger.error(f"Error getting job matches: {str(e)}")
        return jsonify([]), 500

@app.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        # Get the user's message from the request
        user_message = request.json.get('message', '')

        # Retrieve the latest parsed resume
        resume_data = get_latest_parsed_resume()
        if not resume_data:
            return jsonify({"reply": "No parsed resume data is available to process your query."}), 404

        # Prepare the prompt for the Gemini API
        prompt = f"""
        You are an AI assistant. Based on the following parsed resume data, answer the user's query.
        Resume data:
        {json.dumps(resume_data, indent=2)}

        User query:
        {user_message}

        Instructions:
        1. Provide a clear and concise response based on the resume data.
        2. If the query is unrelated to the resume, politely inform the user.
        3. Do not include any additional text or explanations outside the response.
        """

        # Send the prompt to the Gemini API
        model = get_gemini_model()
        for attempt in range(3):
            try:
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "text/plain"}
                )
                return jsonify({"reply": response.text.strip()}), 200
            except Exception as e:
                logger.warning(f"Gemini API attempt {attempt + 1} failed: {str(e)}")
                if attempt == 2:
                    return jsonify({"reply": "Failed to process your query. Please try again later."}), 500

    except Exception as e:
        logger.error(f"Error in chatbot endpoint: {str(e)}")
        return jsonify({"reply": "An error occurred while processing your request."}), 500

# Signup route
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        # Check if the user already exists
        if users_collection.find_one({"email": email}):
            return jsonify({"error": "User already exists"}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Save the user to the database
        users_collection.insert_one({
            "name": name,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.now()
        })

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        logger.error(f"Error in signup: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Login route
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Find the user in the database
        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        # Check the password
        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        # Generate a JWT token
        token = jwt.encode(
            {"user_id": str(user["_id"]), "exp": dt.datetime.utcnow() + dt.timedelta(hours=1)},
            JWT_SECRET,
            algorithm="HS256"
        )

        return jsonify({"message": "Login successful", "token": token}), 200
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Protected route example
@app.route('/protected', methods=['GET'])
def protected():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token is missing"}), 401

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = decoded["user_id"]
        user = users_collection.find_one({"_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"message": "Access granted", "user": user}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

if __name__ == "__main__":
    logger.info("Starting Flask application")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)