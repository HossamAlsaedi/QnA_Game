import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '../views/MainPage.vue';
import GameBoard from '../views/GameBoard.vue';

const routes = [
  {
    path: '/',
    component: MainPage,
  },
  {
    path: '/game-board',
    name: 'game-board', 
    component: GameBoard,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.MODE === 'production' ? '/QnA_Game/' : '/'),
  routes,
});

export default router;
