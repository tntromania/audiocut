# 🔪 Audio Slicer Pro - Ghid Deployment pe Hetzner cu Coolify

## 📋 Pași de deployment

### 1️⃣ Pregătește repository-ul pe GitHub

```bash
# Pe computerul tău local, în folderul AudioCut
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/audiocut.git
git push -u origin main
```

### 2️⃣ Configurează Coolify

1. **Conectează-te la Coolify** (ex: https://coolify.your-domain.com)

2. **Adaugă un nou Project:**
   - Click pe "New Project"
   - Nume: `audiocut`

3. **Adaugă o nouă Resource:**
   - Click pe "New Resource"
   - Selectează "Application"
   - Build Pack: **Docker**

4. **Configurează Source:**
   - Public Repository: `https://github.com/USERNAME/audiocut`
   - Branch: `main`

5. **Configurează Build:**
   - Build Type: **Dockerfile**
   - Port: `3000`

6. **Environment Variables** (opțional):
   ```
   PORT=3000
   NODE_ENV=production
   ```

7. **Domeniu:**
   - Adaugă domeniul tău sau folosește subdomain-ul Coolify
   - Ex: `audiocut.your-domain.com`

8. **Deploy:**
   - Click pe "Deploy"
   - Așteaptă ~2-5 minute pentru prima deploy

### 3️⃣ Verificare

După deployment, testează aplicația:

```bash
# Health check
curl https://audiocut.your-domain.com/health

# Ar trebui să returneze:
{"status":"ok"}
```

## 🔧 Troubleshooting

### Eroare: FFmpeg not found
```bash
# Verifică în logs că FFmpeg s-a instalat corect
# Dockerfile-ul nostru include: apk add --no-cache ffmpeg
```

### Eroare: Port already in use
```bash
# Schimbă portul în Environment Variables
PORT=3001
```

### Eroare: Upload fail
```bash
# Verifică că directoarele uploads/ și processed/ au permisiuni corecte
# Dockerfile-ul creează automat aceste directoare
```

## 📦 Structura proiectului

```
audiocut/
├── Dockerfile          # Configurare container Docker
├── .dockerignore       # Fișiere ignorate la build
├── package.json        # Dependencies Node.js
├── server.js           # Backend Express
├── index.html          # Frontend
├── .gitignore         # Git ignore
└── README.md          # Acest fișier
```

## 🚀 Features

- ✅ Elimină automat pauzele și spațiile goale din audio
- ✅ Suport pentru MP3, WAV, M4A
- ✅ Control Tightness (cât spațiu lăsăm între cuvinte)
- ✅ Control Sensitivity (ce nivel considerăm liniște)
- ✅ Processing History cu localStorage
- ✅ Stats: Files Processed & Time Saved
- ✅ Download processed audio

## 🔐 Securitate

⚠️ **Important:** Aplicația actuală nu are autentificare. Pentru producție, recomandăm:

1. Adaugă autentificare (JWT, OAuth)
2. Limitează dimensiunea fișierelor uploadate
3. Adaugă rate limiting
4. Scanează fișierele uploadate pentru malware

## 📝 License

MIT
