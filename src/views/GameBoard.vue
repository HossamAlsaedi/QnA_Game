<template>
  <LoadSpinner :loading="loading" />
  <div class="game-container rtl">
    <AppHeader />

    <!-- Current Team Turn Banner -->
    <div v-if="teams.length > 0" class="team-turn-banner">
      <div class="team-turn-content">
        <div class="team-avatar">
          {{ teams[currentTeamIndex].name.charAt(0) }}
        </div>
        <span
          >دور فريق <strong>{{ teams[currentTeamIndex].name }}</strong
          >!</span
        >
      </div>
    </div>

    <div v-if="!loading" class="main-content">
      <!-- Team List Horizontal Bar -->
      <div class="teams-sidebar">
        <div v-if="teams.length > 0" class="teams-panel">
          <h4 class="teams-header">الفرق</h4>

          <div class="teams-grid">
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
                <button
                  class="score-btn decrease"
                  @click="adjustScore(index, -100)"
                >
                  -
                </button>
                <span class="team-score">{{ team.score }}</span>
                <button
                  class="score-btn increase"
                  @click="adjustScore(index, 100)"
                >
                  +
                </button>
              </div>

              <!-- Special Abilities -->
              <div v-if="index === currentTeamIndex" class="team-abilities">
                <button
                  class="ability-btn double-points"
                  :class="{
                    active: team.doubleActive,
                    disabled:
                      !team.abilities.doublePoints ||
                      index !== currentTeamIndex,
                  }"
                  :disabled="
                    !team.abilities.doublePoints || index !== currentTeamIndex
                  "
                  @click="activateDoublePoints(index)"
                  title="نقاط مضاعفة"
                >
                  <span>×2</span>
                </button>

                <button
                  class="ability-btn change-question"
                  :class="{
                    disabled:
                      !team.abilities.changeQuestion ||
                      index !== currentTeamIndex ||
                      !currentQuestion,
                  }"
                  :disabled="
                    !team.abilities.changeQuestion ||
                    index !== currentTeamIndex ||
                    !currentQuestion
                  "
                  @click="useChangeQuestionAbility(index)"
                  title="تغيير السؤال"
                >
                  <i class="fa fa-solid fa-arrow-left"></i>
                </button>

                <button
                  class="ability-btn call-help"
                  :class="{
                    disabled:
                      !team.abilities.callForHelp ||
                      index !== currentTeamIndex ||
                      !currentQuestion,
                  }"
                  :disabled="
                    !team.abilities.callForHelp ||
                    index !== currentTeamIndex ||
                    !currentQuestion
                  "
                  @click="useCallForHelp(index)"
                  title="طلب المساعدة"
                >
                  <i class="fa fa-solid fa-phone fa-xs"></i>
                </button>
              </div>

              <!-- Help Timer -->
              <div
                v-if="callForHelpActive && index === currentTeamIndex"
                class="help-timer"
              >
                <div class="timer-display">
                  <div
                    class="timer-progress"
                    :class="{ active: callForHelpActive }"
                  ></div>
                  <span>{{ callForHelpTimer }}ث</span>
                </div>
                <button class="timer-cancel" @click="stopTimer()">إلغاء</button>
              </div>
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
                <!-- First 200 points question -->
                <button
                  class="question-btn"
                  :class="{ answered: category.questions[0]?.answered }"
                  :disabled="
                    category.questions[0]?.answered ||
                    isButtonDisabled(category.id, 200, 0)
                  "
                  @click="
                    !isButtonDisabled(category.id, 200, 0) &&
                      selectQuestion(category, category.questions[0], 0)
                  "
                >
                  200
                </button>

                <!-- First 400 points question -->
                <button
                  class="question-btn"
                  :class="{ answered: category.questions[2]?.answered }"
                  :disabled="
                    category.questions[2]?.answered ||
                    isButtonDisabled(category.id, 400, 2)
                  "
                  @click="
                    !isButtonDisabled(category.id, 400, 2) &&
                      selectQuestion(category, category.questions[2], 2)
                  "
                >
                  400
                </button>

                <!-- First 600 points question -->
                <button
                  class="question-btn"
                  :class="{ answered: category.questions[4]?.answered }"
                  :disabled="
                    category.questions[4]?.answered ||
                    isButtonDisabled(category.id, 600, 4)
                  "
                  @click="
                    !isButtonDisabled(category.id, 600, 4) &&
                      selectQuestion(category, category.questions[4], 4)
                  "
                >
                  600
                </button>
              </div>

              <!-- Center Category Info -->
              <div class="category-info">
                <img
                  :src="getImagePath(category.image)"
                  alt="صورة الفئة"
                  class="category-thumbnail"
                />
                <h5>{{ category.name }}</h5>
              </div>

              <!-- Left Questions Column (was Right) -->
              <div class="questions-column left">
                <!-- Second 200 points question -->
                <button
                  class="question-btn"
                  :class="{ answered: category.questions[1]?.answered }"
                  :disabled="
                    category.questions[1]?.answered ||
                    isButtonDisabled(category.id, 200, 1)
                  "
                  @click="
                    !isButtonDisabled(category.id, 200, 1) &&
                      selectQuestion(category, category.questions[1], 1)
                  "
                >
                  200
                </button>

                <!-- Second 400 points question -->
                <button
                  class="question-btn"
                  :class="{ answered: category.questions[3]?.answered }"
                  :disabled="
                    category.questions[3]?.answered ||
                    isButtonDisabled(category.id, 400, 3)
                  "
                  @click="
                    !isButtonDisabled(category.id, 400, 3) &&
                      selectQuestion(category, category.questions[3], 3)
                  "
                >
                  400
                </button>

                <!-- Second 600 points question -->
                <button
                  class="question-btn"
                  :class="{ answered: category.questions[5]?.answered }"
                  :disabled="
                    category.questions[5]?.answered ||
                    isButtonDisabled(category.id, 600, 5)
                  "
                  @click="
                    !isButtonDisabled(category.id, 600, 5) &&
                      selectQuestion(category, category.questions[5], 5)
                  "
                >
                  600
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
          <img
            :src="getImagePath(currentCategory.image)"
            alt="صورة الفئة"
            class="category-image"
          />
          <div class="question-meta">
            <h4>{{ currentCategory.name }}</h4>
            <div class="points-badge">{{ currentQuestion.points }} نقطة</div>
          </div>
          <!-- Add this timer element -->
          <div class="question-timer">
            <div class="timer-circle">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle class="timer-background" cx="30" cy="30" r="28" />
                <circle
                  class="timer-progress"
                  cx="30"
                  cy="30"
                  r="28"
                  :style="{ strokeDashoffset: timerProgress }"
                />
              </svg>
              <span class="timer-text">{{ formatTime(questionTimer) }}</span>
            </div>
          </div>
        </div>

        <div class="question-content">
          <p>{{ currentQuestion.question }}</p>
        </div>

        <!-- Team Abilities Bar Inside the Question Modal -->
        <div v-if="teams.length > 0" class="modal-team-abilities">
          <div class="current-team-info">
            <div class="team-avatar modal-avatar">
              {{ teams[currentTeamIndex].name.charAt(0) }}
            </div>
            <span>{{ teams[currentTeamIndex].name }}</span>
          </div>

          <div class="ability-controls">
            <button
              class="ability-btn double-points"
              :class="{
                active: teams[currentTeamIndex].doubleActive,
                disabled: !teams[currentTeamIndex].abilities.doublePoints,
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
              :class="{
                disabled: !teams[currentTeamIndex].abilities.changeQuestion,
              }"
              :disabled="!teams[currentTeamIndex].abilities.changeQuestion"
              @click="useChangeQuestionAbility(currentTeamIndex)"
              title="تغيير السؤال"
            >
              <i class="fa fa-solid fa-arrow-left"></i>
              <span class="btn-label">تخطي</span>
            </button>

            <button
              class="ability-btn call-help"
              :class="{
                disabled: !teams[currentTeamIndex].abilities.callForHelp,
              }"
              :disabled="!teams[currentTeamIndex].abilities.callForHelp"
              @click="useCallForHelp(currentTeamIndex)"
              title="طلب المساعدة"
            >
              <i class="fa fa-solid fa-phone fa-xs"></i>
              <span class="btn-label">مساعدة</span>
            </button>
          </div>

          <!-- Help Timer in Modal -->
          <div
            v-if="callForHelpActive && currentTeamIndex === currentTeamIndex"
            class="modal-help-timer"
          >
            <div class="timer-display">
              <div
                class="timer-progress"
                :style="{ width: `${(callForHelpTimer / 60) * 100}%` }"
              ></div>
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
              <button class="award-btn nobody-btn" @click="awardPoints(-1)">
                لا أحد
              </button>
            </div>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="modal-controls">
          <button class="toggle-answer" @click="toggleAnswer">
            {{ showAnswer ? "إخفاء الإجابة" : "إظهار الإجابة" }}
          </button>
          <button class="close-modal" @click="closeModal">
            العودة إلى اللوحة
          </button>
        </div>
      </div>
    </div>

    <!-- Winner Modal -->
    <div v-if="showWinnerModal" class="winner-modal-overlay">
      <div class="winner-modal">
        <!-- Confetti Elements -->
        <div class="confetti-container">
          <div
            class="confetti"
            v-for="i in 50"
            :key="i"
            :style="getConfettiStyle(i)"
          ></div>
        </div>

        <!-- Victory Badges -->
        <div class="victory-badges">
          <div class="badge" :style="{ '--index': 1 }">
            <span>🎮</span>
          </div>
          <div class="badge badge-large" :style="{ '--index': 2 }">
            <span v-if="isDraw">🤝</span>
            <span v-else>🏆</span>
          </div>
          <div class="badge" :style="{ '--index': 3 }">
            <span>🎯</span>
          </div>
        </div>

        <h2 class="title-animation">
          {{ isDraw ? "تعادل!" : "انتهت اللعبة!" }}
        </h2>

        <!-- Draw section -->
        <div v-if="isDraw" class="draw-section">
          <h3 class="draw-title">تعادل بين الفرق التالية!</h3>
          <div class="draw-teams-grid">
            <div
              v-for="(team, index) in drawTeams"
              :key="team.id"
              class="draw-team-card"
              :style="{ '--index': index }"
            >
              <div class="draw-team-avatar">
                {{ team.name.charAt(0) }}
              </div>
              <h4>{{ team.name }}</h4>
              <div class="draw-team-score-container">
                <div class="score-value">{{ team.score }}</div>
                <div class="score-label">نقطة</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Winner section (single winner) -->
        <div v-else-if="topTeams.length <= 2" class="winner-single">
          <div class="winner-avatar">
            {{ topTeams[0].name.charAt(0) }}
          </div>
          <h3>{{ topTeams[0].name }} هو الفائز!</h3>
          <div class="winner-score-container">
            <div class="score-value">{{ topTeams[0].score }}</div>
            <div class="score-label">نقطة</div>
          </div>
        </div>

        <!-- Podium section for other teams (only shown if not a draw and multiple teams exist) -->
        <div v-if="!isDraw && teams.length > 2" class="winner-list">
          <h4>أفضل الفرق:</h4>
          <div class="podium-container">
            <div class="podium-place second-place" v-if="topTeams.length > 1">
              <div class="podium-avatar">{{ topTeams[1].name.charAt(0) }}</div>
              <div class="podium-name">{{ topTeams[1].name }}</div>
              <div class="podium-score">{{ topTeams[1].score }}</div>
              <div class="podium-block">2</div>
            </div>

            <div class="podium-place first-place" v-if="topTeams.length > 0">
              <div class="podium-avatar">{{ topTeams[0].name.charAt(0) }}</div>
              <div class="podium-name">{{ topTeams[0].name }}</div>
              <div class="podium-score">{{ topTeams[0].score }}</div>
              <div class="podium-block">1</div>
            </div>

            <div class="podium-place third-place" v-if="topTeams.length > 2">
              <div class="podium-avatar">{{ topTeams[2].name.charAt(0) }}</div>
              <div class="podium-name">{{ topTeams[2].name }}</div>
              <div class="podium-score">{{ topTeams[2].score }}</div>
              <div class="podium-block">3</div>
            </div>
          </div>
        </div>

        <button class="new-game-btn" @click="restartGame">
          <span class="btn-icon">🎲</span>
          <span class="btn-text">بدء لعبة جديدة</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from "../components/AppHeader.vue";
import LoadSpinner from "../components/LoadSpinner.vue";
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const selectedCategories = ref([]);
const teams = ref([]);
const currentQuestion = ref(null);
const currentCategory = ref(null);
const showAnswer = ref(false);
const normalizeCategoryName = (name) => name.toLowerCase().replace(/\s+/g, "_");
const getGameState = () => {
  return JSON.parse(localStorage.getItem("gameState") || "{}");
};
const setGameState = (newState) => {
  localStorage.setItem(
    "gameState",
    JSON.stringify({ ...getGameState(), ...newState })
  );
};
const clearGameState = () => {
  localStorage.removeItem("gameState");
};
const getImagePath = (imageName) => {
  if (!imageName) return ""; // prevent runtime errors
  return `${import.meta.env.BASE_URL}Images/${imageName}`;
};
const loading = ref(true);

onMounted(() => {
  const gameState = getGameState();
  const categoriesData = JSON.stringify(gameState.categories);
  const teamsData = JSON.stringify(gameState.teams);

  if (!categoriesData || !teamsData) {
    router.push("/");
    return;
  }

  const categories = JSON.parse(categoriesData);
  fullCategories.value = categories;

  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  const pickQuestions = (
    questions,
    count,
    categoryId,
    pointValue,
    fullSet,
    categoryName
  ) => {
    const storageKey = "quizAnsweredQuestions";
    const answeredMap = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const key = `${normalizeCategoryName(categoryName)}_${pointValue}`;
    const used = answeredMap[key] || [];
    const unused = questions.filter((q) => !used.includes(q.question));

    if (unused.length < count) {
      delete answeredMap[key]; // allow reuse
      localStorage.setItem(storageKey, JSON.stringify(answeredMap));
      const resetPool = fullSet.filter((q) => q.points === pointValue);
      return shuffle(resetPool).slice(0, count);
    }

    return shuffle(unused).slice(0, count);
  };

  let availableQuestions = gameState.availableQuestions || {};
  const alreadyPicked = Object.keys(availableQuestions).length > 0;

  selectedCategories.value = categories.map((category) => {
    const groupedByPoints = { 200: [], 400: [], 600: [] };

    category.questions.forEach((q) => {
      if (groupedByPoints[q.points]) {
        groupedByPoints[q.points].push(q);
      }
    });

    if (alreadyPicked && gameState.selectedCategories) {
      const prev = gameState.selectedCategories;
      const match = prev.find((cat) => cat.id === category.id);
      if (match) {
        return match;
      }
    }

    const picked200 = pickQuestions(
      groupedByPoints[200],
      2,
      category.id,
      200,
      category.questions,
      category.name
    );
    const picked400 = pickQuestions(
      groupedByPoints[400],
      2,
      category.id,
      400,
      category.questions,
      category.name
    );
    const picked600 = pickQuestions(
      groupedByPoints[600],
      2,
      category.id,
      600,
      category.questions,
      category.name
    );

    availableQuestions[category.id] = {
      200: picked200.length,
      400: picked600.length,
      600: picked400.length,
    };

    return {
      ...category,
      questions: [...picked200, ...picked400, ...picked600],
    };
  });

  // Save only if this is the first time generating
  if (!alreadyPicked) {
    setGameState({
      selectedCategories: selectedCategories.value,
      availableQuestions,
    });
  }

  teams.value = JSON.parse(teamsData).map((team) => ({
    ...team,
    score: team.score ?? 0,
    isUsingDouble: team.isUsingDouble ?? false,
    doubleActive: team.doubleActive ?? false,
    abilities: {
      doublePoints: team.abilities?.doublePoints ?? true,
      changeQuestion: team.abilities?.changeQuestion ?? true,
      callForHelp: team.abilities?.callForHelp ?? true,
    },
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
    startQuestionTimer();

    const matchingCategory = selectedCategories.value.find(
      (cat) => cat.id === parsedCategory.id
    );

    if (matchingCategory) {
      const matchingQuestion = matchingCategory.questions.find(
        (q) => q.question === parsedQuestion.question
      );
      if (matchingQuestion && !matchingQuestion.answered) {
        currentCategory.value = matchingCategory;
        currentQuestion.value = {
          ...matchingQuestion,
          slotIndex: parsedQuestion.slotIndex,
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

// ───────────────────────────────────────────────────────
// 1) Timer state
// ───────────────────────────────────────────────────────
const questionTimer = ref(60);
let questionTimerInterval = null;

// ───────────────────────────────────────────────────────
// 2) Timer progress for an SVG/circle progress bar
// ───────────────────────────────────────────────────────
const timerProgress = computed(() => {
  const r = 28; // your circle’s radius
  const circumference = 2 * Math.PI * r;
  return circumference * (1 - questionTimer.value / 60);
});

// ───────────────────────────────────────────────────────
// 3) Helper to format “MM:SS”
// ───────────────────────────────────────────────────────
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ───────────────────────────────────────────────────────
// 4) Start & clear timer
// ───────────────────────────────────────────────────────
function startQuestionTimer(duration = 60) {
  clearQuestionTimer();
  questionTimer.value = duration;
  questionTimerInterval = setInterval(() => {
    if (questionTimer.value > 0) {
      questionTimer.value--;
    } else {
      clearQuestionTimer();
    }
  }, 1000);
}

function clearQuestionTimer() {
  if (questionTimerInterval) {
    clearInterval(questionTimerInterval);
    questionTimerInterval = null;
  }
}

// ───────────────────────────────────────────────────────
// 5) Clean up on unmount
// ───────────────────────────────────────────────────────
onBeforeUnmount(() => {
  clearQuestionTimer();
});

// Check if all questions are answered
const checkIfGameOver = () => {
  const totalQuestions = selectedCategories.value.flatMap(
    (cat) => cat.questions
  );
  if (totalQuestions.every((q) => q.answered)) {
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
  setGameState({
    currentQuestion: null,
    currentCategory: null,
  });
  stopTimer();
  checkIfGameOver();
  clearQuestionTimer();
};

// Sort teams by score and return top 3
const teamScores = computed(() => {
  return teams.value
    .map((team) => ({ ...team, score: team.score }))
    .sort((a, b) => b.score - a.score);
});

const highestScore = computed(() => {
  return teamScores.value.length > 0 ? teamScores.value[0].score : 0;
});

const drawTeams = computed(() => {
  return teamScores.value.filter((team) => team.score === highestScore.value);
});

const isDraw = computed(() => {
  return drawTeams.value.length > 1;
});

const topTeams = computed(() => {
  if (isDraw.value) {
    return drawTeams.value;
  }
  return teamScores.value;
});

// Select a question to display in the modal
const selectQuestion = (category, question, index) => {
  currentCategory.value = category;
  currentQuestion.value = { ...question, slotIndex: index };
  showAnswer.value = false;
  startQuestionTimer();
  setGameState({
    currentQuestion: currentQuestion.value,
    currentCategory: currentCategory.value,
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
    // Mark question as answered
    currentQuestion.value.answered = true;

    // Only award points if a valid team index was provided
    if (teamIndex >= 0) {
      let points = currentQuestion.value.points;
      const team = teams.value[teamIndex];

      // Handle double points ability
      if (team.isUsingDouble) {
        points *= 2;
        team.isUsingDouble = false; // Reset the double points flag
        team.doubleActive = false; // Reset the active styling
      }

      // Award points to the team
      team.score += points;
    }

    // Deactivate abilities that were used
    teams.value.forEach((t) => {
      if (t.isUsingDouble) {
        t.isUsingDouble = false; // Deactivate double points for any team that used it
        t.doubleActive = false; // Remove the active styling for double points
      }
    });

    // Update game state after answering the question
    const catIndex = selectedCategories.value.findIndex(
      (cat) => cat.id === currentCategory.value.id
    );
    if (catIndex !== -1) {
      const qIndex = selectedCategories.value[catIndex].questions.findIndex(
        (q) => q.question === currentQuestion.value.question
      );
      if (qIndex !== -1) {
        selectedCategories.value[catIndex].questions[qIndex].answered = true;
        setGameState({ selectedCategories: selectedCategories.value });
      }
    }

    // Save the updated teams data in localStorage
    setGameState({ teams: teams.value });

    // Track answered question in localStorage (by question text)
    if (currentCategory.value) {
      const catId = currentCategory.value.id;
      const questionPoints = currentQuestion.value.points;
      const answeredKey = "quizAnsweredQuestions";
      const answeredMap = JSON.parse(localStorage.getItem(answeredKey) || "{}");
      const key = `${normalizeCategoryName(
        currentCategory.value.name
      )}_${questionPoints}`;

      if (!answeredMap[key]) {
        answeredMap[key] = [];
      }

      if (!answeredMap[key].includes(currentQuestion.value.question)) {
        answeredMap[key].push(currentQuestion.value.question);
        localStorage.setItem(answeredKey, JSON.stringify(answeredMap));
      }

      // Decrement available questions (if tracked)
      const availableData = JSON.parse(
        localStorage.getItem("availableQuestions") || "{}"
      );
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
  const disabledButtons = JSON.parse(
    localStorage.getItem("disabledButtons") || "{}"
  );
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
    team.doubleActive = true; // Used for styling in the UI
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
  )
    return;

  const currentCatId = currentCategory.value.id;
  const currentPoints = currentQuestion.value.points;

  if (!currentCatId || !currentPoints) {
    console.error("Missing current category ID or points");
    return;
  }

  const fullCategory = fullCategories.value.find(
    (cat) => cat.id === currentCatId
  );
  const selectedCategory = selectedCategories.value.find(
    (cat) => cat.id === currentCatId
  );

  if (!fullCategory || !selectedCategory) {
    console.error("Full or selected category not found");
    return;
  }

  const answeredKey = "quizAnsweredQuestions";
  const answeredMap = JSON.parse(localStorage.getItem(answeredKey) || "{}");
  const mapKey = `${normalizeCategoryName(
    currentCategory.value.name
  )}_${currentPoints}`;
  const answeredQuestions = answeredMap[mapKey] || [];

  const samePointQuestions = fullCategory.questions.filter(
    (q) =>
      q.points === currentPoints &&
      q.question !== currentQuestion.value.question &&
      !answeredQuestions.includes(q.question)
  );

  if (samePointQuestions.length > 0) {
    const newQuestion =
      samePointQuestions[Math.floor(Math.random() * samePointQuestions.length)];
    const indexToReplace = selectedCategory.questions.findIndex(
      (q) => q.question === currentQuestion.value.question
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

      const remaining = questionTimer.value;
      const newDuration = remaining < 30 ? 30 : remaining;

      startQuestionTimer(newDuration);
      // Update localStorage with newly used question
      answeredMap[mapKey] = answeredQuestions.concat(newQuestion.question);
      localStorage.setItem(answeredKey, JSON.stringify(answeredMap));

      // ✅ Save updated state
      setGameState({
        selectedCategories: selectedCategories.value,
        currentQuestion: currentQuestion.value,
        currentCategory: currentCategory.value,
        teams: teams.value,
        currentTeamIndex: currentTeamIndex.value,
      });
    }
  } else {
    const remainingQuestions = selectedCategory.questions.filter(
      (q) => !q.answered
    );
    if (remainingQuestions.length === 1) {
      const lastQuestion = remainingQuestions[0];
      alert(
        "Only one question is left in this category, so the last question will be used."
      );
      currentQuestion.value = lastQuestion;
      selectedCategory.questions.find(
        (q) => q.question === lastQuestion.question
      ).answered = true;
      answeredQuestions.push(lastQuestion.question);
      localStorage.setItem(answeredKey, JSON.stringify(answeredMap));
      teams.value[index].abilities.changeQuestion = false;

      // Save updated state
      setGameState({
        selectedCategories: selectedCategories.value,
        currentQuestion: currentQuestion.value,
        currentCategory: currentCategory.value,
        teams: teams.value,
        currentTeamIndex: currentTeamIndex.value,
      });
    } else {
      alert(
        "No other question available with the same points in this category."
      );
    }
  }
};

// Call for help ability
const callForHelpTimer = ref(60);
const callForHelpActive = ref(false);
let callTimerInterval;

const useCallForHelp = (index) => {
  if (
    !teams.value[index].abilities.callForHelp ||
    index !== currentTeamIndex.value
  )
    return;

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

// Add these functions to your script setup

// Function to get a random confetti style
const getConfettiStyle = (index) => {
  const colors = [
    "#4f46e5",
    "#ec4899",
    "#fcd34d",
    "#10b981",
    "#f97316",
    "#0ea5e9",
  ];

  // Use a consistent random seed based on the index
  const randomLeft = (index * 7919) % 100;
  const randomDelay = ((index * 104729) % 50) / 10;
  const randomDuration = 3 + ((index * 15485863) % 40) / 10;
  const colorIndex = (index * 32452843) % colors.length;
  const size = 8 + ((index * 104729) % 10);
  const isRectangular = (index * 32452843) % 2 === 0;

  return {
    left: `${randomLeft}%`,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`,
    backgroundColor: colors[colorIndex],
    width: `${size}px`,
    height: `${size}px`,
    transform: `rotate(${(index * 104729) % 360}deg)`,
    borderRadius: isRectangular ? "2px" : "50%",
  };
};

// Function to restart the game
const restartGame = () => {
  // Clear game state and navigate to home
  clearGameState();
  router.push("/");
};
</script>

<style scoped>
/* Base Styles */
.rtl {
  direction: rtl;
  text-align: right;
}

.game-container {
  font-family: "Dubai", "Amiri", "Arial", sans-serif;
  background-color: #f0f5ff;
  min-height: 100vh;
  padding-bottom: 2rem;
}

/* Common Animations */
@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalZoomIn {
  from {
    transform: scale(0.8) rotateX(10deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

@keyframes fall {
  0% {
    transform: translateY(-20px) rotateZ(0deg) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(400px) rotateZ(180deg) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translateY(800px) rotateZ(360deg) scale(0.5);
    opacity: 0;
  }
}

@keyframes badgePop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  80% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes titleSlideIn {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes riseUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scoreCount {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes progressBar {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
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

.team-avatar,
.modal-avatar {
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
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Teams Section */
.teams-sidebar {
  width: 100%;
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
  content: "";
  display: block;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #8b5cf6);
  margin: 8px auto 0;
  border-radius: 2px;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.team-card {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 1.25rem;
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
.team-abilities,
.ability-controls {
  display: flex;
  gap: 0.5rem;
}

.team-abilities {
  margin-top: 0.75rem;
}

.ability-controls {
  gap: 0.75rem;
}

.ability-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
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

.ability-btn .btn-label {
  font-size: 0.7rem;
  font-weight: 600;
}

/* Timer Styles */
.help-timer,
.modal-help-timer {
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
  transition: none;
  animation: progressBar 60s linear;
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
  grid-template-columns: repeat(3, 1fr);
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
  order: 2;
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

.questions-column.left {
  order: 3;
}

.questions-column.right {
  order: 1;
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

.question-btn.answered,
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

.question-timer {
  margin-right: auto;
  margin-left: 1rem;
}

.timer-circle {
  position: relative;
  width: 60px;
  height: 60px;
}

.timer-circle svg {
  transform: rotate(-90deg);
}

.timer-background {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 4;
}

.timer-progress {
  fill: none;
  stroke: #fff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 176;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 1s linear;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.rtl .question-header {
  flex-direction: row-reverse;
}

.category-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  margin-left: 1rem;
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

.ability-controls .ability-btn {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
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
  border-right: 4px solid #16a34a;
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
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.award-btn:hover {
  background-color: #4f46e5;
  transform: translateY(-2px);
}

.award-btn.nobody-btn {
  background-color: #9ca3af;
}

.award-btn.nobody-btn:hover {
  background-color: #6b7280;
}

/* Modal Controls */
.modal-controls {
  display: flex;
  justify-content: space-between;
  padding: 1.25rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.toggle-answer,
.close-modal {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-answer {
  background-color: #10b981;
  color: white;
  border: none;
}

.toggle-answer:hover {
  background-color: #059669;
}

.close-modal {
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.close-modal:hover {
  background-color: #f3f4f6;
}

/* Winner Modal */
.winner-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.95),
    rgba(124, 58, 237, 0.95)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
  perspective: 1000px;
  animation: modalFadeIn 0.5s ease-out forwards;
  overflow-y: auto; /* Enable scrolling if content is tall */
}

.winner-modal {
  background: linear-gradient(135deg, #ffffff, #f9fafb);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  width: 90%;
  max-width: 700px;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
  animation: modalZoomIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  transform-style: preserve-3d;
  margin: 1.5rem 0; /* Add margin to ensure it's not flush against edges */
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  opacity: 0.8;
  animation: fall 5s linear infinite;
  top: -20px;
  border-radius: 2px;
  will-change: transform;
}

/* Animation fill modes */
.badge,
.first-place,
.second-place,
.third-place,
.title-animation,
.winner-single,
.new-game-btn {
  animation-fill-mode: both;
}

/* Victory Badges */
.victory-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 0.5rem 0 1.5rem; /* Reduced top margin */
  z-index: 5;
  position: relative;
  padding-top: 1rem; /* Add padding to ensure badges are visible */
}

.badge {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
  animation: badgePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
  opacity: 0;
  transform: scale(0.5);
}

.badge-large {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.badge span,
.badge-large span {
  display: block;
}

.badge span {
  font-size: 1.75rem;
}

.badge-large span {
  font-size: 2.5rem;
}

/* Title Animation */
.title-animation {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #4f46e5;
  position: relative;
  z-index: 1;
  display: inline-block;
  overflow: hidden;
  animation: titleSlideIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: 0.4s;
  opacity: 0;
}

/* Winner Single & Draw Section - Common styles */
.winner-single,
.draw-section {
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.1),
    rgba(139, 92, 246, 0.1)
  );
  border-radius: 20px;
  padding: 2rem;
  margin: 1.5rem 0;
  position: relative;
  z-index: 5;
  animation: winnerAppear 0.8s ease-out forwards;
  animation-delay: 0.6s;
  opacity: 0;
  transform: translateY(30px);
}

.winner-single {
  animation: winnerAppear 0.8s ease-out forwards;
  animation-delay: 0.6s;
}

.draw-section {
  animation: drawAppear 0.8s ease-out forwards;
  animation-delay: 0.6s;
}

@keyframes winnerAppear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes drawAppear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Winner & Draw Avatar Styles */
.winner-avatar,
.draw-team-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
  text-transform: uppercase;
  animation: pulse 2s infinite;
}

.draw-team-avatar {
  width: 70px;
  height: 70px;
  font-size: 1.8rem;
  margin: 0 auto 1rem;
  box-shadow: 0 6px 12px rgba(79, 70, 229, 0.3);
  animation: drawPulse 2s infinite;
  animation-delay: calc(1.2s + var(--index, 0) * 0.1s);
}

@keyframes drawPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

.winner-single h3 {
  font-size: 1.75rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

/* Score Value Styles */
.winner-score-container,
.draw-team-score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: scoreCount 1.5s ease-out forwards;
  animation-delay: 1s;
}

.draw-team-score-container {
  animation: drawScoreAppear 1s ease-out forwards;
  animation-delay: calc(1.3s + var(--index, 0) * 0.1s);
  opacity: 0;
}

@keyframes drawScoreAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.score-value {
  font-size: 3rem;
  font-weight: 800;
  color: #4f46e5;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.draw-team-score-container .score-value {
  font-size: 2.25rem;
}

.score-label {
  font-size: 1.25rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.draw-team-score-container .score-label {
  font-size: 1rem;
  margin-top: 0.25rem;
}

/* Winner List - Podium Style */
.winner-list {
  margin: 2rem 0;
  position: relative;
  z-index: 5;
}

.winner-list h4 {
  font-size: 1.5rem;
  color: #4f46e5;
  margin-bottom: 2rem;
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: 0.7s;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.podium-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 1rem;
  height: 250px;
}

.podium-place {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.podium-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
}

.podium-name {
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: #4b5563;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.podium-score {
  font-weight: 700;
  font-size: 1.25rem;
  color: #4f46e5;
  margin-bottom: 0.5rem;
}

.podium-block {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border-radius: 8px 8px 0 0;
}

.first-place {
  animation: riseUp 1s ease-out forwards;
  animation-delay: 0.8s;
  opacity: 0;
}

.first-place .podium-avatar {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.first-place .podium-block {
  height: 120px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.second-place {
  animation: riseUp 1s ease-out forwards;
  animation-delay: 1s;
  opacity: 0;
}

.second-place .podium-block {
  height: 80px;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
}

.third-place {
  animation: riseUp 1s ease-out forwards;
  animation-delay: 1.2s;
  opacity: 0;
}

.third-place .podium-block {
  height: 60px;
  background: linear-gradient(135deg, #10b981, #059669);
}

/* Common rise animation */
.first-place,
.second-place,
.third-place {
  animation: riseUp 1s ease-out forwards;
  opacity: 0;
}

.first-place {
  animation-delay: 0.8s;
}

.second-place {
  animation-delay: 1s;
}

.third-place {
  animation-delay: 1.2s;
}

/* Podium avatars - specific sizes */
.first-place .podium-avatar {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

/* Podium blocks - specific heights and colors */
.first-place .podium-block {
  height: 120px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.second-place .podium-block {
  height: 80px;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
}

.third-place .podium-block {
  height: 60px;
  background: linear-gradient(135deg, #10b981, #059669);
}

/* New Game Button */
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
  box-shadow: 0 8px 15px rgba(79, 70, 229, 0.3);
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 auto;
  animation: buttonAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: 1.5s;
  opacity: 0;
  transform: translateY(30px);
}

.new-game-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(79, 70, 229, 0.4);
  background: linear-gradient(135deg, #4338ca, #7e22ce);
}

.btn-icon {
  font-size: 1.5rem;
}

.draw-section {
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.05),
    rgba(139, 92, 246, 0.05)
  );
  border-radius: 20px;
  padding: 1.5rem;
  margin: 1rem 0;
  position: relative;
  z-index: 5;
  animation: drawAppear 0.8s ease-out forwards;
  animation-delay: 0.6s;
  opacity: 0;
  transform: translateY(30px);
}

.draw-title {
  font-size: 1.75rem;
  color: #4f46e5;
  margin-bottom: 2rem;
  text-align: center;
  animation: drawTitleSlide 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 0.8s;
  opacity: 0;
}

.draw-teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.draw-team-card {
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: drawCardAppear 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: calc(1s + var(--index, 0) * 0.1s);
  opacity: 0;
  transform: scale(0.8);
  position: relative;
  overflow: hidden;
}

/* Draw team background colors */
.draw-team-card:nth-child(1) {
  background: linear-gradient(135deg, #fff5f5, #ffe3e3);
}

.draw-team-card:nth-child(2) {
  background: linear-gradient(135deg, #f0f7ff, #e3edff);
}

.draw-team-card:nth-child(3) {
  background: linear-gradient(135deg, #f0fff4, #dcfce7);
}

.draw-team-card:nth-child(4) {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
}

/* Draw team avatars */
.draw-team-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  margin: 0 auto 1rem;
  box-shadow: 0 6px 12px rgba(79, 70, 229, 0.3);
  text-transform: uppercase;
  animation: drawPulse 2s infinite;
  animation-delay: calc(1.2s + var(--index, 0) * 0.1s);
}

/* Draw team avatar colors */
.draw-team-card:nth-child(1) .draw-team-avatar {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.draw-team-card:nth-child(2) .draw-team-avatar {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.draw-team-card:nth-child(3) .draw-team-avatar {
  background: linear-gradient(135deg, #10b981, #059669);
}

.draw-team-card:nth-child(4) .draw-team-avatar {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.draw-team-card h4 {
  font-size: 1.25rem;
  color: #1f2937;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.draw-team-score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: drawScoreAppear 1s ease-out forwards;
  animation-delay: calc(1.3s + var(--index, 0) * 0.1s);
  opacity: 0;
}

/* Score specific styles for draw section */
.draw-team-score-container .score-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: #4f46e5;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.draw-team-score-container .score-label {
  font-size: 1rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* ================================
   SECTION 8: Animations
   ================================ */

@keyframes riseUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes buttonAppear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes drawAppear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes drawTitleSlide {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes drawCardAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes drawPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

@keyframes drawScoreAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ================================
   SECTION 9: Media Queries
   ================================ */

/* Large screens */
@media (max-width: 1280px) {
  .teams-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablets */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .teams-grid,
  .categories-grid {
    grid-template-columns: 1fr;
  }

  .teams-panel,
  .game-board {
    padding: 1rem;
  }

  .team-card {
    padding: 1rem;
  }

  .question-card {
    border-radius: 0;
    max-height: 100vh;
  }

  .question-header {
    padding: 1rem;
  }

  .question-content {
    padding: 1.5rem;
    font-size: 1.25rem;
  }

  .modal-team-abilities {
    flex-direction: column;
    align-items: stretch;
  }

  .ability-controls {
    width: 100%;
    justify-content: space-between;
  }

  .ability-btn {
    flex: 1;
  }

  .modal-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .toggle-answer,
  .close-modal {
    width: 100%;
  }

  /* Winner modal specific */
  .winner-modal {
    padding: 1.5rem;
  }

  .title-animation {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .victory-badges {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .badge {
    width: 40px;
    height: 40px;
  }

  .badge-large {
    width: 60px;
    height: 60px;
  }

  .winner-avatar {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .score-value {
    font-size: 2rem;
  }

  /* Podium specific */
  .podium-container {
    height: 250px;
    gap: 0.25rem;
  }

  .podium-place {
    width: 90px;
  }

  .podium-avatar {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .first-place .podium-block {
    height: 140px;
  }

  .second-place .podium-block {
    height: 100px;
  }

  .third-place .podium-block {
    height: 70px;
  }

  .new-game-btn {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }

  /* Draw section specific */
  .draw-teams-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .draw-team-card {
    padding: 1rem;
  }

  .draw-team-avatar {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .draw-team-card h4 {
    font-size: 1.125rem;
  }

  .draw-team-score-container .score-value {
    font-size: 2rem;
  }
}

/* Mobile devices */
@media (max-width: 480px) {
  .team-turn-content {
    font-size: 1rem;
  }

  .team-avatar {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .teams-header {
    font-size: 1.25rem;
  }

  .category-thumbnail {
    width: 60px;
    height: 60px;
  }

  .questions-column {
    width: 70px;
    gap: 0.5rem;
  }

  .question-btn {
    padding: 0.625rem;
    font-size: 0.875rem;
  }

  .question-content {
    font-size: 1.125rem;
    padding: 1rem;
  }

  .category-image {
    width: 40px;
    height: 40px;
  }

  .ability-btn .btn-label {
    display: none;
  }

  .award-btn {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  .title-animation {
    font-size: 1.5rem;
  }

  .score-value {
    font-size: 1.75rem;
  }

  .podium-place {
    width: 80px;
  }

  /* Draw section specific */
  .draw-title {
    font-size: 1.5rem;
  }

  .draw-teams-grid {
    grid-template-columns: 1fr;
  }

  .draw-team-card {
    margin-bottom: 0.75rem;
  }
}

/* Very small screens */
@media (max-width: 320px) {
  .team-turn-content {
    flex-direction: column;
    gap: 0.5rem;
  }

  .ability-controls {
    flex-direction: column;
    gap: 0.5rem;
  }

  .ability-btn {
    width: 100%;
  }
}
</style>
