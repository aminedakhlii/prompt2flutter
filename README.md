# Prompt2Flutter

A minimalist application that generates Flutter UI designs from natural language prompts using o3-mini. The generated code is based on a curated collection of Flutter widgets and pages from the [Flutter Boilerplate](https://github.com/IkramKhan-DevOps/flutter_boilerplate) project.

## Project Structure

```
.
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── embed.py
│   └── lib/
│       ├── widgets/     # Reusable Flutter widgets from Flutter Boilerplate
│       └── pages/       # Pre-built Flutter pages from Flutter Boilerplate
└── frontend/
    ├── package.json
    └── src/
        └── App.js
```

## Features

- **AI-Powered UI Generation**: Convert natural language prompts into Flutter code using GPT-4
- **Modern UI Components**: Generates code using Material 3 and modern Flutter best practices
- **Code Export Options**: 
  - Copy generated code to clipboard
  - Download code as a .dart file
- **Dark Mode UI**: Cyberpunk-inspired dark theme with purple accents
- **Responsive Design**: Works seamlessly across different screen sizes
- **Error Handling**: Robust error handling and loading states

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

4. Run the embedding script to prepare the Flutter components:
```bash
python embed.py --embed
```

5. Run the Flask server:
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
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

1. Enter your UI design prompt in the text field (e.g., "Create a modern login page with email and password fields")
2. Click "Generate Design" to create the Flutter code
3. Use the "Copy Code" button to copy the generated code to your clipboard
4. Or use the "Download Code" button to save the code as a .dart file

## Technologies Used

- **Frontend**: 
  - React
  - Material-UI
  - Axios
- **Backend**: 
  - Flask
  - OpenAI o3-mini
  - Flutter Boilerplate components
- **Development**: 
  - Node.js
  - Python

## Credits

This project uses components and best practices from the [Flutter Boilerplate](https://github.com/IkramKhan-DevOps/flutter_boilerplate) project, which provides a feature-rich starting point for Flutter applications.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details. 