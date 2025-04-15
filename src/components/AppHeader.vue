<template>
    <header class="header-gradient shadow sticky-top">
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center py-2">
          <!-- Logo -->
          <h1 class="m-0 text-white d-flex align-items-center fw-bold">
            <i class="fa fas fa-gamepad me-2 logo-icon"></i>
            The Game
          </h1>
  
          <!-- Desktop Navigation -->
          <nav class="d-none d-md-block">
            <ul class="list-unstyled mb-0 d-flex">
              <li>
                <RouterLink to="/" class="btn btn-outline-light">
                  <i class="fa fas fa-home me-2"></i>Home
                </RouterLink>
              </li>
              <!-- Add more navigation items here as needed -->
            </ul>
          </nav>
  
          <!-- Mobile Menu Button -->
          <button 
            class="btn btn-outline-light d-md-none" 
            type="button" 
            data-bs-toggle="offcanvas" 
            data-bs-target="#mobileNav" 
            aria-controls="mobileNav"
          >
            <i class="fa fas fa-bars"></i>
          </button>
        </div>
      </div>
  
      <!-- Mobile Navigation Offcanvas -->
      <div 
        class="offcanvas offcanvas-end header-gradient" 
        tabindex="-1" 
        id="mobileNav" 
        aria-labelledby="mobileNavLabel"
      >
        <div class="offcanvas-header border-bottom border-light">
          <h5 class="offcanvas-title text-white" id="mobileNavLabel">The Game</h5>
          <button 
            type="button" 
            class="btn-close btn-close-white" 
            data-bs-dismiss="offcanvas" 
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body">
          <ul class="nav flex-column">
            <li class="nav-item mb-2">
              <RouterLink to="/" class="nav-link text-white" data-bs-dismiss="offcanvas">
                <i class="fa fas fa-home me-2"></i>Home
              </RouterLink>
            </li>
            <!-- Add more navigation items here -->
          </ul>
        </div>
      </div>
    </header>
  </template>
  
  <script setup>
  // No custom JavaScript needed - Bootstrap's offcanvas component handles the mobile menu
  </script>
  
  <style scoped>
  /* Minimal custom CSS */
  .header-gradient {
    background: linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%);
  }
  
  .logo-icon {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  /* Mobile navigation styling */
  .offcanvas {
    max-width: 300px;
  }
  
  .nav-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 0.25rem;
  }
  </style>