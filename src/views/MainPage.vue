<template>
  <LoadSpinner :loading="loading" />

  <AppHeader />
  <div v-if="!loading" class="container py-4 main-container">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <!-- Main Content Card -->
        <div class="main-card shadow rounded-4 p-4 mb-5">
          <h1 class="display-5 fw-bold text-center mb-4 game-title">Game Setup</h1>
          
          <!-- Categories Section -->
          <section class="mb-5">
            <h2 class="section-title fw-bold mb-3">Select Categories <span class="badge bg-gradient-primary ms-2">{{ selectedCategories.length }}/6</span></h2>
            <div class="category-container">
              <div class="row g-3">
                <div v-for="category in categories" :key="category.id" class="col-md-4 col-sm-6">
                  <div 
                    class="category-card shadow-sm" 
                    :class="{ 'active': selectedCategories.includes(category) }"
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
                      <h3 class="category-title">{{ category.name }}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Teams Section -->
          <section class="mb-5">
            <h2 class="section-title fw-bold mb-3">Manage Teams</h2>
            <div class="row g-3">
              <div v-for="(team, index) in teams" :key="team.id" class="col-md-6">
                <div class="team-card shadow-sm" :style="{ 'border-left': `5px solid ${getTeamColor(index)}` }">
                  <div class="d-flex align-items-center">
                    <div class="team-icon" :style="{ 'background-color': getTeamColor(index) }">{{ index + 1 }}</div>
                    <div class="flex-grow-1">
                      <input 
                        type="text" 
                        v-model="team.name" 
                        class="form-control team-input" 
                        placeholder="Team name" 
                        maxlength="15"
                      >
                    </div>
                    <button 
                      v-if="teams.length > minTeams" 
                      @click="removeTeam(index)" 
                      class="btn btn-light remove-team"
                      title="Remove team"
                    >
                    <i class="fa fas fa-times-circle"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Add Team Button -->
            <div class="text-center mt-3">
              <button 
                v-if="teams.length < maxTeams" 
                @click="addTeam" 
                class="btn btn-gradient-secondary"
              >
                <i class="bi bi-plus-lg me-2"></i>Add Team
              </button>
            </div>
          </section>

          <!-- Start Game Button & Error Message -->
          <div class="text-center">
            <p v-if="errorMessage" class="alert alert-danger d-inline-block">{{ errorMessage }}</p>
            <button 
              class="btn btn-gradient-primary btn-lg px-5 py-3 fw-bold start-game-btn" 
              :disabled="!isReadyToStart()"
              @click="startGame"
            >
              Start Game <i class="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import LoadSpinner from '@/components/LoadSpinner.vue';

const router = useRouter();
const categories = ref([]);
const selectedCategories = ref([]);
const errorMessage = ref("");
const loading = ref(true);

// Team colors array for variety
const teamColors = [
  '#FF6B6B', // Red
  '#4CC9F0', // Blue
  '#7209B7', // Purple
  '#4CAF50', // Green
  '#F0A500', // Orange
  '#FF85B3'  // Pink
];

const getTeamColor = (index) => {
  return teamColors[index % teamColors.length];
};

const getImagePath = (imageName) => {
  if (!imageName) return ''; // prevent runtime errors
  return `${import.meta.env.BASE_URL}Images/${imageName}`;
};

// Fetch categories
onMounted(async () => {
  try {
    const categoryFiles = ['science.json', 'animals.json', 'countries.json', 'capital.json', 'general.json', 'place.json', 'names.json'];
    const categoryPromises = categoryFiles.map(async (file) => {
      const response = await fetch(`${import.meta.env.BASE_URL}categories/${file}`);
      if (!response.ok) throw new Error(`Failed to fetch ${file}`);
      return await response.json();
    });

    categories.value = await Promise.all(categoryPromises);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
  sessionStorage.clear();
  loading.value = false;
});

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
const teams = ref([{ id: 1, name: '' }, { id: 2, name: '' }]);

const addTeam = () => {
  if (teams.value.length < maxTeams) {
    teams.value.push({ id: Date.now(), name: '' });
  }
};

const removeTeam = (index) => {
  if (teams.value.length > minTeams) {
    teams.value.splice(index, 1);
  }
};

const areAllTeamsValid = () => {
  // Check if all team names are valid (non-empty and less than 15 characters)
  return teams.value.every(team => team.name.trim() && team.name.length <= 15);
};

const isReadyToStart = () => {
  return areAllTeamsValid() && selectedCategories.value.length >= 2;
};

// Start Game Function
const cleanupLocalStorageForNewGame = (categories) => {
  const usedQuestions = JSON.parse(localStorage.getItem('usedQuestions') || '{}');

  categories.forEach(category => {
    const grouped = {
      100: [],
      200: [],
      300: [],
      400: []
    };

    category.questions.forEach(q => {
      if (grouped[q.points]) {
        grouped[q.points].push(q);
      }
    });

    [100, 200, 300, 400].forEach(points => {
      const key = `${category.name}_${points}`;
      const used = usedQuestions[key] || [];
      const total = grouped[points].length;

      // If only 1 or less questions are left, reset the key for that category+points
      if (used.length >= total - 1) {
        delete usedQuestions[key];
      }
    });
  });

  localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
};

const startGame = () => {
  if (selectedCategories.value.length < 2 || selectedCategories.value.length > 6) {
    errorMessage.value = "Please select between 2 and 6 categories.";
    return;
  }

  errorMessage.value = "";

  cleanupLocalStorageForNewGame(selectedCategories.value);

  sessionStorage.setItem('gameState', JSON.stringify({
    categories: selectedCategories.value,
    teams: teams.value,
    currentTeamIndex: 0
  }));

  router.push({ name: 'game-board' });
};

const handleImageError = (event) => {
  // Set a default image if the image fails to load
  event.target.src = `${import.meta.env.BASE_URL}Images/default.png`;
};
</script>

<style scoped>
/* Colorful Background */
.main-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 80px);
  padding: 20px;
}

/* Main card styling */
.main-card {
  background-color: white;
  border: none;
  border-radius: 20px !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-top: 5px solid #7209B7;
}

/* Game title styling */
.game-title {
  background: linear-gradient(90deg, #7209B7, #3F37C9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
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
  background: linear-gradient(90deg, #7209B7, #3F37C9);
  border-radius: 4px;
}

/* Category cards styling */
.category-container {
  overflow-x: hidden;
}

.category-card {
  height: 200px;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  border: 3px solid #f0f0f0;
  background: linear-gradient(to bottom, #ffffff, #f8f9fa);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.category-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
}

.category-card.active {
  border-color: #4361EE;
  box-shadow: 0 10px 25px rgba(67, 97, 238, 0.25);
}

.category-image-container {
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.category-image {
  max-height: 80%;
  max-width: 80%;
  object-fit: contain;
}

.category-name {
  height: 30%;
  background: linear-gradient(90deg, #4361EE, #3A0CA3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.category-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

/* Team cards styling */
.team-card {
  border-radius: 12px;
  padding: 1rem;
  background: white;
  transition: all 0.3s;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.team-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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
  margin-right: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.team-input {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 1rem;
  transition: all 0.3s;
}

.team-input:focus {
  border-color: #4361EE;
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
  margin-left: 0.5rem;
  transition: all 0.2s;
}

.remove-team:hover {
  background-color: #ffeeee;
  color: #b30012;
}

/* Gradient Buttons */
.btn-gradient-primary {
  background: linear-gradient(45deg, #4361EE, #3A0CA3);
  border: none;
  color: white;
  border-radius: 10px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.btn-gradient-primary:hover:not(:disabled) {
  background: linear-gradient(45deg, #3A0CA3, #4361EE);
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(67, 97, 238, 0.4);
}

.btn-gradient-primary:disabled {
  background: linear-gradient(45deg, #a0a0a0, #d0d0d0);
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-gradient-secondary {
  background: linear-gradient(45deg, #7209B7, #560BAD);
  border: none;
  color: white;
  border-radius: 8px;
  transition: all 0.3s;
  padding: 8px 16px;
}

.btn-gradient-secondary:hover {
  background: linear-gradient(45deg, #560BAD, #7209B7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(114, 9, 183, 0.3);
}

.badge.bg-gradient-primary {
  background: linear-gradient(45deg, #7209B7, #560BAD);
  font-size: 0.9rem;
  font-weight: normal;
  padding: 6px 10px;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .category-card {
    height: 180px;
  }
  
  .team-card {
    margin-bottom: 1rem;
  }
  
  .main-card {
    padding: 1rem;
  }
}
</style>