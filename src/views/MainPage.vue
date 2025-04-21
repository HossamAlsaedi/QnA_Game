<template>
  <LoadSpinner :loading="loading" />

  <AppHeader />
  <div v-if="!loading" class="container py-4 main-container" dir="rtl">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <!-- Main Content Card with enhanced animation -->
        <div
          class="main-card shadow rounded-4 p-4 mb-5 animate__animated animate__fadeIn"
        >
          <h1
            class="display-5 fw-bold text-center mb-4 game-title animate__animated animate__pulse animate__delay-1s"
          >
            إعداد اللعبة
          </h1>

          <!-- Categories Section -->
          <section class="mb-5 animate__animated animate__fadeInUp">
            <h2 class="section-title fw-bold mb-3">
              اختر الفئات
              <span
                class="badge bg-gradient-primary ms-2 animate__animated"
                :class="{
                  animate__bounceIn: selectedCategories.length > 0,
                  'badge-warning': selectedCategories.length < 2,
                  'badge-success':
                    selectedCategories.length >= 2 &&
                    selectedCategories.length <= 6,
                }"
              >
                {{ selectedCategories.length }}/{{ minCategories }}-{{
                  maxCategories
                }}
              </span>
            </h2>
            <div class="category-container">
              <div class="row g-3">
                <div
                  v-for="(category, idx) in categories"
                  :key="category.id"
                  class="col-md-4 col-sm-6"
                >
                  <div
                    class="category-card shadow-sm animate__animated animate__fadeInUp"
                    :class="{ active: selectedCategories.includes(category) }"
                    :style="{ 'animation-delay': `${idx * 0.1}s` }"
                    @click="toggleActive(category)"
                  >
                    <div class="category-image-container">
                      <img
                        :src="getImagePath(category.image)"
                        :alt="category.name"
                        class="category-image"
                        @error="handleImageError"
                      />
                    </div>
                    <div class="category-name">
                      <h3 class="category-title">
                        {{ category.nameAr || category.name }}
                      </h3>
                    </div>
                    <transition name="fade">
                      <div
                        v-if="selectedCategories.includes(category)"
                        class="selected-indicator"
                      >
                        <i class="bi bi-check-circle-fill"></i>
                      </div>
                    </transition>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Teams Section -->
          <section
            class="mb-5 animate__animated animate__fadeInUp animate__delay-1s"
          >
            <h2 class="section-title fw-bold mb-3">إدارة الفرق</h2>
            <div class="row g-3">
              <transition-group name="team-list" tag="div" class="row g-3">
                <div
                  v-for="(team, index) in teams"
                  :key="team.id"
                  class="col-md-6"
                >
                  <div
                    class="team-card shadow-sm"
                    :style="{
                      'border-right': `5px solid ${getTeamColor(index)}`,
                    }"
                  >
                    <div class="d-flex align-items-center">
                      <div
                        class="team-icon"
                        :style="{ 'background-color': getTeamColor(index) }"
                      >
                        {{ index + 1 }}
                      </div>
                      <div class="flex-grow-1">
                        <input
                          type="text"
                          v-model="team.name"
                          class="form-control team-input"
                          placeholder="اسم الفريق"
                          maxlength="15"
                        />
                      </div>
                      <button
                        v-if="teams.length > minTeams"
                        @click="removeTeam(index)"
                        class="btn btn-light remove-team"
                        title="إزالة الفريق"
                      >
                        <i class="fa fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>

            <!-- Add Team Button - Completely Redesigned -->
            <div class="text-center mt-4">
              <button
                v-if="teams.length < maxTeams"
                @click="addTeam"
                class="btn btn-add-team"
              >
                <i class="bi bi-plus-circle-fill"></i>إضافة فريق
              </button>
            </div>
          </section>

          <!-- Start Game Button & Error Message -->
          <div
            class="text-center animate__animated animate__fadeInUp animate__delay-2s"
          >
            <transition name="shake">
              <p v-if="errorMessage" class="alert alert-danger d-inline-block">
                {{ errorMessage }}
              </p>
            </transition>
            <button
              class="btn btn-gradient-primary btn-lg px-5 py-3 fw-bold start-game-btn"
              :disabled="!isReadyToStart()"
              @click="startGame"
            >
              ابدأ اللعبة <i class="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Floating Category Tracker -->
  <transition name="slide-fade">
    <div
      v-if="selectedCategories.length > 0 || showCategoryTracker"
      class="category-tracker"
      :class="{ warning: selectedCategories.length < 2 }"
    >
      <div class="tracker-header">
        <div class="tracker-title">
          <i class="bi bi-stack"></i>
          <span>الفئات المختارة</span>
        </div>
        <div
          class="tracker-count"
          :class="{ warning: selectedCategories.length < 2 }"
        >
          {{ selectedCategories.length }}/{{ maxCategories }}
        </div>
      </div>
      <div class="tracker-body">
        <div v-if="selectedCategories.length > 0" class="categories-list">
          <div
            v-for="(category, index) in selectedCategories"
            :key="category.id"
            class="category-item animate__animated animate__fadeInRight"
            :style="{ 'animation-delay': `${index * 0.1}s` }"
          >
            <span class="category-number">{{ index + 1 }}</span>
            <span class="category-name">{{
              category.nameAr || category.name
            }}</span>
            <button
              class="remove-category"
              @click.stop="toggleActive(category)"
              title="إزالة الفئة"
            >
              <i class="fa fas fa-times"></i>
            </button>
          </div>
        </div>
        <div v-else class="tracker-empty">
          <i class="fa fas fa-info-circle"></i>
          <span>اختر على الأقل فئتين</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import AppHeader from "../components/AppHeader.vue";
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import LoadSpinner from "@/components/LoadSpinner.vue";

const router = useRouter();
const categories = ref([]);
const selectedCategories = ref([]);
const errorMessage = ref("");
const loading = ref(true);
const showCategoryTracker = ref(false);

const minCategories = 2;
const maxCategories = 6;

// Enhanced team colors with more vibrant palette
const teamColors = [
  "#FF6B6B", // Red
  "#4CC9F0", // Blue
  "#7209B7", // Purple
  "#4CAF50", // Green
  "#F9C846", // Yellow
  "#FF85B3", // Pink
];

const getTeamColor = (index) => {
  return teamColors[index % teamColors.length];
};

const getImagePath = (imageName) => {
  if (!imageName) return ""; // prevent runtime errors
  return `${import.meta.env.BASE_URL}Images/${imageName}`;
};

// Fetch categories
onMounted(async () => {
  try {
    const categoryFiles = [
      "SA.json",
      "animals.json",
      "countries_capitals.json",
      "RE.json",
      "quran.json",
      "Islam.json",
      "ps-games.json",
      "wwe.json",
      "ST.json",
      "hayala.json",
      "cars.json",
      "PB.json",
      "puzzles.json",
      "history.json",
      "general.json",
      "anime.json",
    ];
    const categoryPromises = categoryFiles.map(async (file) => {
      const response = await fetch(
        `${import.meta.env.BASE_URL}categories/${file}`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${file}`);
      return await response.json();
    });

    categories.value = await Promise.all(categoryPromises);
  } catch (error) {
    console.error("Error loading categories:", error);
  }
  loading.value = false;

  // Show tracker after initial scroll
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const handleScroll = () => {
  // Show tracker after scrolling 100px
  showCategoryTracker.value = window.scrollY > 100;
};

const toggleActive = (category) => {
  const index = selectedCategories.value.indexOf(category);

  if (index !== -1) {
    selectedCategories.value.splice(index, 1);
  } else if (selectedCategories.value.length < 6) {
    selectedCategories.value.push(category);
  }
};

// Team Logic
const minTeams = 2;
const maxTeams = 6;
const teams = ref([
  { id: 1, name: "" },
  { id: 2, name: "" },
]);

const addTeam = () => {
  if (teams.value.length < maxTeams) {
    teams.value.push({ id: Date.now(), name: "" });
  }
};

const removeTeam = (index) => {
  if (teams.value.length > minTeams) {
    teams.value.splice(index, 1);
  }
};

const areAllTeamsValid = () => {
  // Check if all team names are valid (non-empty and less than 15 characters)
  return teams.value.every(
    (team) => team.name.trim() && team.name.length <= 15
  );
};

const isReadyToStart = () => {
  return areAllTeamsValid() && selectedCategories.value.length >= 2;
};

// Start Game Function
const cleanupLocalStorageForNewGame = (categories) => {
  const usedQuestions = JSON.parse(
    localStorage.getItem("usedQuestions") || "{}"
  );

  categories.forEach((category) => {
    const grouped = {
      100: [],
      200: [],
      300: [],
      400: [],
    };

    category.questions.forEach((q) => {
      if (grouped[q.points]) {
        grouped[q.points].push(q);
      }
    });

    [100, 200, 300, 400].forEach((points) => {
      const key = `${category.name}_${points}`;
      const used = usedQuestions[key] || [];
      const total = grouped[points].length;

      // If only 1 or less questions are left, reset the key for that category+points
      if (used.length >= total - 1) {
        delete usedQuestions[key];
      }
    });
  });

  localStorage.setItem("usedQuestions", JSON.stringify(usedQuestions));
};

const startGame = () => {
  if (
    selectedCategories.value.length < 2 ||
    selectedCategories.value.length > 6
  ) {
    errorMessage.value = "الرجاء اختيار ما بين 2 و 6 فئات.";
    return;
  }

  errorMessage.value = "";

  cleanupLocalStorageForNewGame(selectedCategories.value);
  localStorage.removeItem("gameState");
  localStorage.setItem(
    "gameState",
    JSON.stringify({
      categories: selectedCategories.value,
      teams: teams.value,
      currentTeamIndex: 0,
    })
  );

  // Give time for a brief CSS exit animation
  setTimeout(() => {
    router.push({ name: "game-board" });
  }, 300);
};

const handleImageError = (event) => {
  // Set a default image if the image fails to load
  event.target.src = `${import.meta.env.BASE_URL}Images/noImage.jpg`;
};
</script>

<style scoped>
/* Import Animate.css */
@import "animate.css";

/* Enhanced Colorful Background with gradient animation */
.main-container {
  background: linear-gradient(-45deg, #f5f7fa, #c3cfe2, #dfe9f3, #e2e2e2);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  min-height: calc(100vh - 80px);
  padding: 20px;
}

[dir="rtl"] .section-title:after {
  left: auto;
  right: 0;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Enhanced Main card styling with subtle animation */
.main-card {
  background-color: white;
  border: none;
  border-radius: 20px !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-top: 5px solid #7209b7;
  transition: all 0.5s ease;
  overflow: hidden;
  position: relative;
}

.main-card::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  opacity: 0;
  transition: opacity 1.5s ease;
  pointer-events: none;
}

.main-card:hover::before {
  opacity: 1;
  animation: pulse 2.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
}

/* Enhanced Game title styling with gradient animation */
.game-title {
  background: linear-gradient(90deg, #7209b7, #3f37c9, #4361ee, #3a0ca3);
  background-size: 300% 300%;
  animation: gradientText 6s ease infinite;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  text-shadow: 0px 4px 15px rgba(67, 97, 238, 0.2);
}

@keyframes gradientText {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.section-title {
  color: #333;
  position: relative;
  padding-bottom: 12px;
  margin-bottom: 1.5rem;
}

.section-title:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #7209b7, #3f37c9);
  border-radius: 4px;
  animation: expand 2s ease-out;
}

@keyframes expand {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

/* Enhanced Category cards styling with hover effects */
.category-container {
  overflow-x: hidden;
}

.badge-warning {
  background: linear-gradient(45deg, #ffa726, #fb8c00);
  animation: pulse-attention 1.5s infinite;
}

.badge-success {
  background: linear-gradient(45deg, #66bb6a, #43a047);
}

@keyframes pulse-attention {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.category-hint {
  display: inline-block;
  font-size: 0.85rem;
  color: #d32f2f;
  margin-right: 8px;
  opacity: 0.9;
  animation: fadeInRight 0.5s;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 0.9;
    transform: translateX(0);
  }
}

.category-card {
  height: 200px;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 3px solid #f0f0f0;
  background: linear-gradient(to bottom, #ffffff, #f8f9fa);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.category-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.category-card.active {
  border-color: #4361ee;
  box-shadow: 0 10px 25px rgba(67, 97, 238, 0.4);
  transform: translateY(-5px);
}

.category-image-container {
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  transition: all 0.3s ease;
}

.category-card:hover .category-image-container {
  background: linear-gradient(135deg, #e4e7eb 0%, #d1d9e6 100%);
}

.category-image {
  max-height: 80%;
  max-width: 80%;
  object-fit: contain;
  transition: all 0.4s ease;
}

.category-card:hover .category-image {
  transform: scale(1.1);
}

.category-name {
  height: 30%;
  background: linear-gradient(90deg, #4361ee, #3a0ca3);
  background-size: 200% 200%;
  animation: gradientShift 5s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  transition: all 0.3s ease;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.category-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* Selection indicator */
.selected-indicator {
  position: absolute;
  top: 10px;
  right: auto;
  left: 10px;
  background: #4361ee;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* Team list transitions */
.team-list-enter-active,
.team-list-leave-active {
  transition: all 0.5s ease;
}

.team-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.team-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Enhanced Team cards styling with hover effects */
.team-card {
  border-radius: 12px;
  padding: 1rem;
  background: white;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  position: relative;
  overflow: hidden;
}

.team-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
}

.team-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0) 50%
  );
  pointer-events: none;
}

.team-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  margin-right: 0;
  margin-left: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.team-card:hover .team-icon {
  transform: scale(1.1) rotate(5deg);
}

.team-input {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 1rem;
  transition: all 0.3s;
}

.team-input:focus {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.remove-team {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d90429;
  margin-left: 0;
  margin-right: 0.5rem;
  transition: all 0.2s;
}

.remove-team:hover {
  background-color: #ffeeee;
  color: #b30012;
  transform: rotate(90deg);
}

/* Completely redesigned Add Team button */
.btn-add-team {
  background: linear-gradient(45deg, #7209b7, #4361ee);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 12px;
  padding: 12px 28px;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.6px;
  box-shadow: 0 6px 15px rgba(114, 9, 183, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.btn-add-team::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background: linear-gradient(45deg, #4361ee, #7209b7);
  transition: all 0.5s ease;
  z-index: -1;
}

.btn-add-team:hover::before {
  width: 100%;
}

.btn-add-team:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(114, 9, 183, 0.6),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.btn-add-team:active {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(114, 9, 183, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-add-team i {
  font-size: 1.2rem;
  vertical-align: middle;
  margin-right: 8px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* Enhanced Gradient Buttons with hover animations */
.btn-gradient-primary {
  background: linear-gradient(45deg, #4361ee, #3a0ca3);
  border: none;
  color: white;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.btn-gradient-primary::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background: linear-gradient(45deg, #3a0ca3, #7209b7);
  transition: all 0.5s ease;
  z-index: -1;
}

.btn-gradient-primary:hover:not(:disabled)::before {
  width: 100%;
}

.btn-gradient-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(67, 97, 238, 0.5);
}

.btn-gradient-primary:disabled {
  background: linear-gradient(45deg, #a0a0a0, #d0d0d0);
  cursor: not-allowed;
  opacity: 0.7;
}

.badge.bg-gradient-primary {
  background: linear-gradient(45deg, #7209b7, #560bad);
  font-size: 0.9rem;
  font-weight: normal;
  padding: 6px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(114, 9, 183, 0.2);
  transition: all 0.3s ease;
}

/* Start game button glow effect */
.start-game-btn {
  position: relative;
}

.start-game-btn::after {
  content: "";
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 16px;
  background: linear-gradient(45deg, #4361ee, #3a0ca3);
  z-index: -1;
  opacity: 0;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  50% {
    opacity: 0.3;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.85);
  }
}

/* Error message animation */
.shake-enter-active {
  animation: shake-rtl 0.5s;
}

@keyframes shake-rtl {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(-5px);
  }
}

/* Floating Category Tracker Styles */
/* Floating Category Tracker Styles - Continuation */
.category-tracker {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-width: 280px;
  max-height: 80vh;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.category-tracker.warning {
  border: 2px solid #ff9800;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.tracker-header {
  background: linear-gradient(45deg, #7209b7, #4361ee);
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tracker-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.tracker-title i {
  font-size: 1rem;
}

.tracker-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.tracker-count.warning {
  background: #ff9800;
  color: white;
  animation: pulse-attention 1.5s infinite;
}

.tracker-body {
  max-height: calc(80vh - 50px);
  overflow-y: auto;
  padding: 10px;
  width: 300px; /* Fixed width for all items */
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 8px 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-item:hover {
  background: #eef2f7;
  transform: translateX(5px);
}

.category-number {
  background: #7209b7;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  margin-right: 10px;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  font-size: 0.9rem;
  color: white;
  white-space: nowrap; /* Prevent text from wrapping */
  overflow: hidden; /* Hide overflow text */
  text-overflow: ellipsis; /* Show ellipsis (...) for overflow text */
}

.remove-category {
  background: transparent;
  border: none;
  color: #dc3545;
  font-size: 1.2rem;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0; /* Prevent button from shrinking */
}

.remove-category:hover {
  background: #fee2e2;
  transform: rotate(90deg);
}

.remove-category i {
  line-height: 1;
}

.tracker-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6c757d;
  text-align: center;
  font-size: 0.9rem;
}

.tracker-empty i {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #ff9800;
}

/* Transition for the tracker */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Custom scrollbar for tracker body */
.tracker-body::-webkit-scrollbar {
  width: 4px;
}

.tracker-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tracker-body::-webkit-scrollbar-thumb {
  background: #7209b7;
  border-radius: 4px;
}

.tracker-body::-webkit-scrollbar-thumb:hover {
  background: #560bad;
}

/* Responsive design for mobile */
@media (max-width: 768px) {
  .category-tracker {
    left: 10px;
    top: 10px;
    width: 240px;
    max-height: 240px;
    overflow: scroll;
  }

  .tracker-body {
    width: 100%; /* Full width on mobile */
  }

  .tracker-title {
    font-size: 0.85rem;
  }

  .category-item {
    padding: 6px 10px;
  }

  .category-name {
    font-size: 0.85rem;
  }
}

/* RTL support for floating tracker */
[dir="rtl"] .category-tracker {
  left: auto;
  right: 20px;
}

[dir="rtl"] .category-number {
  margin-right: 0;
  margin-left: 10px;
}

[dir="rtl"] .category-item:hover {
  transform: translateX(-5px);
}

[dir="rtl"] .slide-fade-enter-from,
[dir="rtl"] .slide-fade-leave-to {
  transform: translateX(20px);
}

@media (max-width: 768px) {
  [dir="rtl"] .category-tracker {
    right: 10px;
  }
}
</style>
