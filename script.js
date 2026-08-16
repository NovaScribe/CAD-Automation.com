document.addEventListener('DOMContentLoaded', async () => {
  // 1. Get the target elements from the DOM
  const titleEl = document.getElementById('macro-title');
  const descEl = document.getElementById('macro-description');
  const downloadBtn = document.getElementById('download-btn');
  const videoEl = document.getElementById('macro-video');

  // 2. Extract item ID from URL query parameters (e.g., download.html?item=208)
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('item');

  if (!itemId) {
    titleEl.textContent = 'Error: No item specified.';
    return;
  }

  try {
    // 3. Request data from your external server API
    const response = await fetch(`https://vba.infinityfree.me/downloadpage.php?item=${itemId}`);
   
    if (!response.ok) throw new Error('Item not found');
   
    const data = await response.json();

    /* Expected API JSON response format:
       {
         "title": "Macro Name Here",
         "description": "Your dynamic text description...",
         "downloadUrl": "https://server.com/files/macro.zip",
         "videoUrl": "https://server.com/videos/intro.mp4"
       }
    */

    // 4. Update the DOM elements with fetched data
    titleEl.textContent = data.title;
    descEl.textContent = data.description;
   
    downloadBtn.href = data.downloadUrl;
   
    videoEl.src = data.videoUrl;
    videoEl.load(); // Reloads video element to initialize the new src
   
  } catch (error) {
    titleEl.textContent = 'Failed to load content';
    descEl.textContent = error.message;
  }
});