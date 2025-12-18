document.addEventListener('DOMContentLoaded', function() {
    const csvFileInput = document.getElementById('csvFile');
    const columnNameInput = document.getElementById('columnName');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const resultsSection = document.getElementById('resultsSection');
    const tableBody = document.getElementById('tableBody');
    const messageDiv = document.getElementById('message');
    const downloadBtn = document.getElementById('downloadBtn');
    const statsContainer = document.getElementById('statsContainer');
    
    let sentimentChart = null;
    let pieChart = null;
    let analysisData = null;
    
    analyzeBtn.addEventListener('click', analyzeSentiment);
    downloadBtn.addEventListener('click', downloadResults);
    
    async function analyzeSentiment() {
        // Reset message
        clearMessage();
        
        // Validasi input
        const file = csvFileInput.files[0];
        const columnName = columnNameInput.value.trim();
        
        if (!file) {
            showError('Silakan pilih file CSV terlebih dahulu.');
            return;
        }
        
        if (!columnName) {
            showError('Silakan masukkan nama kolom yang akan dianalisis.');
            return;
        }
        
        // Validasi file extension
        if (!file.name.toLowerCase().endsWith('.csv')) {
            showError('File harus berformat CSV.');
            return;
        }
        
        // Tampilkan loading
        btnText.textContent = 'Memproses...';
        btnSpinner.style.display = 'inline-block';
        analyzeBtn.disabled = true;
        
        try {
            // Kirim data ke backend
            const formData = new FormData();
            formData.append('csvFile', file);
            formData.append('columnName', columnName);
            
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Terjadi kesalahan pada server.');
            }
            
            // Simpan data
            analysisData = result;
            
            // Tampilkan hasil
            displayResults(result);
            showSuccess(`✅ Analisis selesai! ${result.total} data diproses.`);
            
        } catch (error) {
            showError('❌ ' + error.message);
        } finally {
            // Reset button
            btnText.textContent = 'Analisis Sentimen';
            btnSpinner.style.display = 'none';
            analyzeBtn.disabled = false;
        }
    }
    
    function displayResults(result) {
        // Tampilkan section hasil
        resultsSection.style.display = 'block';
        
        // Tampilkan stats
        displayStats(result.sentiment_counts, result.total);
        
        // Isi tabel
        tableBody.innerHTML = '';
        result.results.forEach((item) => {
            const row = document.createElement('tr');
            
            // Potong teks jika terlalu panjang
            const shortText = item.text.length > 100 
                ? item.text.substring(0, 100) + '...' 
                : item.text;
            
            row.innerHTML = `
                <td>${item.id}</td>
                <td title="${item.text}">${shortText}</td>
                <td class="sentiment-${item.sentiment}">${getSentimentLabel(item.sentiment)}</td>
                <td>${item.score.toFixed(3)}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Buat chart
        createCharts(result.sentiment_counts, result.total);
        
        // Scroll ke hasil
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function displayStats(counts, total) {
        const positivePercent = ((counts.positive / total) * 100).toFixed(1);
        const negativePercent = ((counts.negative / total) * 100).toFixed(1);
        const neutralPercent = ((counts.neutral / total) * 100).toFixed(1);
        
        statsContainer.innerHTML = `
            <div class="stat-box stat-positive">
                <div class="stat-value">${counts.positive}</div>
                <div class="stat-label">Positif (${positivePercent}%)</div>
            </div>
            <div class="stat-box stat-neutral">
                <div class="stat-value">${counts.neutral}</div>
                <div class="stat-label">Netral (${neutralPercent}%)</div>
            </div>
            <div class="stat-box stat-negative">
                <div class="stat-value">${counts.negative}</div>
                <div class="stat-label">Negatif (${negativePercent}%)</div>
            </div>
        `;
    }
    
    function createCharts(counts, total) {
        const barCtx = document.getElementById('sentimentChart').getContext('2d');
        const pieCtx = document.getElementById('pieChart').getContext('2d');
        
        // Hancurkan chart sebelumnya jika ada
        if (sentimentChart) sentimentChart.destroy();
        if (pieChart) pieChart.destroy();
        
        const percentages = {
            positive: ((counts.positive / total) * 100).toFixed(1),
            negative: ((counts.negative / total) * 100).toFixed(1),
            neutral: ((counts.neutral / total) * 100).toFixed(1)
        };
        
        // Bar Chart
        sentimentChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Positif', 'Netral', 'Negatif'],
                datasets: [{
                    label: 'Jumlah',
                    data: [counts.positive, counts.neutral, counts.negative],
                    backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
                    borderColor: ['#219653', '#e67e22', '#c0392b'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percent = ((value / total) * 100).toFixed(1);
                                return `${value} data (${percent}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
        
        // Pie Chart
        pieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: [
                    `Positif (${percentages.positive}%)`,
                    `Netral (${percentages.neutral}%)`,
                    `Negatif (${percentages.negative}%)`
                ],
                datasets: [{
                    data: [counts.positive, counts.neutral, counts.negative],
                    backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
                    borderColor: ['#219653', '#e67e22', '#c0392b'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }
    
    function getSentimentLabel(sentiment) {
        const labels = {
            'positive': '✅ Positif',
            'negative': '❌ Negatif',
            'neutral': '⚪ Netral'
        };
        return labels[sentiment] || sentiment;
    }
    
    function showError(message) {
        messageDiv.textContent = message;
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
    }
    
    function showSuccess(message) {
        messageDiv.textContent = message;
        messageDiv.className = 'message success';
        messageDiv.style.display = 'block';
    }
    
    function showInfo(message) {
        messageDiv.textContent = message;
        messageDiv.className = 'message info';
        messageDiv.style.display = 'block';
    }
    
    function clearMessage() {
        messageDiv.style.display = 'none';
        messageDiv.textContent = '';
    }
    
    function downloadResults() {
        if (!analysisData || !analysisData.results) {
            showError('Tidak ada data untuk diunduh.');
            return;
        }
        
        // Buat CSV content
        let csvContent = "No,Teks,Sentimen,Skor\n";
        
        analysisData.results.forEach((item) => {
            const escapedText = `"${item.text.replace(/"/g, '""')}"`;
            const sentimentLabel = getSentimentLabel(item.sentiment).replace(/[✅❌⚪]/g, '').trim();
            csvContent += `${item.id},${escapedText},${sentimentLabel},${item.score.toFixed(3)}\n`;
        });
        
        // Buat blob dan download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
        link.setAttribute('href', url);
        link.setAttribute('download', `hasil_sentimen_${timestamp}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showInfo('📥 Hasil berhasil diunduh.');
    }
});
