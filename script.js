document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('macro-title');
  const descEl = document.getElementById('macro-description');
  const downloadBtn = document.getElementById('download-btn');
  const videoEl = document.getElementById('macro-video');

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

      // const videoUrl = `videos/${match.video_name}`;
      const videoUrl = `https://vba.infinityfree.me/video/${encodeURIComponent(match.video_name)}`;
      console.log(videoUrl);

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


  // getEmailBySeid(getCookie('seid')).then(userEmail => {
  //   const authLink = document.getElementById('auth-link');
  //   if (userEmail) {
  //     ides = userEmail;
  //     authLink.innerHTML = `<div class="user-menu"><span>${userEmail}</span>
  //               <a style="margin-left: 10px;" id='logout'>Logout</a></div>`;

  //     document.getElementById('logout').addEventListener('click', (e) => {
  //       e.preventDefault();
  //       // Clear the cookie
  //       document.cookie = "seid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  //       // Refresh
  //       location.reload();
  //     });
  //   }
  // });

  const token = localStorage.getItem('seid');

  if (!token) {
    // User is not logged in, send back to login
    window.location.href = 'login.html';
  }else {
    // User is logged in, fetch their email
    const authLink = document.getElementById('auth-link');

      authLink.innerHTML = `<div class="user-menu"><span></span>
                <a style="margin-left: 10px;" id='logout'>Logout</a></div>`;

      document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        // Clear the cookie
        document.cookie = "seid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // Refresh
        location.reload();
      });
    }

  document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Stop standard form redirect

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
        // Store the session token safely in browser local storage
        localStorage.setItem('seid', data.token);

        // Redirect user to your main page inside GitHub Pages
        window.location.href = 'https://novascribe.github.io/CAD-Automation.com/index.html';
      } else {
        alert(data.message || 'Login failed.');
      }
    } catch (err) {
      alert('Could not connect to the login server.');
    }
  });


});

// Function to get a specific cookie by name
function getCookie(name) {
  let value = "; " + document.cookie;
  let parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}

async function getEmailBySeid(seid) {
  const formData = new FormData();
  formData.append('seid', seid);

  try {
    const response = await fetch('getUser.php', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      //console.log("User Email:", data.email);
      return data.email;
    } else {
      //console.error("Error:", data.message);
      return null;
    }
  } catch (error) {
    //console.error("Network error:", error);
  }
}

function logVisit() {
  const data = {
    path: window.location.pathname,
    referrer: document.referrer,
    screen_res: `${window.screen.width}x${window.screen.height}`,
  };

  // sendBeacon sends an asynchronous POST request
  navigator.sendBeacon('/log_visit.php', JSON.stringify(data));
}

