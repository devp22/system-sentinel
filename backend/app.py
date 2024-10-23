# backend/app.py
from flask import Flask, jsonify
from flask_restful import Api

app = Flask(__name__)
api = Api(app)

@app.route('/api/cpu', methods=['GET'])
def get_cpu_usage():
    cpu_data = {"usage": 15}
    return jsonify(cpu_data)

if __name__ == '__main__':
    app.run(debug=True)
