# AI Product Feedback Analyzer

A beginner-friendly full-stack web application built for BTech students, product managers, and founders to classify customer feedback, extract features, detect sentiment, and generate product insights.

---

## 📁 Directory Structure

```
AI-Product-Feedback-Analyzer/
├── app.py                  # Python Flask server & REST API endpoints
├── requirements.txt        # Python package dependencies
├── .env                    # Environment variables (Port, API Keys)
├── templates/
│   └── index.html          # Responsive HTML dashboard layout
├── static/
│   ├── style.css           # Modern dark mode CSS styling & glassmorphism
│   └── script.js           # Client-side JavaScript & Chart.js charts
├── database/
│   └── feedback.db         # SQLite database (auto-generated)
└── README.md               # Setup and project documentation
```

---

## 🛠️ Tech Stack

- **Backend**: Python, Flask, SQLite (`sqlite3`)
- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+), Chart.js, Lucide Icons
- **AI Integration**: AI API for Natural-Language Processing (Sentiment, Classification, Feature & Issue Extraction)

---

## 🚀 How to Run Locally

### 1. Set Up Python Virtual Environment (Recommended)

```bash
# Navigate into the project folder
cd AI-Product-Feedback-Analyzer

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the Flask Application

```bash
python app.py
```

Open your browser and visit: `http://127.0.0.1:5000`

---

## 🎯 Features Checklist

- [x] Responsive Dashboard UI with Sidebar Navigation
- [x] Flask REST API backend
- [x] SQLite database schema auto-initialization (`database/feedback.db`)
- [x] Feedback submission form & list feed
- [x] Chart.js sentiment and category visual analytics
- [ ] AI NLP sentiment analysis & feature extraction API integration (Next Phase)
