from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'ru': 'Russian',
    'ja': 'Japanese',
    'pa': 'Punjabi'
}

@app.route('/')
def index():
    return render_template('index.html', languages=LANGUAGES)

@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text', '')
    source_lang = data.get('source', 'en')
    target_lang = data.get('target', 'hi')

    if not text.strip():
        return jsonify({'error': 'No text provided'}), 400

    try:
        url = f"https://api.mymemory.translated.net/get?q={text}&langpair={source_lang}|{target_lang}"
        response = requests.get(url)
        
        if response.status_code == 200:
            res_data = response.json()
            translated_text = res_data.get('responseData', {}).get('translatedText', '')
            return jsonify({'translated_text': translated_text})
        else:
            return jsonify({'error': 'Translation failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)