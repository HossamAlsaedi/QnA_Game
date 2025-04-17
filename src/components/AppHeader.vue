<template>
  <header class="header-gradient shadow sticky-top">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center py-3">
        <!-- Enhanced Logo with Animation -->
        <h1 class="m-0 text-white d-flex align-items-center fw-bold game-logo">
          <i class="bi bi-controller me-2 logo-icon"></i>
          <span class="logo-text">سؤال وجواب</span>
        </h1>

        <!-- Desktop Navigation -->
        <nav class="d-block">
          <ul class="list-unstyled mb-0 d-flex">
            <li>
              <RouterLink to="/" class="btn btn-nav">
                <i class="bi bi-house-fill me-2"></i>الرئيسية
              </RouterLink>
            </li>
            <!-- Add more navigation items here as needed -->
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
// No need for language-related code anymore
</script>

<style scoped>
* {
  direction: rtl;
}
/* Enhanced header gradient with more vibrant colors to match main page */
.header-gradient {
  background: linear-gradient(135deg, #7209B7 0%, #3A0CA3 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Enhanced logo animation */
.game-logo {
  position: relative;
  z-index: 1;
}

.logo-icon {
  font-size: 1.5rem;
  color: #fff;
  animation: pulse-rotate 3s infinite;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}

.logo-text {
  background: linear-gradient(90deg, #ffffff, #f0f0f0, #ffffff);
  -webkit-background-clip: text;
  background-clip: text;
  animation: shine 3s infinite;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes pulse-rotate {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes shine {
  0% { background-position: -100%; }
  100% { background-position: 200%; }
}

/* Enhanced Navigation Button */
.btn-nav {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  z-index: -1;
}

.btn-nav:hover {
  color: white;
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.btn-nav:hover::before {
  width: 100%;
}

.btn-nav:active {
  transform: translateY(-1px);
}
</style>