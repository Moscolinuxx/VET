# Pushing this project to GitHub

I can't push to GitHub directly (no network access or credentials in my
environment), but this takes about 2 minutes once you've downloaded the
project folder.

## Option A: your `vetguard-ai` repo is currently empty (this matches what you showed earlier)

1. Download and unzip the project I generated.
2. Open a terminal inside the unzipped `vetguard-ai/` folder.
3. Run:

```bash
git init
git add .
git commit -m "Initial commit: VetGuard AI full-stack app"
git branch -M main
git remote add origin https://github.com/Moscolinuxx/vetguard-ai.git
git push -u origin main
```

If prompted for credentials, use a GitHub Personal Access Token (not your
account password - GitHub no longer accepts passwords over HTTPS git push).

## Option B: the repo already has commits

```bash
git init
git add .
git commit -m "Initial commit: VetGuard AI full-stack app"
git branch -M main
git remote add origin https://github.com/Moscolinuxx/vetguard-ai.git
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## After pushing: redeploying on Vercel

Go back to the Vercel "New Project" screen you showed earlier:
- **Application Preset**: should now auto-detect as **Next.js** (since
  `frontend/package.json` has `"next"` in dependencies) - but note your repo
  root contains both `backend/` and `frontend/`, so set **Root Directory**
  to `frontend`.
- **Environment Variables**: add one -
  `NEXT_PUBLIC_API_URL` = the URL of wherever you deploy the FastAPI backend
  (Vercel only hosts the Next.js frontend; deploy `backend/` separately on
  Railway, Render, or similar - Vercel doesn't run long-lived Python
  processes).

## Double-check before pushing

```bash
cat .gitignore
```
Confirm `backend/venv/`, `frontend/node_modules/`, and `backend/*.db` are
listed (they are, in the `.gitignore` I generated) so you don't accidentally
commit hundreds of MB of dependencies or your local dev database.
