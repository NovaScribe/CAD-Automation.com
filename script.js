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
    complete: function(results) {
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
      }else {
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
    error: function(error) {
      titleEl.textContent = 'Error loading data';
      descEl.textContent = error.message;
      videoEl.style.display = 'none';
      downloadBtn.href = '#';
      downloadBtn.textContent = 'Download unavailable';
    }
  });
});