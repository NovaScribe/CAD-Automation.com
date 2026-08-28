document.addEventListener('DOMContentLoaded', () => {


  const titleEl = document.getElementById('macro-title');
  const descEl = document.getElementById('macro-description');
  const downloadBtn = document.getElementById('download-btn');
  const videoEl = document.getElementById('macro-video');


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

async function logPageVisit() {
  try {
    await fetch("https://page-logs.maneeshbabu6.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // Pass a valid JSON stringified object
      body: JSON.stringify({
        url: window.location.href,
        timestamp: new Date().toISOString()
      }),
      keepalive: true
    });
  } catch (error) {
    console.error("Failed to record page log:", error);
  }
}


function createMacroList() {
  const macroListEl = document.getElementById('macro-list');

  if (!macroListEl) {
    //console.error('Macro list element not found.');
    return;
  }

  Papa.parse('./data.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      results.data.forEach(function (row) {
          const listItem = document.createElement('li');
          listItem.textContent = row.title || row.macro_name || 'Unnamed Macro';
          const downloadLink = document.createElement('a');
          downloadLink.href = `download.html?item=${encodeURIComponent(row.macro_name)}`;
          downloadLink.textContent = 'Download';
          listItem.appendChild(document.createTextNode(' '));
          listItem.appendChild(downloadLink);
          macroListEl.appendChild(listItem);
      });
    }
  });
}

logPageVisit();
createMacroList();

// Initialize slider
const slider = new PromoSlider('.promo-slider-container');

// Dynamically add items
slider.addItem('png\\Macro Dashboard.png', 'All In One', "/download.html?item=Macro Dashboard.catvba");
slider.addItem('png\\create_body_and_publish.png', 'NEW', "/download.html?item=create_body_and_publish.catvba");
slider.addItem('png\\round_figure_dimension_in_sketch.png', 'UPDATED', "/download.html?item=round_figure_dimension_in_sketch.catvba");
// slider.addItem('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', 'VIDEO');
// slider.addItem('https://picsum.photos/800/450?random=5');
// slider.addItem('https://picsum.photos/800/450?random=6');