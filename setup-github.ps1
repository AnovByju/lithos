# setup-github.ps1
# Run this script ONCE after cloning or creating the repo folder
# Usage: Right-click > "Run with PowerShell"  OR  paste into PowerShell terminal

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Lithos — GitHub Setup Script   " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Check Node.js ──────────────────────────────────────────────────────
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js not found." -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org and re-run this script." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# ── Step 2: Check Git ─────────────────────────────────────────────────────────
Write-Host "Checking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "  Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Git not found." -ForegroundColor Red
    Write-Host "  Please install Git from https://git-scm.com and re-run this script." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# ── Step 3: Install dependencies ──────────────────────────────────────────────
Write-Host ""
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: npm install failed." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  Dependencies installed!" -ForegroundColor Green

# ── Step 4: Git init ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Initialising Git repository..." -ForegroundColor Yellow

if (-Not (Test-Path ".git")) {
    git init
    Write-Host "  Git repo initialised." -ForegroundColor Green
} else {
    Write-Host "  Git repo already exists, skipping init." -ForegroundColor Gray
}

git add .
git commit -m "Initial commit: Lithos infinite literature feed"
Write-Host "  Files committed." -ForegroundColor Green

# ── Step 5: GitHub remote ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  NEXT: Create a GitHub Repo     " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Go to https://github.com/new" -ForegroundColor White
Write-Host "  2. Name it: lithos" -ForegroundColor White
Write-Host "  3. Set to Public or Private" -ForegroundColor White
Write-Host "  4. Do NOT add README, .gitignore or license (we have them)" -ForegroundColor White
Write-Host "  5. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$repoUrl = Read-Host "Paste your GitHub repo URL here (e.g. https://github.com/username/lithos.git)"

if ($repoUrl -ne "") {
    git remote add origin $repoUrl
    git branch -M main
    git push -u origin main

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCESS! Your code is now on GitHub:" -ForegroundColor Green
        Write-Host "  $repoUrl" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Push failed. You may need to authenticate with GitHub." -ForegroundColor Red
        Write-Host "Try: gh auth login  (install GitHub CLI from https://cli.github.com)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipped remote setup. Run manually:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/USERNAME/lithos.git" -ForegroundColor Gray
    Write-Host "  git branch -M main" -ForegroundColor Gray
    Write-Host "  git push -u origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  To run locally:" -ForegroundColor Cyan
Write-Host "    npm run dev" -ForegroundColor White
Write-Host "  Then open: http://localhost:3000" -ForegroundColor White
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
