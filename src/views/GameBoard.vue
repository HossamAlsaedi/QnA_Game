<template>
  <AppHeader />
    
  <!-- Current Team Turn Tab -->
<div v-if="teams.length > 0" class="alert alert-primary text-center fs-4 mb-4">
  🎯 It's <strong>{{ teams[currentTeamIndex].name }}</strong>'s turn!
</div>


  <div class="container mt-4">
    <div class="d-flex">
      <!-- Team List + Scores (Left Sidebar) -->
      <div class="team-list-container">
  <div v-if="teams.length > 0" class="team-list">
    <h4 class="text-center mb-4">Teams</h4>

    <div 
      v-for="(team, index) in teams" 
      :key="team.id" 
      class="team border rounded p-3 mb-3 bg-light"
    >
      <!-- Team Name -->
      <h5 class="text-center mb-2">{{ team.name }}</h5>

      <!-- Score Controls -->
      <div class="d-flex align-items-center justify-content-center mb-2">
        <button class="btn btn-success me-2" @click="adjustScore(index, 100)">+</button>
        <span class="fw-bold mx-2">{{ team.score }} Points</span>
        <button class="btn btn-danger ms-2" @click="adjustScore(index, -100)">-</button>
      </div>

      <!-- Special Abilities -->
<div class="d-flex justify-content-center flex-wrap gap-2 mb-2">
  <!-- Double Points -->
  <button 
    class="btn btn-outline-primary btn-sm fs-6" 
    :disabled="!team.abilities.doublePoints || index !== currentTeamIndex"
    @click="activateDoublePoints(index)"
    title="Double Points" 
  >x2</button>

<!-- Change Question -->
<button 
  class="btn btn-outline-warning btn-sm" 
  :disabled="!team.abilities.changeQuestion || index !== currentTeamIndex || !currentQuestion"
  @click="useChangeQuestionAbility(index)"
  title="Change Question">
  <i class="fa fa-solid fa-arrow-right"></i>
</button>

<!-- Call for Help -->
<button 
  class="btn btn-outline-info btn-sm" 
  :disabled="!team.abilities.callForHelp || index !== currentTeamIndex || !currentQuestion"
  @click="useCallForHelp(index)"
  title="Call for Help" 
>
<i class="fa fa-solid fa-phone fa-xs" style="color: #74C0FC;"></i>
</button>

<!-- Timer Section with Close Button -->
<div v-if="callForHelpActive && index === currentTeamIndex" class="text-center mt-2">
  <p class="fs-6 text-primary">🕒 Time left: {{ callForHelpTimer }}s</p>
  <button class="btn btn-sm btn-danger" @click="stopTimer();" title="Cancel Timer">
    <i class="fs-6">x</i> <!-- "x" icon to close the timer -->
  </button>
</div>


</div>
    </div>
  </div>
</div>


<!-- Category Box and Question Modal -->
<div class="game-board">
  <!-- Question Modal -->
  <div v-if="currentQuestion" class="category-box">
    <div class="category-header mb-3">
      <img :src="currentCategory.image" alt="Category Image" class="category-image mb-3">
      <h5>{{ currentCategory.name }} - {{ currentQuestion.points }} Points</h5>
    </div>
    <p class="question-text fs-4">{{ currentQuestion.question }}</p>

    <!-- Answer Section -->
    <div v-if="showAnswer" class="answer-section mb-4">
      <p class="text-success"><strong>Answer:</strong> {{ currentQuestion.answer }}</p>
      <div class="d-flex justify-content-center gap-3">
        <button v-for="(team, index) in teams" :key="team.id" class="btn btn-outline-success" @click="awardPoints(index)">
          {{ team.name }}
        </button>
      </div>
    </div>

    <!-- Buttons Section -->
    <div class="buttons mt-4 d-flex justify-content-between">
      <button class="btn btn-warning" @click="toggleAnswer">
        {{ showAnswer ? 'Back to Question' : 'Show Answer' }}
      </button>
      <button class="btn btn-secondary" @click="closeModal">Back to Board</button>
    </div>
  </div>

  <!-- Game Board -->
  <div v-else class="row">
  <div 
    v-for="category in selectedCategories" 
    :key="category.id" 
    :class="{
      'col-md-4': selectedCategories.length >= 3, 
      'col-md-6': selectedCategories.length === 2,
      'col-md-12': selectedCategories.length === 1
    }"
    class="mb-4"
  >
    <!-- Category Card -->
    <div class="card shadow-sm">
      <div class="card-header bg-secondary text-white text-center">
        <h5>{{ category.name }}</h5>
      </div>
      <div class="card-body">
        <div v-for="(question, index) in category.questions" :key="index" class="question-box mb-2" :class="{ 'answered': question.answered }" @click="selectQuestion(category, question)">
          <button class="btn btn-warning btn-sm w-100" :disabled="question.answered">{{ question.points }} Points</button>
        </div>
      </div>
    </div>
  </div>
</div>

</div>


    </div>

    <!-- Winner Modal -->
<div v-if="showWinnerModal" class="modal-overlay">
  <div class="modal-content text-center">
    <h2 class="mb-4">🏆 Game Over!</h2>
    <h4 class="mb-3">Top Teams:</h4>

    <div v-if="topTeams.length === 1 || teams.length === 2">
      <h3 class="text-success">{{ topTeams[0].name }} wins with {{ topTeams[0].score }} points! 🎉</h3>
    </div>
    <div v-else>
      <ol class="text-start fs-5">
        <li v-for="(team, index) in topTeams" :key="index">
          {{ team.name }} - {{ team.score }} points
        </li>
      </ol>
    </div>

    <button class="btn btn-primary mt-4" @click="router.push('/')">Start New Game</button>
  </div>
</div>

  </div>
</template>







<script setup>
import AppHeader from '../components/AppHeader.vue';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const route = useRoute();
const router = useRouter();

const selectedCategories = ref([]);
const teams = ref([]);
const currentQuestion = ref(null);
const currentCategory = ref(null);
const showAnswer = ref(false);

// Load categories and teams from previous screen
onMounted(() => {
  if (!route.query.categories || !route.query.teams) {
    router.push('/');
    return;
  }

  const categories = JSON.parse(route.query.categories);
  fullCategories.value = categories; // Save full category data


  selectedCategories.value = categories.map(category => {
    const groupedByPoints = {
      100: [],
      200: [],
      300: [],
      400: []
    };

    // Group questions by their point values
    category.questions.forEach(q => {
      if (groupedByPoints[q.points]) {
        groupedByPoints[q.points].push(q);
      }
    });

    // Shuffle helper
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

    return {
      ...category,
      questions: [
        ...shuffle(groupedByPoints[100]).slice(0, 2),
        ...shuffle(groupedByPoints[200]).slice(0, 2),
        ...shuffle(groupedByPoints[300]).slice(0, 1),
        ...shuffle(groupedByPoints[400]).slice(0, 1)
      ]
    };
  });

  teams.value = JSON.parse(route.query.teams).map(team => ({
    ...team,
    score: 0,
    abilities: {
      doublePoints: true,
      changeQuestion: true,
      callForHelp: true
    },
    isUsingDouble: false
  }));
});


const currentTeamIndex = ref(0);
const allQuestionsAnswered = ref(false);
const showWinnerModal = ref(false);

// Move to the next team in round-robin fashion
const nextTeamTurn = () => {
  currentTeamIndex.value = (currentTeamIndex.value + 1) % teams.value.length;
};

// Check if all questions are answered
const checkIfGameOver = () => {
  const totalQuestions = selectedCategories.value.flatMap(cat => cat.questions);
  if (totalQuestions.every(q => q.answered)) {
    allQuestionsAnswered.value = true;
    showWinnerModal.value = true;
  }
};

// Wrap existing closeModal to also rotate team and check for game over
const closeModal = () => {
  currentQuestion.value = null;
  currentCategory.value = null;
  showAnswer.value = false;
  stopTimer();   // Stop timer if active
  checkIfGameOver();
};

// Sort teams by score and return top 3
const topTeams = computed(() => {
  return [...teams.value].sort((a, b) => b.score - a.score).slice(0, 3);
});

// Select a question to display in the modal
const selectQuestion = (category, question) => {
  if (question.answered) return;
  currentCategory.value = category;
  currentQuestion.value = question;
  showAnswer.value = false;
};


// Adjust score manually
const adjustScore = (index, value) => {
  teams.value[index].score = Math.max(0, teams.value[index].score + value);
};

// Award points to the selected team
const awardPoints = (teamIndex) => {
  if (currentQuestion.value && !currentQuestion.value.answered) {
  let points = currentQuestion.value.points;
  const team = teams.value[teamIndex];

  if (team.isUsingDouble) {
    points *= 2;
    team.isUsingDouble = false;
  }

  team.score += points;
  currentQuestion.value.answered = true;
  nextTeamTurn();
  closeModal();
}};

const activateDoublePoints = (index) => {
  if (teams.value[index].abilities.doublePoints) {
    teams.value[index].isUsingDouble = true;
    teams.value[index].abilities.doublePoints = false;
  }
};


const fullCategories = ref([]); // This holds full category data (with all questions)

const useChangeQuestionAbility = (index) => {
  if (
    !teams.value[index].abilities.changeQuestion ||
    index !== currentTeamIndex.value ||
    !currentCategory.value ||
    !currentQuestion.value
  ) return;

  const currentCatName = currentCategory.value.name;
  const currentPoints = currentQuestion.value.points;

  if (!currentCatName || !currentPoints) {
    console.error('Missing current category or points');
    return;
  }

  const fullCategory = fullCategories.value.find(cat => cat.name === currentCatName);
  const selectedCategory = selectedCategories.value.find(cat => cat.name === currentCatName);

  if (!fullCategory || !selectedCategory) {
    console.error('Full or selected category not found');
    return;
  }

  const answeredQuestions = selectedCategory.questions
    .filter(q => q.answered)
    .map(q => q.question);

  const samePointQuestions = fullCategory.questions.filter(q =>
    q.points === currentPoints &&
    q.question !== currentQuestion.value.question &&
    !answeredQuestions.includes(q.question)
  );

  if (samePointQuestions.length > 0) {
    const newQuestion = samePointQuestions[Math.floor(Math.random() * samePointQuestions.length)];

    const indexToReplace = selectedCategory.questions.findIndex(
      q => q.question === currentQuestion.value.question
    );

    if (indexToReplace !== -1) {
      selectedCategory.questions[indexToReplace] = newQuestion;
      currentQuestion.value = newQuestion;
      showAnswer.value = false;
      teams.value[index].abilities.changeQuestion = false;
    }
  } else {
    alert('No other question available with the same points in this category.');
  }
};










const callForHelpTimer = ref(60);
const callForHelpActive = ref(false);
let callTimerInterval;

const useCallForHelp = (index) => {
  if (!teams.value[index].abilities.callForHelp || index !== currentTeamIndex.value) return;

  teams.value[index].abilities.callForHelp = false;
  callForHelpActive.value = true;
  callForHelpTimer.value = 60;

  callTimerInterval = setInterval(() => {
    callForHelpTimer.value--;
    if (callForHelpTimer.value === 0) {
      clearInterval(callTimerInterval);
      callForHelpActive.value = false;
    }
  }, 1000);
};

// Cancel the timer manually
// Stop the call for help timer
const stopTimer = () => {
  if (callTimerInterval) {
    clearInterval(callTimerInterval);
    callForHelpActive.value = false;
  }
};





// Toggle the answer visibility
const toggleAnswer = () => {
  showAnswer.value = !showAnswer.value;
};


</script>







<style scoped>
/* General Styles */
body {
  font-family: 'Arial', sans-serif;
}

/* Team List (Left Sidebar) */
.team-list-container {
  width: 250px;
  margin-right: 20px;
  flex-shrink: 0;
}

.team-list {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
}

.team-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.team-list button {
  font-size: 1.25rem;
  width: 35px;
  height: 35px;
  border-radius: 50%;
}

/* Category Box */
.category-box {
  background-color: #f1f1f1;
  padding: 20px;
  border-radius: 10px;
  max-width: 800px;
  margin: auto;
}

.category-header {
  text-align: center;
}

.category-image {
  width: 100%;
  max-width: 150px;
  height: auto;
  border-radius: 8px;
}

.question-text {
  font-size: 1.25rem;
  text-align: center;
}

/* Game Board */
.game-board {
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  border-radius: 10px;
  width: calc(33% - 20px);
  min-width: 280px;
  margin-bottom: 20px;
}

.card-header {
  font-size: 1.25rem;
  font-weight: bold;
  border-radius: 10px 10px 0 0;
}

.card-body .d-flex {
  justify-content: space-between;
  align-items: center;
}

.card-body button {
  font-size: 1.25rem;
  width: 100%;
  height: 40px;
  border-radius: 8px;
}

/* Button Hover Effects */
button:hover {
  opacity: 0.8;
}

/* Modal Buttons */
.buttons button {
  font-size: 1.25rem;
  padding: 10px 20px;
}

.buttons button:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .category-box {
    width: 100%;
    padding: 15px;
  }

  .buttons button {
    font-size: 1rem;
    width: 45%;
  }

  .game-board {
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 100%;
  }
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(33, 37, 41, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.25);
}

</style>

