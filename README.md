# Static Hosting Test

A 100% static web application repository designed to verify static site hosting on GitHub Pages, featuring Pyodide WebAssembly runtime execution for Python code directly in the browser.

---

## 📁 Repository Structure

```
├── .github/
│   └── workflows/
│       └── pages.yml      # GitHub Actions workflow for deployment
├── index.html             # Main HTML interface & status panel
├── style.css              # Responsive styling & badge indicators
├── app.js                 # Automatic check runner & Pyodide bridge
├── app.py                 # Python code executed in browser via Pyodide
├── health.json            # Health check payload ({"status":"ok","app":"static-test"})
├── .gitignore             # Git ignore file
└── README.md              # Deployment & usage instructions
```

---

## 🚀 Running Locally

Because Pyodide and `fetch()` require HTTP/HTTPS to load WebAssembly modules and local JSON/Python files without CORS restrictions, do not open `index.html` directly as `file://`.

1. Open your terminal in the repository root folder (`D:\HTML`).
2. Start Python's built-in HTTP server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

---

## 🌐 Deploying to GitHub Pages

Follow these short steps to deploy the static repository:

### Step 1: Push to GitHub
1. Create a new repository on GitHub (e.g. `static-test`).
2. Initialize and push your code to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for static hosting test"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

### Step 2: Enable GitHub Actions Source
1. On GitHub, navigate to your repository **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The `.github/workflows/pages.yml` workflow will trigger automatically and deploy your site.

### Step 3: Verify Deployment
1. Go to the **Actions** tab to view deployment progress.
2. Once complete, visit your deployed URL:
   `https://<your-username>.github.io/<repo-name>/`
3. Verify that all 4 checks show green **PASS** badges and the banner shows **ALL TESTS PASSED**.

---

## 🛠️ Troubleshooting

### 1. **404 Not Found Errors**
* **Check File Paths:** Ensure all files are in the repository root directory (case-sensitive on GitHub servers).
* **Base URL Subpaths:** Verify that relative paths (e.g., `'health.json'`, `'app.py'`) are used rather than absolute paths (`'/health.json'`).

### 2. **CORS / Fetch Errors (Local or CDN)**
* **Local `file://` usage:** Opening `index.html` via double-click (`file:///...`) will trigger CORS errors when fetching `health.json` or `app.py`. Always serve via `python -m http.server 8000`.
* **Pyodide CDN Blocked:** If Pyodide fails to load, ensure your network allows outbound HTTPS requests to `https://cdn.jsdelivr.net`.
