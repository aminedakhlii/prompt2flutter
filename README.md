# prompt2flutter

A minimalist application that generates UI designs from natural language prompts using GPT-4.

## Project Structure

```
.
├── backend/
│   ├── app.py
│   └── requirements.txt
└── frontend/
    ├── package.json
    └── src/
        └── App.js
```

## Setup Instructions

### Backend Setup

1. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Run the Flask server:
```bash
python app.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Features

- Minimalist UI design
- Real-time UI design generation using GPT-4
- Modern Material UI components
- Responsive layout
- Error handling and loading states

## Technologies Used

- Frontend: React, Material-UI, Axios
- Backend: Flask, OpenAI GPT-4
- Development: Node.js, Python 