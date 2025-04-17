import { createRouter, createWebHashHistory } from 'vue-router'; // Use createWebHashHistory
import MainPage from '../views/MainPage.vue';
import GameBoard from '../views/GameBoard.vue';

const routes = [
  {
    path: '/',
    component: MainPage,
    meta: { title: 'الصفحة الرئيسية' }
  },
  {
    path: '/game-board',
    name: 'game-board', 
    component: GameBoard,
    meta: { title: 'إختبر ذكائك' }
  },
];

const router = createRouter({
  history: createWebHashHistory(),  // Switch to hash mode here
  routes,
});

export default router;
