const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// CONFIGURARE FFMPEG (pe Linux nu mai trebuie să setăm calea explicit)
// ffmpeg va fi găsit automat în sistem

// UPLOAD
const upload = multer({ dest: 'uploads/' });

// Creăm directoarele dacă nu există
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('processed')) fs.mkdirSync('processed');

// Servim index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/smart-cut', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Fisier lipsa' });

    const inputFile = req.file.path;
    const outputFile = path.join('processed', `cut_${Date.now()}.mp3`);

    // PARAMETRI PRIMIȚI DIN INTERFAȚĂ
    const threshold = req.body.threshold || '-30dB'; 
    const minSilence = req.body.minSilence || '0.3';

    console.log(`[CUT] Procesez: ${req.file.originalname}`);
    console.log(`[SETTINGS] Threshold: ${threshold} | Keep Max: ${minSilence}s`);

    ffmpeg(inputFile)
        .audioFilters(`silenceremove=stop_periods=-1:stop_duration=${minSilence}:stop_threshold=${threshold}`)
        .on('end', () => {
            console.log('[CUT] Gata!');
            res.download(outputFile, 'tight_audio.mp3', (err) => {
                try {
                    fs.unlinkSync(inputFile);
                    setTimeout(() => { 
                        if(fs.existsSync(outputFile)) fs.unlinkSync(outputFile); 
                    }, 10000);
                } catch(e){}
            });
        })
        .on('error', (err) => {
            console.error('[ERROR]', err);
            res.status(500).json({ error: 'Eroare procesare.' });
            // Cleanup în caz de eroare
            try {
                if(fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
            } catch(e){}
        })
        .save(outputFile);
});

// Health check endpoint pentru Coolify
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔪 Audio Slicer pornit pe port ${PORT}`);
});
