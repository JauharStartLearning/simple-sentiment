📊 Analisis Sentimen dari File CSV
Aplikasi web sederhana untuk menganalisis sentimen dari data teks dalam file CSV. Menggunakan Flask backend dan frontend JavaScript dengan visualisasi chart.

✨ Fitur
📁 Upload file CSV

🔤 Pilih kolom teks untuk dianalisis

🎯 Analisis sentimen sederhana (Positif/Negatif/Netral)

📊 Visualisasi dengan Chart.js (Bar Chart & Pie Chart)

📋 Tampilan hasil dalam tabel

📥 Download hasil analisis sebagai CSV

📱 Responsive design

🚀 Cara Menjalankan
Prasyarat
Python 3.7+

pip (Python package manager)

Langkah 1: Clone/Download Project
bash
git clone [repository-url]
cd sentimen
Langkah 2: Install Dependencies
bash
pip install flask pandas
Langkah 3: Jalankan Aplikasi
bash
python app.py
Langkah 4: Buka Browser
Buka: http://localhost:5000

📁 Struktur File
text
sentimen/
├── app.py                 # Backend Flask
├── static/
│   ├── script.js         # Frontend JavaScript
│   └── chart.js          # Library Chart.js (opsional)
├── templates/
│   └── index.html        # Halaman utama
└── uploads/              # Folder untuk file upload (auto-create)
🎮 Cara Menggunakan
Upload File CSV

Klik "Download Contoh CSV" untuk mendapatkan template

Atau gunakan file CSV Anda sendiri

Tentukan Kolom

Masukkan nama kolom yang berisi teks (contoh: review, komentar, feedback)

Analisis

Klik tombol "Analisis Sentimen"

Tunggu proses selesai

Lihat Hasil

Chart distribusi sentimen

Pie chart persentase

Tabel detail dengan skor sentimen

Download hasil sebagai CSV

📝 Format CSV yang Didukung
Contoh format CSV:

csv
review,rating
"Produk bagus, pengiriman cepat",5
"Kualitas biasa saja",3
"Tidak sesuai harapan, kecewa",1
Catatan penting:

Jika teks mengandung koma, wrap dengan quotes (")

Pastikan semua baris memiliki jumlah kolom yang sama

Encoding: UTF-8 atau Latin-1

🛠️ Teknologi
Backend:

Flask (Python web framework)

Pandas (data processing)

Frontend:

HTML5, CSS3, JavaScript

Chart.js (data visualization)

Analisis Sentimen:

Lexicon-based (kamus kata positif/negatif Bahasa Indonesia)

Skor: -1 (negatif) sampai 1 (positif)

🔧 Customization
Menambah Kata Sentimen
Edit file app.py bagian:

python
POSITIVE_WORDS = {'bagus', 'baik', ...}  # Tambah kata positif
NEGATIVE_WORDS = {'buruk', 'jelek', ...} # Tambah kata negatif
Mengubah Tampilan
CSS: Edit style di templates/index.html

Chart: Edit fungsi chart di static/script.js

Layout: Modifikasi HTML di templates/index.html

⚠️ Troubleshooting
Masalah	Solusi
Port 5000 sudah digunakan	Ganti port di app.py: app.run(port=5001)
Error membaca CSV	Pastikan format CSV benar, gunakan contoh
Chart tidak muncul	Coba refresh dengan Ctrl+F5
File terlalu besar	Batasi maksimal 10MB
Kolom tidak ditemukan	Periksa nama kolom (case-sensitive)
📄 License
Projek open-source untuk keperluan edukasi.

👥 Kontribusi
Pull request dipersilakan! Untuk perubahan besar, buka issue terlebih dahulu.

🙏 Credits
Dibuat dengan ❤️ untuk analisis sentimen sederhana.

Tips: Untuk hasil analisis yang lebih akurat, pertimbangkan untuk mengganti fungsi simple_sentiment_analysis dengan library NLP seperti TextBlob atau NLTK.

Support: Jika ada masalah, buka issue di repository atau kontak developer.
