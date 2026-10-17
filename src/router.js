import { createRouter, createWebHashHistory } from 'vue-router'
import CatalogueView from './views/CatalogueView.vue'
import DrillView from './views/DrillView.vue'
import PlanView from './views/PlanView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'catalogue', component: CatalogueView },
    { path: '/favoris', name: 'favoris', component: CatalogueView, props: { favoritesOnly: true } },
    { path: '/exercice/:id', name: 'drill', component: DrillView, props: true },
    { path: '/plan', name: 'plan', component: PlanView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: (to, from, saved) => saved || { top: 0 },
})
