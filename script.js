document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('macro-title');
  const descEl = document.getElementById('macro-description');
  const downloadBtn = document.getElementById('download-btn');
  const videoEl = document.getElementById('macro-video');

  // Extract query parameter: download.html?item=create_body_and_publish_v1.0.0.catvba
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('item');

  if (!itemId) {
    titleEl.textContent = 'Error: No item specified.';
    descEl.textContent = '';
    return;
  }

  // Parse local CSV file directly on GitHub Pages
  Papa.parse('./data.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      // Search CSV rows for matching macro_name
      const match = results.data.find(row => 
        row.macro_name && row.macro_name.trim().toLowerCase() === itemId.trim().toLowerCase()
      );

      if (match) {
        // Populate HTML content
        titleEl.textContent = match.macro_name;
        descEl.textContent = match.description;
        
        // Load video locally from GitHub Pages videos folder
        videoEl.src = `videos/${match.video_name}`;
        videoEl.load();

        // Point download button to your working InfinityFree download.php script
        downloadBtn.href = `https://vba.infinityfree.me/download.php?filename=${encodeURIComponent(match.macro_name)}`;
      } else {
        titleEl.textContent = 'Macro Not Found';
        descEl.textContent = `No matching macro found for "${itemId}".`;
      }
    },
    error: function(error) {
      titleEl.textContent = 'Error loading data';
      descEl.textContent = error.message;
    }
  });
});