from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI
from embed import get_similar_files, load_code_from_files, build_prompt, get_flutter_code_with_gpt

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/api/generate', methods=['POST'])
def generate_ui():
    try:
        data = request.json
        prompt = data.get('prompt')
        isDarkTheme = data.get('isDarkTheme')
        hasRoundedCorners = data.get('hasRoundedCorners')
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        similar_files = get_similar_files(prompt)
        if not similar_files:
            return jsonify({"error": "No similar files found"}), 404

        # Step 2: Load their content
        context_code = load_code_from_files(similar_files)

        # Step 3: Build and send prompt to GPT
        final_prompt = build_prompt(context_code, prompt, isDarkTheme, hasRoundedCorners)
        print(final_prompt)
        flutter_code = get_flutter_code_with_gpt(final_prompt)

        return jsonify({
            'design': flutter_code,
            'status': 'success'
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 