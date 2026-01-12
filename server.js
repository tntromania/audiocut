const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 CONFIG FIX
const APP_PATH = '/apps/audiocut';
const APP_DIR = path.join(__dirname, 'apps', 'audiocut');
const PUBLIC_DIR = path.join(APP_DIR, 'public');
const UPLOADS_DIR = path.join(APP_DIR, 'uploads');
const PROCESSED_DIR = path.join(APP_DIR, 'processed');

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());

// ---------------- DIRECTOARE ----------------
[UPLOADS_DIR, PROCESSED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// ---------------- STATIC FILES ----------------
app.use(APP_PATH, express.static(PUBLIC_DIR));

// ---------------- UPLOAD ----------------
const upload = multer({ dest: UPLOADS_DIR });

// ---------------- UI ----------------
app.get([APP_PATH, `${APP_PATH}/`, `${APP_PATH}/index.html`], (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Fallback (refresh-safe)
app.get(`${APP_PATH}/*`, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ---------------- API ----------------
app.post(`${APP_PATH}/api/smart-cut`, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Fisier lipsa' });
    }

    const inputFile = req.file.path;
    const outputFile = path.join(PROCESSED_DIR, `cut_${Date.now()}.mp3`);

    const threshold = req.body.threshold || '-30dB';
    const minSilence = req.body.minSilence || '0.3';

    console.log(`[AUDIOCUT] Procesare: ${req.file.originalname}`);

    ffmpeg(inputFile)
        .audioFilters(
            `silenceremove=stop_periods=-1:stop_duration=${minSilence}:stop_threshold=${threshold}`
        )
        .on('end', () => {
            res.download(outputFile, 'tight_audio.mp3', () => {
                try {
                    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
                    setTimeout(() => {
                        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
                    }, 60000);
                } catch (e) {
                    console.error('Cleanup error:', e);
                }
            });
        })
        .on('error', err => {
            console.error('[FFMPEG ERROR]', err);
            res.status(500).json({ error: 'Eroare procesare audio' });
            if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
        })
        .save(outputFile);
});

// ---------------- HEALTH ----------------
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// ---------------- START ----------------
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AudioCut pornit pe port ${PORT}`);
    console.log(`🌐 https://creatorsmart.ro${APP_PATH}/`);
});
