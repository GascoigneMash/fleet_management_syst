from flask import Flask, request, jsonify
import googlemaps
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allows cross-origin requests if frontend and backend are on different ports.

API_KEY = 'AIzaSyAVQ11b4em7asW3XQIxPjOr0yZk3qZT7hg'
gmaps = googlemaps.Client(key=API_KEY)

@app.route('/get-route', methods=['POST'])
def get_route():
    try:
        # Parse JSON request data
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        # Extract route parameters
        start = data.get('start')
        end = data.get('end')
        avoid_tolls = data.get('avoidTolls', False)
        avoid_highways = data.get('avoidHighways', False)

        if not start or not end:
            return jsonify({"error": "Start and end locations are required"}), 400

        # Prepare the avoid options list
        avoid_options = []
        if avoid_tolls:
            avoid_options.append('tolls')
        if avoid_highways:
            avoid_options.append('highways')

        # Get directions from Google Maps API
        directions_result = gmaps.directions(
            start,
            end,
            mode='driving',
            departure_time=datetime.now(),
            avoid=','.join(avoid_options) if avoid_options else None
        )

        if not directions:
            return jsonify({'error': 'No route found'}), 404

        # Process the response
        route = directions[0]
        leg = route['legs'][0]
        steps = [
            {'instruction': step['html_instructions'], 'distance': step['distance']['text']}
            for step in leg['steps']
        ]
        return jsonify({
            'summary': route['summary'],
            'distance': leg['distance']['text'],
            'duration': leg['duration']['text'],
            'steps': steps,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)