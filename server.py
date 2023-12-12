from flask import Flask, render_template
from flask_headers import headers
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
@app.route('/')
@headers({'Cross-Origin-Opener-Policy': 'same-origin','Cross-Origin-Embedder-Policy': 'require-corp',})
def index():
    return render_template('index.html')

@app.route('/worker.js')
@headers({'Cross-Origin-Opener-Policy': 'same-origin','Cross-Origin-Embedder-Policy': 'require-corp',})
def worker():
    return app.send_static_file('js/worker.js')

@app.route('/worker2.js')
@headers({'Cross-Origin-Opener-Policy': 'same-origin','Cross-Origin-Embedder-Policy': 'require-corp',})
def worker2():
    return app.send_static_file('js/worker2.js')

if __name__ == '__main__':
    app.run(debug=True)