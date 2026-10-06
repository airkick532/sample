/**
 * app.js - Main client script for Static Hosting Test
 * Runs 4 automatic checks, initializes Pyodide, and manages calculator form interaction.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const startTime = performance.now();

  // Track check outcomes
  const checkResults = {
    pageLoad: false,
    healthJson: false,
    pyodideLoaded: false,
    appPyExecuted: false
  };

  // UI Elements
  const urlEl = document.getElementById('meta-url');
  const datetimeEl = document.getElementById('meta-datetime');
  const loadTimeEl = document.getElementById('meta-load-time');
  const pythonInfoEl = document.getElementById('meta-python-info');

  const bannerEl = document.getElementById('overall-banner');
  const bannerTextEl = document.getElementById('banner-text');

  const calcBtn = document.getElementById('calc-btn');
  const calcForm = document.getElementById('calc-form');
  const calcResultBox = document.getElementById('calc-result');
  const resSumEl = document.getElementById('res-sum');
  const resProductEl = document.getElementById('res-product');

  let pyodideInstance = null;

  // Helper: Update individual check badge
  function setCheckBadge(id, passed) {
    const el = document.getElementById(id);
    if (passed) {
      el.textContent = 'PASS';
      el.className = 'badge badge-pass';
    } else {
      el.textContent = 'FAIL';
      el.className = 'badge badge-fail';
    }
  }

  // Helper: Update overall banner status
  function updateOverallBanner() {
    const allPassed = Object.values(checkResults).every(res => res === true);
    if (allPassed) {
      bannerTextEl.textContent = 'ALL TESTS PASSED';
      bannerEl.className = 'banner passed';
    } else {
      bannerTextEl.textContent = 'SOME TESTS FAILED';
      bannerEl.className = 'banner failed';
    }
  }

  // Set system diagnostics
  if (urlEl) urlEl.textContent = window.location.href;
  if (datetimeEl) datetimeEl.textContent = new Date().toLocaleString();

  // --- CHECK A: Page Loaded ---
  try {
    checkResults.pageLoad = true;
    setCheckBadge('check-page-load', true);
  } catch (err) {
    console.error('Check A failed:', err);
    setCheckBadge('check-page-load', false);
  }

  // --- CHECK B: health.json fetched & status == "ok" ---
  try {
    const response = await fetch('health.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.status === 'ok') {
      checkResults.healthJson = true;
      setCheckBadge('check-health', true);
    } else {
      throw new Error(`Unexpected status content: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('Check B failed (health.json):', err);
    setCheckBadge('check-health', false);
  }

  // --- CHECK C: Pyodide loaded ---
  try {
    if (typeof loadPyodide !== 'function') {
      throw new Error('Pyodide script tag not loaded from CDN.');
    }
    pyodideInstance = await loadPyodide();
    if (pyodideInstance) {
      checkResults.pyodideLoaded = true;
      setCheckBadge('check-pyodide', true);
    }
  } catch (err) {
    console.error('Check C failed (Pyodide load):', err);
    setCheckBadge('check-pyodide', false);
    if (pythonInfoEl) pythonInfoEl.textContent = 'Failed to load Pyodide';
  }

  // --- CHECK D: app.py executed successfully ---
  if (checkResults.pyodideLoaded && pyodideInstance) {
    try {
      const appPyResponse = await fetch('app.py');
      if (!appPyResponse.ok) {
        throw new Error(`HTTP error fetching app.py! status: ${appPyResponse.status}`);
      }
      const appPyCode = await appPyResponse.text();
      
      // Execute app.py in Pyodide environment
      await pyodideInstance.runPythonAsync(appPyCode);

      // Verify get_info function exists and executes
      const getInfoFunc = pyodideInstance.globals.get('get_info');
      if (typeof getInfoFunc === 'function') {
        const pyInfo = getInfoFunc();
        if (pythonInfoEl) pythonInfoEl.textContent = pyInfo;
        
        checkResults.appPyExecuted = true;
        setCheckBadge('check-app-py', true);

        // Enable calculator form
        if (calcBtn) calcBtn.disabled = false;
      } else {
        throw new Error('Function get_info() not found in app.py environment');
      }
    } catch (err) {
      console.error('Check D failed (app.py execution):', err);
      setCheckBadge('check-app-py', false);
      if (pythonInfoEl) pythonInfoEl.textContent = 'Error executing app.py';
    }
  } else {
    setCheckBadge('check-app-py', false);
  }

  // Update overall status banner
  updateOverallBanner();

  // Record total diagnostic load time
  const totalLoadTime = Math.round(performance.now() - startTime);
  if (loadTimeEl) loadTimeEl.textContent = `${totalLoadTime} ms`;

  // --- Calculator Form Handler ---
  if (calcForm) {
    calcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!pyodideInstance || !checkResults.appPyExecuted) {
        alert('Python runtime is not ready.');
        return;
      }

      const num1Val = document.getElementById('num1').value;
      const num2Val = document.getElementById('num2').value;

      try {
        const calcFunc = pyodideInstance.globals.get('calculate');
        if (typeof calcFunc !== 'function') {
          throw new Error('Function calculate() not found in app.py');
        }

        const pyResult = calcFunc(num1Val, num2Val);
        
        let sumVal, prodVal, isSuccess = false, errorMsg = '';

        if (pyResult && typeof pyResult.get === 'function') {
          sumVal = pyResult.get('sum');
          prodVal = pyResult.get('product');
          isSuccess = pyResult.get('success');
          errorMsg = pyResult.get('error');
        } else if (pyResult) {
          sumVal = pyResult.sum;
          prodVal = pyResult.product;
          isSuccess = pyResult.success;
          errorMsg = pyResult.error;
        }

        // Clean up PyProxy memory
        if (pyResult && typeof pyResult.destroy === 'function') {
          pyResult.destroy();
        }

        if (isSuccess) {
          resSumEl.textContent = sumVal;
          resProductEl.textContent = prodVal;
          calcResultBox.classList.remove('hidden');
        } else {
          alert(`Calculation error: ${errorMsg}`);
        }
      } catch (err) {
        console.error('Calculator error:', err);
        alert(`Failed to execute calculation: ${err.message}`);
      }
    });
  }
});
