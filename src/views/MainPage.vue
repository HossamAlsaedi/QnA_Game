

<template>
  <AppHeader />
  <div class="container">
    <h1 class="mt-4 text-center">Game Board</h1>

    <!-- Category Table -->
    <div class="container row border border-black py-4 gap-2 gy-5 w-100 text-center justify-content-center m-auto mb-3">

      <div v-for="category in categories" :key="category.id" class="col-3">
        <div class="card w-auto d-flex justify-content-between col-3 p-0"
             :class="{ 'active': selectedCategories.includes(category) }"
             @click="toggleActive(category)">
          <img 
            :src="`/categories/${category.image}`" 
            alt="no Image" 
            class="w-25 h-75 mx-auto"
            @error="handleImageError" 
          />
          <div class="card-body h-25 d-flex align-items-center justify-content-center py-0 bg-black">
            <p class="text-white p-1 m-0">{{ category.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Management -->
    <div class="container mt-4">
      <h3 class="text-center">Manage Teams</h3>

      <!-- Team List -->
      <div class="row justify-content-center">
        <div v-for="(team, index) in teams" :key="team.id" class="col-md-6 mb-3">
          <div class="team-card d-flex align-items-center border p-3 rounded bg-light">
            <div class="flex-grow-1">
              <h5 class="mb-1">Team {{ index + 1 }}</h5>
              <input type="text" v-model="team.name" class="form-control" placeholder="Enter team name" maxlength="15">
            </div>

            <!-- Remove Button (Only if more than 2 teams exist) -->
            <button v-if="teams.length > minTeams" @click="removeTeam(index)" class="btn btn-danger ms-3">x</button>
          </div>
        </div>
      </div>
      
      <!-- Add Team Button (Hidden if 6 teams exist) -->
      <button v-if="teams.length < maxTeams" @click="addTeam" class="btn btn-primary d-block mx-auto">
        <i class="bi bi-plus-lg"></i> Add Team
      </button>
    </div>

    <!-- Start Game Button -->
    <p v-if="errorMessage" class="text-danger text-center">{{ errorMessage }}</p>
    <div class="text-center mt-4">
      <button class="btn btn-success btn-lg" 
      :disabled="!areAllTeamsValid()"
      @click="startGame">
      Start Game</button>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const categories = ref([]);
const selectedCategories = ref([]);
const errorMessage = ref("");

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




</script>



<style scoped>

h1 {
  color: red;
}

.card {
  height: 250px;
  opacity: 0.8;
  transition: ease-in-out 0.3s;
}

.card:hover {
    transform: translateY(-5px);
    opacity: 1;
  }
  
  .active {
  opacity: 1;
}
</style>


