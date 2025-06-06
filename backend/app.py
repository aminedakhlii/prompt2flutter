from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI
from embed import get_similar_files, load_code_from_files, build_prompt, get_flutter_code_with_gpt
import stripe
import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Initialize Firebase Admin
cred = credentials.Certificate("./serviceAccount.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/api/payment/create-session', methods=['POST'])
def create_payment_session():
    try:
        data = request.json
        user_id = data.get('userId')
        price_id = data.get('priceId')
        
        print(f"Creating checkout session for user {user_id} with price {price_id}")
        
        if not user_id or not price_id:
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'http://prompt2flutter.online/payment-success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url='http://prompt2flutter.online',
            metadata={
                'user_id': user_id
            }
        )
        
        if not session or not session.id:
            return jsonify({'error': 'Failed to create checkout session'}), 500
            
        return jsonify({'sessionId': session.id})
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/payment/success', methods=['GET'])
def payment_success():
    try:
        session_id = request.args.get('session_id')
        if not session_id:
            return jsonify({'error': 'No session ID provided'}), 400

        # Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status != 'paid':
            return jsonify({'error': 'Payment not completed'}), 400

        user_id = session.metadata.get('user_id')
        amount = session.amount_total / 100  # Convert from cents to dollars
        
        # Determine number of requests based on amount
        requests_to_add = 100 if amount == 9.99 else 500 if amount == 39.99 else 0
        
        if requests_to_add > 0:
            # Get user document
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if not user_doc.exists:
                return jsonify({'error': 'User document not found'}), 404

            # Get current data
            user_data = user_doc.to_dict()
            processed_sessions = user_data.get('processedSessions', [])
            
            # Check if session was already processed
            if session_id in processed_sessions:
                return jsonify({
                    'success': True,
                    'requests_added': 0,
                    'total_requests': user_data.get('remainingRequests', 0),
                    'message': 'Payment already processed'
                })
            
            # Update user document with new requests and add session to processed list
            current_requests = user_data.get('remainingRequests', 0)
            user_ref.update({
                'remainingRequests': current_requests + requests_to_add,
                'processedSessions': firestore.ArrayUnion([session_id])
            })
            
            return jsonify({
                'success': True,
                'requests_added': requests_to_add,
                'total_requests': current_requests + requests_to_add
            })
        else:
            return jsonify({'error': 'Invalid payment amount'}), 400
            
    except Exception as e:
        print(f"Error processing payment success: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/generate', methods=['POST'])
def generate_ui():
    try:
        data = request.json
        prompt = data.get('prompt')
        isDarkTheme = data.get('isDarkTheme')
        hasRoundedCorners = data.get('hasRoundedCorners')
        toEdit = data.get('toEdit')
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        similar_files = get_similar_files(prompt)
        if not similar_files:
            return jsonify({"error": "No similar files found"}), 404
        
        if toEdit != '':
            final_prompt = build_prompt(toEdit, prompt, isDarkTheme, hasRoundedCorners, True)
            flutter_code = get_flutter_code_with_gpt(final_prompt)

            return jsonify({
                'design': flutter_code,
                'status': 'success'
            })
        else:
            # Load content and generate UI
            context_code = load_code_from_files(similar_files)
            final_prompt = build_prompt(context_code, prompt, isDarkTheme, hasRoundedCorners, False)
            flutter_code = get_flutter_code_with_gpt(final_prompt)

            return jsonify({
                'design': flutter_code,
                'status': 'success'
            })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/requests', methods=['GET'])
def get_user_requests():
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({'error': 'No user ID provided'}), 400

        # Get user document
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
            
        remaining_requests = user_doc.get('remainingRequests')
        
        return jsonify({
            'success': True,
            'remainingRequests': remaining_requests
        })
    except Exception as e:
        print(f"Error getting user requests: {str(e)}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000) 