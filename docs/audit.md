# Phase 0 Audit — Vue 2 → Vue 3

Grep results from `packages/frontend/src/`. Each row = file × issue. Estimate: S (<30min), M (<2h), L (>2h).

## Global Vue API hits (removed in v3)

| File                      | Issue                                                                    | Est            |
| ------------------------- | ------------------------------------------------------------------------ | -------------- |
| `main.ts`                 | `Vue.component("Spiner")`, `Vue.component("Error")`                      | S              |
| `main.ts`                 | `Vue.use(messagePlugin)`, `Vue.use(VueStripeMenu)`, `Vue.use(Vuelidate)` | S              |
| `utils/message.plugin.ts` | `Vue.prototype.$message`, `Vue.prototype.$error`                         | S → composable |
| `router/index.ts`         | `Vue.use(VueRouter)`, `new VueRouter(...)`                               | S              |
| `store/index.ts`          | `Vue.use(Vuex)`, `new Vuex.Store(...)`                                   | S              |

## Removed / changed APIs

| File                            | Issue                                                            | Est                       |
| ------------------------------- | ---------------------------------------------------------------- | ------------------------- |
| `components/Nav.vue`            | `$options.isCinematographerMode`, `$options.isPhotographerMode`  | S → `useSiteMode()`       |
| `views/dashboard/Dashboard.vue` | `$options.menu`                                                  | S → import const directly |
| `views/dashboard/WorkAdd.vue`   | `$options.allowedImageSizeInKb`                                  | S → import const          |
| `App.vue`                       | async component: `() => import(...)` → `defineAsyncComponent`    | S                         |
| `router/index.ts`               | wildcard path `"*"` → `"/:pathMatch(.*)*"`                       | S                         |
| `views/dashboard/Dashboard.vue` | `<router-link tag="button">` (removed in v4) → `<button @click>` | S                         |

## Blocker dep usage

| File                           | Dep                                                     | Est |
| ------------------------------ | ------------------------------------------------------- | --- |
| `views/Slider.vue`             | `hooper` → Swiper 11                                    | M   |
| `views/dashboard/PhotoAdd.vue` | `vue2-editor` → Tiptap, `vuelidate` → `@vuelidate/core` | M   |
| `views/dashboard/WorkAdd.vue`  | `vue2-editor` → Tiptap, `vuelidate` → `@vuelidate/core` | M   |
| `views/dashboard/SlideAdd.vue` | `vuelidate` → `@vuelidate/core`                         | S   |
| `views/dashboard/Contacts.vue` | `vue2-editor` → Tiptap, `vuelidate` → `@vuelidate/core` | M   |
| `main.ts`                      | `vue-stripe-menu` → custom nav                          | L   |
| `scss/_main.scss`              | `vue-stripe-menu` styles → remove import                | S   |
| `src/registerServiceWorker.ts` | `register-service-worker` → `vite-plugin-pwa`           | S   |

## Vuex → Pinia

| Module                         | Store             | Est |
| ------------------------------ | ----------------- | --- |
| `store/modules/general.ts`     | `useGeneralStore` | S   |
| `store/modules/auth.module.ts` | `useAuthStore`    | M   |
| `store/modules/photos.ts`      | `usePhotosStore`  | S   |
| `store/modules/shots.ts`       | `useShotsStore`   | S   |
| `store/modules/slides.ts`      | `useSlidesStore`  | S   |
| `store/modules/videos.ts`      | `useVideosStore`  | S   |

## Options API → `<script setup lang="ts">` (46 SFCs)

### Batch 1 — Leaf presentational (S each)
`Spiner.vue`, `Footer.vue`, `SVG-sprite.vue`, `Slide.vue`, `Error.vue`, `NotFound.vue`

### Batch 2 — Grids & previews (S–M each)
`PhotosGrid.vue`, `PhotosPreviewGrid.vue`, `PhotosGridShots.vue`, `WorksGrid.vue`,
`PhotoPreview.vue`, `TheCategoryFilter.vue`, `VimeoVideoPlayer.vue`

### Batch 3 — Nav & header (M each)
`Header.vue`, `Nav.vue` (HIGHEST RISK — vue-stripe-menu replacement),
`dropdowns/PhotosSubmenu.vue`, `dropdowns/PortfolioSubmenu.vue`, `dropdowns/ShotsSubmenu.vue`

### Batch 4 — Public views (S–M each)
`Main.vue`, `Work.vue`, `Shots.vue`, `Photo.vue`, `Photos.vue`, `Portfolio.vue`,
`Personal.vue`, `Contact.vue`, `Login.vue`, `Slider.vue`, `PhotographerMain.vue`,
`CinematogapherMain.vue`, `Calendar.vue`

### Batch 5 — Dashboard (M–L each)
`Dashboard.vue`, `Contacts.vue`, `PhotoAdd.vue`, `Photos.vue`, `ShotAdd.vue`,
`ShotEdit.vue`, `Shots.vue`, `SlideAdd.vue`, `Slider.vue`, `TheDashboardNav.vue`,
`ThemeToggle.vue`, `WorkAdd.vue`, `Works.vue`

## High-risk files (top 5)

1. `components/Nav.vue` — `vue-stripe-menu` has no Vue 3 release; full replacement needed
2. `views/Slider.vue` — `hooper` → Swiper v11; slot API change, settings API differs
3. `views/dashboard/PhotoAdd.vue` — vuelidate + vue2-editor + complex photo upload logic
4. `views/dashboard/WorkAdd.vue` — same as above + `$options` pattern
5. `views/dashboard/Contacts.vue` — vuelidate + vue2-editor + image upload

## Compatibility-safe deps (no changes needed)
`axios`, `lodash`, `core-js`, `normalize.css`, `reset-css`, `simple-lightbox`,
`simple-notify`, `@vimeo/player`

## tsconfig issues
- `"types": ["webpack-env"]` → change to `"vite/client"`
- `noImplicitAny: false` → raise to `true` in Phase 6
- `allowJs: true` → flip to `false` in Phase 6 after converting `src/models/user.js`
- `"module": "esnext"` — fine for Vite