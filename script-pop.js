const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const emailForm = document.getElementById('emailForm');

// Helper function to get a cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setCookie(name, value, days = 15) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
}

// Function to open popup
function openModal() {
  modalOverlay.classList.add('active');
}

// Function to close popup
function closeModal() {
  modalOverlay.classList.remove('active');
}

// Check for existing cookie on page load
document.addEventListener('DOMContentLoaded', () => {
  const userEmail = getCookie('user_email');
  
  // If the cookie does NOT exist, open popup after 2 seconds
  if (!userEmail) {
    setTimeout(() => {
      openModal();
    }, 1500);
  } else {
    // console.log('User email already stored in cookie:', userEmail);
    setCookie('user_email', userEmail, 30); // Extend cookie for another 30 days
  }
});

// Event Listeners
closeModalBtn.addEventListener('click', closeModal);

/*
// click outer to close modal
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});
*/

// Handle form submission email to server
emailForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = document.getElementById('emailInput').value;

  // Send request to your Cloudflare Worker URL
  fetch('https://save-emails.maneeshbabu6.workers.dev', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Worker Response:', data);
    
    // Set cookie to prevent popup from showing again
    setCookie('user_email', email, 30);
    
    // Close popup
    emailForm.reset();
    closeModal();
  })
  .catch(error => {
    console.error('Error saving email:', error);
  });
});