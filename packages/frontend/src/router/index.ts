import { createRouter, createWebHistory } from "vue-router";
import Main from "../views/Main.vue";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "works", component: Main },
    { path: "/works-commercial", name: "works-commercial", component: () => import("../views/Main.vue") },
    { path: "/work/:id", name: "work", component: () => import("../views/Work.vue") },
    { path: "/shots", name: "shots", component: () => import("../views/Shots.vue") },
    {
      path: "/photo",
      name: "photo",
      component: () => import("../views/Photos.vue"),
      children: [
        { path: "commerce", name: "commerce", component: () => import("../views/Photos.vue") }
      ]
    },
    { path: "/photo/:id", name: "collage", component: () => import("../views/Photo.vue") },
    { path: "/personal", name: "personal", component: () => import("../views/Photos.vue") },
    { path: "/portfolio", name: "portfolio", component: () => import("../views/Portfolio.vue") },
    { path: "/contact", name: "contact", component: () => import("../views/Contact.vue") },
    { path: "/calendar", name: "calendar", component: () => import("../views/Calendar.vue") },
    { path: "/login", name: "login", meta: { isProtected: true }, component: () => import("../views/Login.vue") },
    {
      path: "/dashboard",
      name: "dashboard",
      meta: { isProtected: true },
      component: () => import("../views/dashboard/Dashboard.vue"),
      children: [
        { path: "slider", name: "dasboard-slider", meta: { isProtected: true }, component: () => import("../views/dashboard/Slider.vue") },
        { path: "works", name: "dasboard-works", meta: { isProtected: true }, component: () => import("../views/dashboard/Works.vue") },
        { path: "shots", name: "dasboard-shots", meta: { isProtected: true }, component: () => import("../views/dashboard/Shots.vue") },
        { path: "photos", name: "dasboard-photos", meta: { isProtected: true }, component: () => import("../views/dashboard/Photos.vue") },
        { path: "contacts", name: "dasboard-contacts", meta: { isProtected: true }, component: () => import("../views/dashboard/Contacts.vue") }
      ]
    },
    { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("../views/NotFound.vue") }
  ]
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  const privatePages = ["dashboard"];
  const isAuthRequired = `${to.path}`.split("/").some(v => privatePages.includes(v));
  if (isAuthRequired && !authStore.loggedIn) {
    return "/login";
  }
});

export default router;
