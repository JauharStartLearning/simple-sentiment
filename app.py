from flask import Flask, request, jsonify, render_template, send_from_directory
import pandas as pd
import os
import re
import json
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Konfigurasi
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'csv'}

# Buat folder upload jika belum ada
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Kamus kata untuk analisis sentimen (Bahasa Indonesia)
POSITIVE_WORDS = {
    'bagus', 'baik', 'senang', 'puas', 'mantap', 'hebat', 'luar biasa',
    'recommended', 'suka', 'menyenangkan', 'nikmat', 'enak', 'lezat',
    'cepat', 'murah', 'terjangkau', 'berkualitas', 'profesional', 'ramah',
    'membantu', 'memuaskan', 'fantastis', 'istimewa', 'wah',
    'keren', 'ok', 'oke', 'sukses', 'berhasil', 'manis', 'fresh', 'segar',
    'excellent', 'terbaik', 'sempurna', 'recommend', 'puas', 'senang',
    'happy', 'good', 'great', 'awesome', 'wonderful', 'perfect'
}

NEGATIVE_WORDS = {
    'buruk', 'jelek', 'tidak', 'jangan', 'gagal', 'kecewa', 'mengecewakan',
    'sedih', 'marah', 'kesal', 'lambat', 'mahal', 'pahit',
    'asin', 'hambar', 'basah', 'kering', 'keras', 'lembek', 'busuk',
    'rusak', 'cacat', 'sobek', 'pecah', 'kotor', 'kacau', 'berantakan',
    'ribet', 'sulit', 'rumit', 'bosan', 'lelah', 'capek', 'penat',
    'bad', 'poor', 'terrible', 'awful', 'horrible', 'disappointed',
    'slow', 'expensive', 'broken', 'damaged', 'dirty'
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def simple_sentiment_analysis(text):
    """
    Analisis sentimen sederhana berdasarkan kata positif/negatif
    """
    if not isinstance(text, str) or not text.strip():
        return "neutral", 0.0
    
    # Bersihkan teks
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    
    # Hitung kata positif dan negatif
    words = text.split()
    total_words = len(words)
    
    if total_words == 0:
        return "neutral", 0.0
    
    positive_count = sum(1 for word in words if word in POSITIVE_WORDS)
    negative_count = sum(1 for word in words if word in NEGATIVE_WORDS)
    
    # Hitung skor sentimen
    score = (positive_count - negative_count) / total_words
    
    # Tentukan sentimen
    if score > 0.1:
        return "positive", float(score)
    elif score < -0.1:
        return "negative", float(score)
    else:
        return "neutral", float(score)

@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_csv():
    """Endpoint untuk menganalisis CSV"""
    try:
        # Cek apakah file ada
        if 'csvFile' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['csvFile']
        column_name = request.form.get('columnName', '').strip()
        
        # Validasi input
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File must be CSV format'}), 400
        
        if not column_name:
            return jsonify({'error': 'Column name is required'}), 400
        
        # Simpan file sementara
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Baca file CSV
        try:
            # Coba berbagai metode pembacaan
            df = pd.read_csv(filepath, encoding='utf-8')
        except:
            try:
                df = pd.read_csv(filepath, encoding='latin-1')
            except:
                try:
                    # Coba dengan engine python yang lebih toleran
                    df = pd.read_csv(filepath, engine='python')
                except:
                    try:
                        # Coba dengan error handling lebih longgar
                        df = pd.read_csv(filepath, on_bad_lines='skip')
                    except Exception as e:
                        return jsonify({'error': f'Gagal membaca file CSV: {str(e)}'}), 400
        
        # Cek apakah kolom ada
        if column_name not in df.columns:
            return jsonify({'error': f'Column "{column_name}" not found in CSV'}), 400
        
        # Analisis sentimen untuk setiap baris
        results = []
        for i, text in enumerate(df[column_name].astype(str).fillna('')):
            sentiment, score = simple_sentiment_analysis(text)
            results.append({
                'id': i + 1,
                'text': text[:200],  # Batasi panjang teks
                'sentiment': sentiment,
                'score': score
            })
        
        # Hitung statistik
        sentiments = [r['sentiment'] for r in results]
        sentiment_counts = {
            'positive': sentiments.count('positive'),
            'negative': sentiments.count('negative'),
            'neutral': sentiments.count('neutral')
        }
        
        # Hapus file sementara
        try:
            os.remove(filepath)
        except:
            pass
        
        # Siapkan respons
        response = {
            'success': True,
            'total': len(results),
            'column_analyzed': column_name,
            'sentiment_counts': sentiment_counts,
            'results': results
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/sample')
def download_sample():
    """Endpoint untuk download contoh CSV"""
    sample_data = """review,rating,tanggal
Produk ini sangat bagus dan berkualitas tinggi,5,2024-01-01
Saya kecewa dengan pelayanannya yang lambat,2,2024-01-02
Cukup standar, tidak istimewa tapi juga tidak buruk,3,2024-01-03
Pengiriman cepat dan barang sesuai gambar,5,2024-01-04
Barang rusak saat sampai, sangat mengecewakan,1,2024-01-05
Sangat puas dengan pembelian ini, rekomended!,5,2024-01-06
Harganya terlalu mahal untuk kualitas seperti ini,2,2024-01-07
Pelayanan ramah dan helpful,4,2024-01-08
Produk biasa saja, seperti yang diharapkan,3,2024-01-09
Tidak sesuai ekspektasi, warna berbeda dengan foto,2,2024-01-10"""
    
    return sample_data, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=contoh_review.csv'
    }

if __name__ == '__main__':
    print("=" * 50)
    print("Analisis Sentimen CSV")
    print("Server berjalan di: http://localhost:5000")
    print("Contoh CSV: http://localhost:5000/sample")
    print("=" * 50)
    app.run(debug=True, port=5000)