import { createRouter, createWebHashHistory } from 'vue-router'
import CatalogueView from './views/CatalogueView.vue'
import DrillView from './views/DrillView.vue'
import PlanView from './views/PlanView.vue'
import SavedPlansView from './views/SavedPlansView.vue'
import SharedPlanView from './views/SharedPlanView.vue'
import AdminView from './views/AdminView.vue'
import AccountView from './views/AccountView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'catalogue', component: CatalogueView },
    { path: '/favoris', name: 'favoris', component: CatalogueView, props: { favoritesOnly: true } },
    { path: '/exercice/:id', name: 'drill', component: DrillView, props: true },
    {
      path: '/plan',
      name: 'plan',
      component: PlanView,
      beforeEnter: (to) => (to.query.p ? { name: 'shared', query: { p: to.query.p } } : true),
    },
    { path: '/partage', name: 'shared', component: SharedPlanView, meta: { public: true } },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/compte', name: 'account', component: AccountView },
    { path: '/plans', name: 'plans', component: SavedPlansView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: (to, from, saved) => saved || { top: 0 },
})
