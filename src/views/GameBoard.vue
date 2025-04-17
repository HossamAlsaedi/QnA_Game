<template>
  <LoadSpinner :loading="loading" />
  <div class="game-container rtl">
    <AppHeader />
    
    <!-- Current Team Turn Banner -->
    <div v-if="teams.length > 0" class="team-turn-banner">
      <div class="team-turn-content">
        <div class="team-avatar">{{ teams[currentTeamIndex].name.charAt(0) }}</div>
        <span>دور فريق <strong>{{ teams[currentTeamIndex].name }}</strong>!</span>
      </div>
    </div>
    
    <div v-if="!loading" class="main-content">
      <!-- Team List Sidebar -->
      <div class="teams-sidebar">
        <div v-if="teams.length > 0" class="teams-panel">
          <h4 class="teams-header">الفرق</h4>
          
          <div 
            v-for="(team, index) in teams" 
            :key="team.id" 
            class="team-card"
            :class="{ 'active-team': index === currentTeamIndex }"
          >
            <!-- Team Name and Score -->
            <div class="team-header">
              <div class="team-avatar">{{ team.name.charAt(0) }}</div>
              <h5>{{ team.name }}</h5>
            </div>
            
            <!-- Score Controls -->
            <div class="score-controls">
              <button class="score-btn decrease" @click="adjustScore(index, -100)">-</button>
              <span class="team-score">{{ team.score }}</span>
              <button class="score-btn increase" @click="adjustScore(index, 100)">+</button>
            </div>
            
            <!-- Special Abilities -->
            <div v-if="index === currentTeamIndex"  class="team-abilities">
              <button 
                class="ability-btn double-points"
                :class="{ 
                  'active': team.doubleActive,
                  'disabled': !team.abilities.doublePoints || index !== currentTeamIndex
                }"
                :disabled="!team.abilities.doublePoints || index !== currentTeamIndex"
                @click="activateDoublePoints(index)"
                title="نقاط مضاعفة"
              >
                <span>×2</span>
              </button>
              
              <button 
                class="ability-btn change-question"
                :class="{ 'disabled': !team.abilities.changeQuestion || index !== currentTeamIndex || !currentQuestion }"
                :disabled="!team.abilities.changeQuestion || index !== currentTeamIndex || !currentQuestion"
                @click="useChangeQuestionAbility(index)"
                title="تغيير السؤال"
              >
                <i class="fa fa-solid fa-arrow-left"></i>
              </button>
              
              <button 
                class="ability-btn call-help"
                :class="{ 'disabled': !team.abilities.callForHelp || index !== currentTeamIndex || !currentQuestion }"
                :disabled="!team.abilities.callForHelp || index !== currentTeamIndex || !currentQuestion"
                @click="useCallForHelp(index)"
                title="طلب المساعدة"
              >
                <i class="fa fa-solid fa-phone fa-xs"></i>
              </button>
            </div>
            
            <!-- Help Timer -->
            <div v-if="callForHelpActive && index === currentTeamIndex" class="help-timer">
              <div class="timer-display">
                <div class="timer-progress" :style="{ width: `${(callForHelpTimer/60)*100}%` }"></div>
                <span>{{ callForHelpTimer }}ث</span>
              </div>
              <button class="timer-cancel" @click="stopTimer()">إلغاء</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Game Board -->
      <div class="game-board">
        <!-- Categories Grid -->
        <div v-if="!currentQuestion" class="categories-grid">
          <div 
            v-for="category in selectedCategories" 
            :key="category.id" 
            class="category-container"
          >
            <div class="category-card">
              <!-- Right Questions Column (was Left) -->
              <div class="questions-column right">
                <button 
                  v-for="(question, idx) in category.questions.slice(0, 3)" 
                  :key="idx"
                  class="question-btn"
                  :class="{ 'answered': question.answered }"
                  :disabled="question.answered || isButtonDisabled(category.id, question.points, idx)"
                  @click="!isButtonDisabled(category.id, question.points, idx) && selectQuestion(category, question, idx)"
                >
                  {{ question.points }}
                </button>
              </div>
              
              <!-- Center Category Info -->
              <div class="category-info">
                <img :src="getImagePath(category.image)" alt="صورة الفئة" class="category-thumbnail">
                <h5>{{ category.name }}</h5>
              </div>
              
              <!-- Left Questions Column (was Right) -->
              <div class="questions-column left">
                <button 
                  v-for="(question, idx) in category.questions.slice(3)" 
                  :key="idx + 3"
                  class="question-btn"
                  :class="{ 'answered': question.answered }"
                  :disabled="question.answered || isButtonDisabled(category.id, question.points, idx + 3)"
                  @click="!isButtonDisabled(category.id, question.points, idx + 3) && selectQuestion(category, question, idx + 3)"
                >
                  {{ question.points }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Question Modal -->
    <div v-if="currentQuestion" class="question-modal">
      <div class="question-card">
        <div class="question-header">
          <img :src="getImagePath(currentCategory.image)" alt="صورة الفئة" class="category-image">
          <div class="question-meta">
            <h4>{{ currentCategory.name }}</h4>
            <div class="points-badge">{{ currentQuestion.points }} نقطة</div>
          </div>
        </div>
        
        <div class="question-content">
          <p>{{ currentQuestion.question }}</p>
        </div>
        
        <!-- Team Abilities Bar Inside the Question Modal -->
        <div v-if="teams.length > 0" class="modal-team-abilities">
          <div class="current-team-info">
            <div class="team-avatar modal-avatar">{{ teams[currentTeamIndex].name.charAt(0) }}</div>
            <span>{{ teams[currentTeamIndex].name }}</span>
          </div>
          
          <div class="ability-controls">
            <button 
              class="ability-btn double-points"
              :class="{ 
                'active': teams[currentTeamIndex].doubleActive,
                'disabled': !teams[currentTeamIndex].abilities.doublePoints
              }"
              :disabled="!teams[currentTeamIndex].abilities.doublePoints"
              @click="activateDoublePoints(currentTeamIndex)"
              title="نقاط مضاعفة"
            >
              <span>×2</span>
              <span class="btn-label">مضاعفة</span>
            </button>
            
            <button 
              class="ability-btn change-question"
              :class="{ 'disabled': !teams[currentTeamIndex].abilities.changeQuestion }"
              :disabled="!teams[currentTeamIndex].abilities.changeQuestion"
              @click="useChangeQuestionAbility(currentTeamIndex)"
              title="تغيير السؤال"
            >
              <i class="fa fa-solid fa-arrow-left"></i>
              <span class="btn-label">تخطي</span>
            </button>
            
            <button 
              class="ability-btn call-help"
              :class="{ 'disabled': !teams[currentTeamIndex].abilities.callForHelp }"
              :disabled="!teams[currentTeamIndex].abilities.callForHelp"
              @click="useCallForHelp(currentTeamIndex)"
              title="طلب المساعدة"
            >
              <i class="fa fa-solid fa-phone fa-xs"></i>
              <span class="btn-label">مساعدة</span>
            </button>
          </div>
          
          <!-- Help Timer in Modal -->
          <div v-if="callForHelpActive && currentTeamIndex === currentTeamIndex" class="modal-help-timer">
            <div class="timer-display">
              <div class="timer-progress" :style="{ width: `${(callForHelpTimer/60)*100}%` }"></div>
              <span>{{ callForHelpTimer }}ث</span>
            </div>
            <button class="timer-cancel" @click="stopTimer()">إلغاء</button>
          </div>
        </div>
        
        <!-- Answer Section -->
        <div v-if="showAnswer" class="answer-section">
          <div class="answer-reveal">
            <p><strong>الإجابة:</strong> {{ currentQuestion.answer }}</p>
          </div>
          
          <div class="team-award">
            <p>منح النقاط إلى:</p>
            <div class="award-buttons">
              <button 
                v-for="(team, index) in teams" 
                :key="team.id" 
                class="award-btn"
                @click="awardPoints(index)"
              >
                {{ team.name }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Control Buttons -->
        <div class="modal-controls">
          <button class="toggle-answer" @click="toggleAnswer">
            {{ showAnswer ? 'إخفاء الإجابة' : 'إظهار الإجابة' }}
          </button>
          <button class="close-modal" @click="closeModal">العودة إلى اللوحة</button>
        </div>
      </div>
    </div>
    
    <!-- Winner Modal -->
    <div v-if="showWinnerModal" class="winner-modal-overlay">
      <div class="winner-modal">
        <div class="confetti-container">
          <div class="confetti" v-for="n in 20" :key="n"></div>
        </div>
        
        <h2>انتهت اللعبة!</h2>
        <div class="trophy-icon">🏆</div>
        
        <div v-if="topTeams.length === 1 || teams.length === 2" class="winner-single">
          <h3>{{ topTeams[0].name }} هو الفائز!</h3>
          <div class="winner-score">{{ topTeams[0].score }} نقطة</div>
        </div>
        <div v-else class="winner-list">
          <h4>أفضل الفرق:</h4>
          <ol>
            <li v-for="(team, index) in topTeams" :key="index">
              {{ team.name }} - {{ team.score }} نقطة
            </li>
          </ol>
        </div>
        
        <button class="new-game-btn" @click="router.push('/')">بدء لعبة جديدة</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue';
import LoadSpinner from '../components/LoadSpinner.vue';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const selectedCategories = ref([]);
const teams = ref([]);
const currentQuestion = ref(null);
const currentCategory = ref(null);
const showAnswer = ref(false);
const normalizeCategoryName = (name) => name.toLowerCase().replace(/\s+/g, '_');
const getGameState = () => {
  return JSON.parse(sessionStorage.getItem('gameState') || '{}');
};
const setGameState = (newState) => {
  sessionStorage.setItem('gameState', JSON.stringify({ ...getGameState(), ...newState }));
};
const clearGameState = () => {
  sessionStorage.removeItem('gameState');
};
const getImagePath = (imageName) => {
  if (!imageName) return ''; // prevent runtime errors
  return `${import.meta.env.BASE_URL}Images/${imageName}`;
};
const loading = ref(true); 

onMounted(() => {
  const gameState = getGameState();
  const categoriesData = JSON.stringify(gameState.categories);
  const teamsData = JSON.stringify(gameState.teams); 
  
  if (!categoriesData || !teamsData) {
    router.push('/');
    return;
  }
  
  const categories = JSON.parse(categoriesData);
  fullCategories.value = categories;
  
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
  
  const pickQuestions = (questions, count, categoryId, pointValue, fullSet, categoryName) => {
    const storageKey = 'quizAnsweredQuestions';
    const answeredMap = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const key = `${normalizeCategoryName(categoryName)}_${pointValue}`;
    const used = answeredMap[key] || [];
    const unused = questions.filter(q => !used.includes(q.question));
    
    if (unused.length < count) {
      delete answeredMap[key]; // allow reuse
      localStorage.setItem(storageKey, JSON.stringify(answeredMap));
      const resetPool = fullSet.filter(q => q.points === pointValue);
      return shuffle(resetPool).slice(0, count);
    }
    
    return shuffle(unused).slice(0, count);
  };
  
  let availableQuestions = gameState.availableQuestions || {};
  const alreadyPicked = Object.keys(availableQuestions).length > 0;
  
  selectedCategories.value = categories.map(category => {
    const groupedByPoints = { 100: [], 200: [], 300: [], 400: [] };
    
    category.questions.forEach(q => {
      if (groupedByPoints[q.points]) {
        groupedByPoints[q.points].push(q);
      }
    });
    
    if (alreadyPicked && gameState.selectedCategories) {
      const prev = gameState.selectedCategories;
      const match = prev.find(cat => cat.id === category.id);
      if (match) {
        return match;
      }
    }
    
    const picked100 = pickQuestions(groupedByPoints[100], 2, category.id, 100, category.questions, category.name);
    const picked200 = pickQuestions(groupedByPoints[200], 2, category.id, 200, category.questions, category.name);
    const picked300 = pickQuestions(groupedByPoints[300], 1, category.id, 300, category.questions, category.name);
    const picked400 = pickQuestions(groupedByPoints[400], 1, category.id, 400, category.questions, category.name);
    
    availableQuestions[category.id] = {
      100: picked100.length,
      200: picked200.length,
      300: picked300.length,
      400: picked400.length
    };
    
    return {
      ...category,
      questions: [...picked100, ...picked200, ...picked300, ...picked400]
    };
  });
  
  // Save only if this is the first time generating
  if (!alreadyPicked) {
    setGameState({
      selectedCategories: selectedCategories.value,
      availableQuestions
    });
  }

  teams.value = JSON.parse(teamsData).map(team => ({
    ...team,
    score: team.score ?? 0,
    isUsingDouble: team.isUsingDouble ?? false,
    doubleActive: team.doubleActive ?? false,
    abilities: {
      doublePoints: team.abilities?.doublePoints ?? true,
      changeQuestion: team.abilities?.changeQuestion ?? true,
      callForHelp: team.abilities?.callForHelp ?? true
    }
  }));
  
  const savedTeamIndex = gameState.currentTeamIndex;
  if (savedTeamIndex !== null) {
    currentTeamIndex.value = parseInt(savedTeamIndex);
  }
  
  const savedQuestion = gameState.currentQuestion;
  const savedCategory = gameState.currentCategory;
  
  if (savedQuestion && savedCategory) {
    const parsedQuestion = savedQuestion;
    const parsedCategory = savedCategory;
    const matchingCategory = selectedCategories.value.find(cat => cat.id === parsedCategory.id);
    
    if (matchingCategory) {
      const matchingQuestion = matchingCategory.questions.find(q => q.question === parsedQuestion.question);
      if (matchingQuestion && !matchingQuestion.answered) {
        currentCategory.value = matchingCategory;
        currentQuestion.value = {
          ...matchingQuestion,
          slotIndex: parsedQuestion.slotIndex
        };
        showAnswer.value = false;
      }
    }
  }
  
  loading.value = false;
});

const currentTeamIndex = ref(0);
const allQuestionsAnswered = ref(false);
const showWinnerModal = ref(false);

// Move to the next team in round-robin fashion
const nextTeamTurn = () => {
  currentTeamIndex.value = (currentTeamIndex.value + 1) % teams.value.length;
  setGameState({ currentTeamIndex: currentTeamIndex.value });
};

// Check if all questions are answered
const checkIfGameOver = () => {
  const totalQuestions = selectedCategories.value.flatMap(cat => cat.questions);
  if (totalQuestions.every(q => q.answered)) {
    allQuestionsAnswered.value = true;
    showWinnerModal.value = true;
    clearGameState();
  }
};

// Close the question modal
const closeModal = () => {
  currentQuestion.value = null;
  currentCategory.value = null;
  showAnswer.value = false;
  stopTimer();  // Stop timer if active
  checkIfGameOver();
  setGameState({
    currentQuestion: null,
    currentCategory: null
  });
};

// Sort teams by score and return top 3
const topTeams = computed(() => {
  return [...teams.value].sort((a, b) => b.score - a.score).slice(0, 3);
});

// Select a question to display in the modal
const selectQuestion = (category, question, index) => {
  currentCategory.value = category;
  currentQuestion.value = { ...question, slotIndex: index };
  showAnswer.value = false;
  setGameState({
    currentQuestion: currentQuestion.value,
    currentCategory: currentCategory.value
  });
};

// Adjust score manually
const adjustScore = (index, value) => {
  teams.value[index].score = Math.max(0, teams.value[index].score + value);
  setGameState({ teams: teams.value });
};

// Award points to the selected team
const awardPoints = (teamIndex) => {
  if (currentQuestion.value && !currentQuestion.value.answered) {
    let points = currentQuestion.value.points;
    const team = teams.value[teamIndex];
    
    // Handle double points ability
    if (team.isUsingDouble) {
      points *= 2;
      team.isUsingDouble = false; // Reset the double points flag
      team.doubleActive = false; // Reset the active styling      
    }
    
    // Award points and mark question as answered
    team.score += points;
    currentQuestion.value.answered = true;
    
    // Deactivate abilities that were used
    if (team.isUsingDouble) {
      team.isUsingDouble = false; // Ensure double points is reset
      team.doubleActive = false;  // Remove the active styling for double points
    }
    
    // Only disable used abilities, not those still available for future use
    teams.value.forEach(t => {
      if (t.isUsingDouble) {
        t.isUsingDouble = false; // Deactivate double points for the team that used it
        t.doubleActive = false;  // Remove the active styling for double points
      }
    });
    
    // Update game state after awarding points and answering the question
    const catIndex = selectedCategories.value.findIndex(cat => cat.id === currentCategory.value.id);
    if (catIndex !== -1) {
      const qIndex = selectedCategories.value[catIndex].questions.findIndex(q => q.question === currentQuestion.value.question);
      if (qIndex !== -1) {
        selectedCategories.value[catIndex].questions[qIndex].answered = true;
        setGameState({ selectedCategories: selectedCategories.value });
      }
    }
    
    // Save the updated teams data in sessionStorage
    setGameState({ teams: teams.value });
    
    // Track answered question in localStorage (by question text)
    if (currentCategory.value) {
      const catId = currentCategory.value.id;
      const questionPoints = currentQuestion.value.points;
      const answeredKey = 'quizAnsweredQuestions';
      const answeredMap = JSON.parse(localStorage.getItem(answeredKey) || '{}');
      const key = `${normalizeCategoryName(currentCategory.value.name)}_${questionPoints}`;
      
      if (!answeredMap[key]) {
        answeredMap[key] = [];
      }
      
      if (!answeredMap[key].includes(currentQuestion.value.question)) {
        answeredMap[key].push(currentQuestion.value.question);
        localStorage.setItem(answeredKey, JSON.stringify(answeredMap));
      }
      
      // Decrement available questions (if tracked)
      const availableData = JSON.parse(sessionStorage.getItem('availableQuestions') || '{}');
      if (availableData[catId] && availableData[catId][questionPoints] > 0) {
        availableData[catId][questionPoints] -= 1;
        setGameState({ availableQuestions });
      }
      
      // Track disabled button slot (based on slotIndex)
      const slotIndex = currentQuestion.value.slotIndex;
      const gameState = getGameState();
      const disabledButtons = gameState.disabledButtons || {};
      
      if (!disabledButtons[catId]) {
        disabledButtons[catId] = {};
      }
      
      if (!disabledButtons[catId][questionPoints]) {
        disabledButtons[catId][questionPoints] = [];
      }
      
      if (!disabledButtons[catId][questionPoints].includes(slotIndex)) {
        disabledButtons[catId][questionPoints].push(slotIndex);
        setGameState({ disabledButtons });
      }
    }
    
    nextTeamTurn();
    closeModal();
  }
};

// Check if a question button should be disabled
const isButtonDisabled = (categoryId, pointValue, index) => {
  const disabledButtons = JSON.parse(sessionStorage.getItem('disabledButtons') || '{}');
  return (
    disabledButtons[categoryId] &&
    disabledButtons[categoryId][pointValue] &&
    disabledButtons[categoryId][pointValue].includes(index)
  );
};

// Activate double points ability
const activateDoublePoints = (index) => {
  const team = teams.value[index];
  if (team.abilities.doublePoints && index === currentTeamIndex.value) {
    team.isUsingDouble = true; // Marks the double points as being used
    team.doubleActive = true;  // Used for styling in the UI
    team.abilities.doublePoints = false; // Disable the ability after use
    setGameState({ teams: teams.value }); // Save the updated state
  }
};

const fullCategories = ref([]); // This holds full category data (with all questions)

// Use the change question ability
const useChangeQuestionAbility = (index) => {
  if (
    !teams.value[index].abilities.changeQuestion ||
    index !== currentTeamIndex.value ||
    !currentCategory.value ||
    !currentQuestion.value
  ) return;

  const currentCatId = currentCategory.value.id;
  const currentPoints = currentQuestion.value.points;

  if (!currentCatId || !currentPoints) {
    console.error('Missing current category ID or points');
    return;
  }

  const fullCategory = fullCategories.value.find(cat => cat.id === currentCatId);
  const selectedCategory = selectedCategories.value.find(cat => cat.id === currentCatId);

  if (!fullCategory || !selectedCategory) {
    console.error('Full or selected category not found');
    return;
  }

  const answeredKey = 'quizAnsweredQuestions';
  const answeredMap = JSON.parse(localStorage.getItem(answeredKey) || '{}');
  const mapKey = `${normalizeCategoryName(currentCategory.value.name)}_${currentPoints}`;
  const answeredQuestions = answeredMap[mapKey] || [];

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
      const originalSlotIndex = currentQuestion.value.slotIndex;

      // Replace question in selectedCategory
      selectedCategory.questions[indexToReplace] = {
        ...newQuestion,
        slotIndex: originalSlotIndex,
      };

      // Update current question
      currentQuestion.value = {
        ...newQuestion,
        slotIndex: originalSlotIndex,
      };

      showAnswer.value = false;
      teams.value[index].abilities.changeQuestion = false;

      // Update localStorage with newly used question
      answeredMap[mapKey] = answeredQuestions.concat(newQuestion.question);
      localStorage.setItem(answeredKey, JSON.stringify(answeredMap));

      // ✅ Save updated state
      setGameState({
        selectedCategories: selectedCategories.value,
        currentQuestion: currentQuestion.value,
        currentCategory: currentCategory.value,
        teams: teams.value,
        currentTeamIndex: currentTeamIndex.value
      });
    }
  } else {
    const remainingQuestions = selectedCategory.questions.filter(q => !q.answered);
    if (remainingQuestions.length === 1) {
      const lastQuestion = remainingQuestions[0];
      alert('Only one question is left in this category, so the last question will be used.');
      currentQuestion.value = lastQuestion;
      selectedCategory.questions.find(q => q.question === lastQuestion.question).answered = true;
      answeredQuestions.push(lastQuestion.question);
      localStorage.setItem(answeredKey, JSON.stringify(answeredMap));
      teams.value[index].abilities.changeQuestion = false;

      // Save updated state
      setGameState({
        selectedCategories: selectedCategories.value,
        currentQuestion: currentQuestion.value,
        currentCategory: currentCategory.value,
        teams: teams.value,
        currentTeamIndex: currentTeamIndex.value
      });
    } else {
      alert('No other question available with the same points in this category.');
    }
  }
};


// Call for help ability
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
  setGameState({
        teams: teams.value,
      });
};

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
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.rtl {
  direction: rtl;
  text-align: right;
}

.game-container {
  font-family: 'Dubai', 'Amiri', 'Arial', sans-serif;
  background-color: #f0f5ff;
  min-height: 100vh;
  padding-bottom: 2rem;
}

/* Team Turn Banner */
.team-turn-banner {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.team-turn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.25rem;
}

.team-avatar {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  text-transform: uppercase;
}

/* Main Layout */
.main-content {
  display: flex;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  flex-direction: row-reverse; /* Changed for RTL */
}

/* Teams Sidebar */
.teams-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.teams-panel {
  background-color: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.teams-header {
  color: #4f46e5;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  position: relative;
}

.teams-header:after {
  content: '';
  display: block;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #8b5cf6);
  margin: 8px auto 0;
  border-radius: 2px;
}

.team-card {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.team-card.active-team {
  border-color: #4f46e5;
  background-color: rgba(79, 70, 229, 0.05);
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.1);
}

.team-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.team-header h5 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

/* Score Controls */
.score-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.75rem 0;
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 8px;
}

.team-score {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4f46e5;
}

.score-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.2s;
}

.score-btn.decrease {
  background-color: #fee2e2;
  color: #dc2626;
}

.score-btn.increase {
  background-color: #dcfce7;
  color: #16a34a;
}

.score-btn:hover {
  transform: scale(1.08);
}

/* Team Abilities */
.team-abilities {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.ability-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  background-color: #e0e7ff;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.ability-btn.double-points {
  background-color: #fef3c7;
  color: #d97706;
}

.ability-btn.double-points.active {
  background-color: #fcd34d;
  box-shadow: 0 0 0 2px #d97706;
}

.ability-btn.change-question {
  background-color: #e0f2fe;
  color: #0284c7;
}

.ability-btn.call-help {
  background-color: #fce7f3;
  color: #db2777;
}

.ability-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.ability-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #e5e7eb;
  color: #9ca3af;
}

/* Help Timer */
.help-timer {
  margin-top: 0.75rem;
}

.timer-display {
  background-color: #f3f4f6;
  border-radius: 8px;
  height: 24px;
  position: relative;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.timer-progress {
  background: linear-gradient(90deg, #ec4899, #db2777);
  height: 100%;
  transition: width 1s linear;
}

.timer-display span {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.timer-cancel {
  width: 100%;
  padding: 0.25rem;
  border: none;
  border-radius: 4px;
  background-color: #f9a8d4;
  color: #831843;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.75rem;
}

/* Game Board */
.game-board {
  flex: 1;
  background-color: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.category-container {
  display: flex;
  flex-direction: column;
}

.category-card {
  background: linear-gradient(135deg, #f7f9fc, #edf2ff);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.25rem;
  height: 100%;
  display: flex;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.category-info {
  text-align: center;
  padding: 0 1rem;
  flex: 1;
}

.category-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.category-info h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.questions-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 80px;
}

/* Adjusted for RTL layout */
.questions-column.left {
  order: 3;
}

.questions-column.right {
  order: 1;
}

.category-info {
  order: 2;
}

.question-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}

.question-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
}

.question-btn.answered {
  background-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.question-btn:disabled {
  background-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Question Modal */
.question-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(31, 41, 55, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 50;
}

.question-card {
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.question-header {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  color: white;
  padding: 1.25rem;
}

/* RTL support for question header */
.rtl .question-header {
  flex-direction: row-reverse;
}

.category-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  margin-left: 1rem; /* Changed for RTL */
}

.question-meta {
  flex: 1;
}

.question-meta h4 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.points-badge {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.question-content {
  padding: 2rem;
  font-size: 1.5rem;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-content p {
  max-width: 90%;
  line-height: 1.5;
}

/* Modal Team Abilities */
.modal-team-abilities {
  background-color: #f3f4f6;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.current-team-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.modal-avatar {
  background-color: #6366f1;
  color: white;
}

.ability-controls {
  display: flex;
  gap: 0.75rem;
}

.ability-controls .ability-btn {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
}

.ability-btn .btn-label {
  font-size: 0.7rem;
  font-weight: 600;
}

.modal-help-timer {
  width: 100%;
  margin-top: 0.75rem;
}

/* Answer Section */
.answer-section {
  padding: 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.answer-reveal {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f0fdf4;
  border-radius: 8px;
  border-right: 4px solid #16a34a; /* Changed for RTL */
  border-left: none;
}

.team-award {
  text-align: center;
}

.team-award p {
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #4b5563;
}

.award-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.award-btn {
  padding: 0.5rem 1rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.award-btn:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
}

/* Modal Controls */
.modal-controls {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.toggle-answer, .close-modal {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.toggle-answer {
  background-color: #fef3c7;
  color: #d97706;
  flex: 1;
}

.toggle-answer:hover {
  background-color: #fde68a;
}

.close-modal {
  background-color: #e0e7ff;
  color: #4f46e5;
  flex: 1;
}

.close-modal:hover {
  background-color: #c7d2fe;
}

/* Winner Modal */
.winner-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(79, 70, 229, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.winner-modal {
  background-color: white;
  border-radius: 20px;
  padding: 3rem;
  width: 90%;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #4f46e5;
  opacity: 0.8;
  animation: fall 5s linear infinite;
  top: -20px;
}

.confetti:nth-child(2n) {
  background-color: #ec4899;
  width: 12px;
  height: 12px;
}

.confetti:nth-child(3n) {
  background-color: #fcd34d;
  width: 8px;
  height: 8px;
}

.confetti:nth-child(4n) {
  background-color: #10b981;
  width: 14px;
  height: 14px;
}

@keyframes fall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(800px) rotate(360deg);
    opacity: 0;
  }
}

.winner-modal h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #4f46e5;
  position: relative;
  z-index: 1;
}

.trophy-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.winner-single h3 {
  font-size: 1.75rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.winner-score {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.winner-list {
  margin: 1rem 0 2rem;
  position: relative;
  z-index: 1;
}

.winner-list h4 {
  font-size: 1.25rem;
  color: #1f2937;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.winner-list ol {
  text-align: center;
  list-style-position: inside;
  margin: 0 auto;
  max-width: 300px;
}

.winner-list li {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: #4b5563;
  position: relative;
  z-index: 1;
}

.new-game-btn {
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  position: relative;
  z-index: 1;
}

.new-game-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(79, 70, 229, 0.4);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  
  .teams-sidebar {
    width: 100%;
    margin-bottom: 1.5rem;
  }
  
  .teams-panel {
    padding: 1rem;
  }
  
  .category-card {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .question-content {
    font-size: 1.25rem;
    padding: 1.5rem;
  }
  
  .modal-team-abilities {
    flex-direction: column;
    align-items: stretch;
  }
  
  .current-team-info {
    justify-content: center;
  }
  
  .ability-controls {
    justify-content: center;
  }
  
  .winner-modal {
    padding: 2rem 1.5rem;
  }
}

/* RTL-specific adjustments */
.rtl .category-image {
  margin-left: 0;
  margin-right: 1rem;
}

.rtl .answer-reveal {
  border-right: none;
  border-left: 4px solid #16a34a;
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Loading spinner */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(79, 70, 229, 0.2);
  border-radius: 50%;
  border-top-color: #4f46e5;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Additional animations for better UX */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.question-card, .category-card, .team-card {
  animation: fadeIn 0.3s ease-out;
}

/* Double points active indicator pulse animation */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(217, 119, 6, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(217, 119, 6, 0);
  }
}

.ability-btn.double-points.active {
  animation: pulse 2s infinite;
}

/* Accessibility improvements */
button:focus, 
input:focus {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .game-container {
    background-color: white;
  }
  
  .teams-sidebar, 
  .modal-controls, 
  .ability-controls {
    display: none;
  }
  
  .game-board {
    box-shadow: none;
  }
  
  .category-card {
    break-inside: avoid;
  }
}
</style>