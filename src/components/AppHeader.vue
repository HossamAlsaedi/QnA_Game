<template>
  <header class="header-gradient shadow sticky-top">
    <!-- Background overlay that covers the main content when mobile menu is open -->
    <div
      class="menu-backdrop"
      :class="{ 'menu-backdrop-active': mobileMenuOpen }"
      @click="toggleMobileMenu"
    ></div>

    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center py-3">
        <!-- Game Logo (positioned on left in RTL layout) -->
        <h1 class="m-0 text-white d-flex align-items-center fw-bold game-logo">
          <i class="fa fas fa-gamepad logo-icon"></i>
          <span class="logo-text me-2">إختبر ذكائك</span>
        </h1>

        <!-- Desktop Navigation (positioned on right in RTL layout) -->
        <nav class="navigation d-flex align-items-center">
          <ul
            class="list-unstyled mb-0 d-flex flex-wrap justify-content-end align-items-center"
          >
            <li class="nav-item mb-2 mb-md-0 me-3">
              <RouterLink to="/" class="btn btn-nav">
                <i class="fa fas fa-home"></i>
                <span class="btn-text me-2">الرئيسية</span>
              </RouterLink>
            </li>
            <!-- Continue Game Button (conditionally displayed) -->
            <li v-if="isMainPage && hasGameState" class="nav-item mb-2 mb-md-0">
              <button
                @click="router.push({ name: 'game-board' })"
                class="btn btn-nav continue-game-btn"
              >
                <span class="btn-text">استكمال اللعبة</span>
                <i class="fa fas fa-play-circle me-2"></i>
              </button>
            </li>
            <!-- Add more navigation items here as needed -->
          </ul>

          <!-- Mobile Menu Button -->
          <button
            class="mobile-menu-btn d-md-none ms-2"
            @click="toggleMobileMenu"
            aria-label="Toggle Menu"
          >
            <i
              class="fa fas"
              :class="[mobileMenuOpen ? 'fa-times' : 'fa-bars']"
            ></i>
          </button>
        </nav>
      </div>

      <!-- Mobile Navigation Overlay -->
      <div class="mobile-menu" :class="{ 'mobile-menu-open': mobileMenuOpen }">
        <ul class="list-unstyled p-3">
          <li class="mb-3">
            <button
              @click="navigateAndCloseMenu('/')"
              class="btn btn-nav-mobile w-100 text-start"
            >
              <i class="fa fas fa-home px-1"></i>الرئيسية
            </button>
          </li>
          <!-- Always show continue button on mobile, but disable it when no game state -->
          <li class="mb-3">
            <button
              @click="
                hasGameState
                  ? navigateAndCloseMenu({ name: 'game-board' })
                  : null
              "
              class="btn btn-nav-mobile w-100 text-start"
              :class="{ 'btn-nav-disabled': !hasGameState }"
              :disabled="!hasGameState"
            >
              <i class="fa fas fa-play-circle px-1"></i>استكمال اللعبة
              <small v-if="!hasGameState" class="d-block no-game-message mt-1"
                >(لا توجد لعبة محفوظة)</small
              >
            </button>
          </li>
          <!-- Add more mobile navigation items here as needed -->
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const hasGameState = ref(false);
const mobileMenuOpen = ref(false);

// Check if user is on the main page
const isMainPage = computed(() => {
  return route.path === "/";
});

// Check for gameState in localStorage when component mounts
onMounted(() => {
  checkForGameState();

  // Add event listener to update button visibility when localStorage changes
  window.addEventListener("storage", checkForGameState);

  // Close mobile menu when window is resized to desktop size
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      mobileMenuOpen.value = false;
      document.body.style.overflow = "";
    }
  });
});

// Function to check for gameState in localStorage
function checkForGameState() {
  hasGameState.value = !!localStorage.getItem("gameState");
}

// Toggle mobile menu
function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;

  // Add or remove scroll lock on body when menu is open
  if (mobileMenuOpen.value) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

// Navigate and close mobile menu
function navigateAndCloseMenu(route) {
  if (typeof route === "string") {
    router.push(route);
  } else {
    router.push(route);
  }
  mobileMenuOpen.value = false;
  document.body.style.overflow = "";
}
</script>

<style scoped>
* {
  direction: rtl;
}

/* Enhanced header gradient with more vibrant colors to match main page */
.header-gradient {
  background: linear-gradient(135deg, #7209b7 0%, #3a0ca3 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Background overlay for when mobile menu is open */
.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 98;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  backdrop-filter: blur(3px);
}

.menu-backdrop-active {
  opacity: 1;
  visibility: visible;
}

/* Enhanced logo animation */
.game-logo {
  position: relative;
  z-index: 1;
  order: 2; /* In RTL, this puts the logo on the left */
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

.navigation {
  order: 1; /* In RTL, this puts the navigation on the right */
}

@keyframes pulse-rotate {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes shine {
  0% {
    background-position: -100%;
  }
  100% {
    background-position: 200%;
  }
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
  margin-right: 8px; /* Add some spacing between buttons */
}

.btn-nav::before {
  content: "";
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

/* Continue Game Button specific style */
.continue-game-btn {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  animation: subtle-glow 2s infinite alternate;
}

@keyframes subtle-glow {
  from {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  }
  to {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  }
}

/* Mobile Menu Button */
.mobile-menu-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  margin-right: 10px;
  z-index: 100;
  transition: transform 0.2s ease;
}

.mobile-menu-btn:hover {
  transform: scale(1.1);
}

/* Mobile Navigation */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 80%;
  max-width: 320px;
  height: 100vh;
  background: linear-gradient(135deg, #7209b7 0%, #3a0ca3 100%);
  z-index: 99;
  transition: right 0.3s ease;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
  padding-top: 70px;
  overflow-y: auto;
}

.mobile-menu-open {
  right: 0;
}

.btn-nav-mobile {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-nav-mobile:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Disabled button style for mobile navigation */
.btn-nav-disabled {
  opacity: 0.6;
  background: rgba(255, 255, 255, 0.08);
  cursor: not-allowed;
}

.btn-nav-disabled:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Special styling for the "No saved game" message */
.no-game-message {
  color: #ffd166; /* Warm yellow color that stands out on purple */
  font-weight: 500;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 2px 6px;
  display: inline-block;
  margin-top: 4px;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .navigation ul {
    display: none !important;
  }

  .game-logo {
    font-size: 0.8em;
  }

  .logo-icon {
    font-size: 1.2rem;
  }
}

@media (min-width: 768px) {
  .mobile-menu-btn {
    display: none;
  }

  .mobile-menu {
    display: none;
  }

  .menu-backdrop {
    display: none;
  }
}

/* Adjust button sizes on smaller screens */
@media (max-width: 576px) {
  .btn-nav {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .logo-text {
    font-size: 1.2rem;
  }
}

/* For very small screens */
@media (max-width: 360px) {
  .btn-text {
    display: none;
  }

  .btn-nav {
    padding: 8px;
  }

  .logo-text {
    font-size: 1rem;
  }
}
</style>
