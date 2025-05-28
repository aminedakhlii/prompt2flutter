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
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        similar_files = get_similar_files(prompt)
        if not similar_files:
            return jsonify({"error": "No similar files found"}), 404

        # Step 2: Load their content
        context_code = load_code_from_files(similar_files)

        # Step 3: Build and send prompt to GPT
        final_prompt = build_prompt(context_code, prompt)
        print(final_prompt)
        flutter_code = get_flutter_code_with_gpt(final_prompt)

        # # Call OpenAI API to generate UI design
        # response = client.chat.completions.create(
        #     model="gpt-4o",
        #     messages=[ 
        #         {"role": "system", "content": (
        #             "You are a top-tier Flutter UI/UX designer and developer. "
        #             "Generate full Dart code using the latest Flutter and Material 3 best practices. "
        #             "Create clean, minimal but visually stunning UI with animations, custom components, shadows, rounded corners, and spacing. "
        #             "Use `main()` and complete structure that works in DartPad. "
        #             "Avoid deprecated APIs. Use `ElevatedButton`, `TextFormField`, `Container`, `Column`, `Row`, `Padding`, and animations where applicable. "
        #             "Add interactivity and modern layout structure. No overly basic UIs."
        #         )},
        #         {"role": "user", "content": prompt}
        #     ]
        # )

        # # Extract the generated design
        # generated_design = response.choices[0].message.content

        # print(generated_design)

        return jsonify({
            'design': flutter_code,
            'status': 'success'
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 