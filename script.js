document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('macro-title');
  const descEl = document.getElementById('macro-description');
  const downloadBtn = document.getElementById('download-btn');
  const videoEl = document.getElementById('macro-video');
  const loginForm = document.getElementById('loginForm');
  const authLink = document.getElementById('auth-link');

  // 1. Handle Login Form (Only runs on pages with #loginForm like login.html)
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('https://vba.infinityfree.me/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('seid', data.token);
          window.location.href = 'https://novascribe.github.io/CAD-Automation.com/index.html';
        } else {
          alert(data.message || 'Login failed.');
        }
      } catch (err) {
        alert('Could not connect to the login server.');
      }
    });
    return; // Stop further execution on login.html
  }

  // 2. Authentication Check for Protected Pages
  const token = localStorage.getItem('seid');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // 3. Render Header UI for Authenticated Users
  if (authLink) {
    authLink.innerHTML = `
      <div class="user-menu">
        <a style="margin-left: 10px;" id="logout" href="#">Logout</a>
      </div>`;

    document.getElementById('logout').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('seid'); // Properly clear localStorage token
      window.location.href = 'login.html';
    });
  }

  // 4. Handle Item Page Logic (CSV Parsing & Video)
  if (!titleEl || !descEl || !downloadBtn || !videoEl) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = (urlParams.get('item') || '').trim();

  if (!itemId) {
    titleEl.textContent = 'Error: No item specified.';
    descEl.textContent = '';
    videoEl.style.display = 'none';
    downloadBtn.href = '#';
    downloadBtn.textContent = 'Download unavailable';
    return;
  }

  Papa.parse('./data.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const match = results.data.find(row =>
        row.macro_name && row.macro_name.trim().toLowerCase() === itemId.trim().toLowerCase()
      );

      if (!match) {
        titleEl.textContent = 'Macro Not Found';
        descEl.style.display = 'none';
        videoEl.style.display = 'none';
        downloadBtn.style.display = 'none';
        return;
      }

      titleEl.textContent = match.title || itemId;

      if (match.description) {
        descEl.textContent = match.description;
        descEl.style.display = 'block';
      } else {
        descEl.style.display = 'none';
      }

      const downloadUrl = `https://vba.infinityfree.me/download.php?filename=${encodeURIComponent(match.macro_name)}`;
      downloadBtn.href = downloadUrl;
      downloadBtn.textContent = 'Download';

      if (!match.video_name) {
        videoEl.style.display = 'none';
        return;
      }

      const videoUrl = `https://vba.infinityfree.me/video/${encodeURIComponent(match.video_name)}`;
      videoEl.src = videoUrl;
      videoEl.load();

      videoEl.addEventListener('error', () => {
        videoEl.style.display = 'none';
        const fallback = document.createElement('p');
        fallback.textContent = 'Video preview is not available for this macro yet.';
        videoEl.insertAdjacentElement('afterend', fallback);
      }, { once: true });
    },
    error: function (error) {
      titleEl.textContent = 'Error loading data';
      descEl.textContent = error.message;
      videoEl.style.display = 'none';
      downloadBtn.href = '#';
      downloadBtn.textContent = 'Download unavailable';
    }
  });
});