#!/bin/bash

# 🚀 AudioCut Quick Deploy Script

echo "🔪 AudioCut - Quick Deploy Script"
echo "=================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git nu este instalat. Instalează Git mai întâi!"
    exit 1
fi

echo "✅ Git găsit"

# Get GitHub username
echo ""
read -p "📝 Introdu GitHub username-ul tău: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Username-ul nu poate fi gol!"
    exit 1
fi

echo ""
echo "📦 Pregătesc repository-ul..."

# Initialize git if not already
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git initialized"
fi

# Add all files
git add .
echo "✅ Fișiere adăugate"

# Commit
git commit -m "Initial commit - AudioCut deployment" 2>/dev/null || echo "⚠️  Commit deja făcut sau nu sunt modificări"

# Add remote
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USER/audiocut.git"
echo "✅ Remote adăugat: https://github.com/$GITHUB_USER/audiocut.git"

# Set branch to main
git branch -M main

echo ""
echo "🚀 Gata pentru push!"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Creează repository 'audiocut' pe GitHub dacă nu există deja"
echo "2. Link: https://github.com/new"
echo ""
read -p "Ai creat repository-ul pe GitHub? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Push la GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SUCCESS! Codul a fost urcat pe GitHub!"
        echo ""
        echo "📋 Next steps:"
        echo "1. Deschide Coolify"
        echo "2. Creează un nou Project: 'audiocut'"
        echo "3. Adaugă Application cu:"
        echo "   - Repository: https://github.com/$GITHUB_USER/audiocut"
        echo "   - Branch: main"
        echo "   - Build Pack: Dockerfile"
        echo "   - Port: 3000"
        echo "4. Deploy!"
        echo ""
        echo "📖 Vezi DEPLOYMENT_GUIDE.md pentru detalii complete"
    else
        echo ""
        echo "❌ Eroare la push. Verifică:"
        echo "1. Repository-ul există pe GitHub?"
        echo "2. Ai access la repository?"
        echo "3. Ai configurat SSH sau HTTPS credentials?"
    fi
else
    echo ""
    echo "⚠️  Creează mai întâi repository-ul pe GitHub:"
    echo "https://github.com/new"
    echo ""
    echo "Apoi rulează din nou acest script sau:"
    echo "git push -u origin main"
fi

echo ""
echo "🎉 Done!"
