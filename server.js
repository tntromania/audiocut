const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servim fișierele statice din folderul 'public' direct la rădăcină
app.use(express.static(path.join(__dirname, 'public')));

// Creăm directoarele necesare la pornire
const dirs = ['uploads', 'processed'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Configurare Upload
const upload = multer({ dest: 'uploads/' });

// --- RUTE ---

// 1. Pagina principală (Hub-ul aplicației Audio Slicer)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Endpoint-ul de procesare API
app.post('/api/smart-cut', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Fisier lipsa' });

    const inputFile = req.file.path;
    const outputFile = path.join('processed', `cut_${Date.now()}.mp3`);

    const threshold = req.body.threshold || '-30dB'; 
    const minSilence = req.body.minSilence || '0.3';

    console.log(`[CUT] Procesez: ${req.file.originalname}`);

    ffmpeg(inputFile)
        .audioFilters(`silenceremove=stop_periods=-1:stop_duration=${minSilence}:stop_threshold=${threshold}`)
        .on('end', () => {
            console.log('[CUT] Procesare finalizată cu succes.');
            res.download(outputFile, 'tight_audio.mp3', (err) => {
                // Curățenie după download
                try {
                    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
                    setTimeout(() => { 
                        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile); 
                    }, 60000); // Lăsăm 1 minut fereastră pentru download
                } catch(e) { console.error("Eroare cleanup:", e); }
            });
        })
        .on('error', (err) => {
            console.error('[FFMPEG ERROR]', err);
            res.status(500).json({ error: 'Eroare la procesarea audio.' });
            try {
                if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
            } catch(e) {}
        })
        .save(outputFile);
});

// 3. Health check pentru Coolify
app.get('/health', (req, res) => {
    res.status(200).send('ok');
});

// Pornire Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Audio Slicer API activ pe portul ${PORT}`);
    console.log(`🔗 Destinație: https://api.creatorsmart.ro`);
});