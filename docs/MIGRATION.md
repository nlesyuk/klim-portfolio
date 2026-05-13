# Frontend Migration: Vue 2 → Vue 3 + Composition API + TypeScript

Migration plan for `packages/frontend` from Vue 2.6 (Options API, Vue CLI, Vuex 3) to Vue 3 (Composition API + `<script setup lang="ts">`, Vite, Pinia).

## Decisions

| Topic                   | Choice                                     | Reason                                                                    |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| State                   | **Pinia**                                  | First-class TS, simpler stores, official successor to Vuex                |
| Bundler                 | **Vite**                                   | Vue CLI deprecated; faster HMR; ESM-native                                |
| Migration strategy      | **Direct cut to Vue 3** (no `@vue/compat`) | Codebase is small (46 SFCs) — compat layer adds noise without saving time |
| TS strictness           | Raise gradually (off → strict by Phase 5)  | Avoid red-sea PRs                                                         |
| Component syntax target | `<script setup lang="ts">`                 | Less boilerplate, best inference                                          |

## Current state inventory

- **Framework:** Vue 2.6, vue-router 3, Vuex 3, Vuelidate 0.7
- **Files:** 46 `.vue` (Options API), 27 `.ts`, 1 `.js`
- **Build:** Vue CLI 4.5 + webpack + `node-sass` (deprecated)
- **TS config:** `noImplicitAny: false`, `allowJs: true` — loose
- **Globals:** `Vue.prototype.$message`, `Vue.prototype.$error` (`src/utils/message.plugin.ts`), `globalThis.SimpleLightbox` (`src/main.ts`)
- **Options-style hacks:** `$options.isPhotographerMode` in `src/components/Nav.vue`

## Blocker dependencies (Vue 2 only — must replace)

| Dep                                                | Replacement                                      | Notes                                                                    |
| -------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| `vuelidate@^0.7.6`                                 | `@vuelidate/core` + `@vuelidate/validators`      | Rewrite, not port — composition-friendly API differs                     |
| `hooper@^0.3.4`                                    | `swiper@11` (Vue 3 wrapper) or `vue3-carousel`   | Used in `src/components/Slides.vue`                                      |
| `vue-stripe-menu@^1.5`                             | Custom mega-menu OR community fork               | **No Vue 3 release** — biggest unknown. Used in `src/components/Nav.vue` |
| `vue2-editor@^2.10`                                | `@tinymce/tinymce-vue@5` or `tiptap`             | Dashboard editor views                                                   |
| `vue-template-compiler`                            | Drop; `@vue/compiler-sfc` ships with Vite plugin | —                                                                        |
| `node-sass@^4`                                     | `sass` (dart-sass)                               | Drop-in for most SCSS                                                    |
| `@vue/cli-*` packages                              | Vite + `@vitejs/plugin-vue`                      | Replace entire toolchain                                                 |
| `register-service-worker` (via Vue CLI PWA plugin) | `vite-plugin-pwa`                                | Re-wire `src/registerServiceWorker.ts`                                   |

## Compatibility-safe deps (keep as-is)

`axios`, `lodash`, `core-js`, `normalize.css`, `reset-css`, `simple-lightbox`, `simple-notify`, `@vimeo/player`.

---

## Phase 0 — Audit (≈1 day) ✅ DONE

Run these greps from `packages/frontend/` and record hits per file. Each becomes a migration ticket.

```bash
# Global API on Vue (removed in v3)
grep -rn "Vue\.prototype\|Vue\.use\|Vue\.extend\|Vue\.mixin\|Vue\.component" src/

# Removed / changed APIs
grep -rn "\$on\|\$off\|\$once" src/                  # event bus → mitt or composable
grep -rn "\$listeners\|\$scopedSlots" src/           # merged into $attrs / v-slot
grep -rn "functional: *true" src/                    # functional component syntax changed
grep -rn "filters:\s*{" src/                         # filters removed in v3
grep -rn "\.sync" src/                               # .sync removed; use v-model:foo
grep -rn 'v-model="[^"]*"' src/ | grep -v 'input\|textarea\|select'  # custom v-model API change

# Options-API anti-patterns to clean up
grep -rn "\$options\." src/                          # e.g. Nav.vue $options.isPhotographerMode
grep -rn "this\.\$set\|this\.\$delete" src/          # not needed in v3

# Dep usage hotspots
grep -rln "vuelidate\|hooper\|vue-stripe-menu\|vue2-editor" src/
```

**Deliverable:** `docs/audit.md` with file × issue matrix. Estimate per file (S/M/L). Identify the 3–5 highest-risk files.
> ✅ Delivered: `docs/audit.md` created.

---

## Phase 1 — Tooling swap (≈1–2 days) ✅ DONE

Decouple build migration from framework migration so each step is verifiable.

1. ✅ **Add Vite** — `vite.config.ts` created with `@vitejs/plugin-vue`, `vite-plugin-pwa`, `@` + `Repositories` aliases.
2. ✅ **Replace `node-sass` with `sass`** (dart-sass).
3. ✅ **`package.json` rewritten** — `@vue/cli-*` removed, Vite 5 + `vue-tsc` added.
4. ✅ **`public/index.html`** — webpack template vars removed, `<script type="module" src="/src/main.ts">` added.
5. ⬜ **ESLint:** upgrade to `eslint-plugin-vue@9`, Prettier 3, `@typescript-eslint@7+`.

**Exit criteria:** App runs on Vite, builds clean, eslint passes, no Vue CLI deps in `package.json`.
> ✅ Toolchain swapped. ESLint upgrade deferred.

---

## Phase 2 — Vue 3 core swap (≈2 days) ✅ DONE

1. ✅ **Bump deps:** `vue@^3.4`, `vue-router@^4`, `pinia@^2`, `@vitejs/plugin-vue`; removed `vuex`, `vue-template-compiler`.
2. ✅ **`src/main.ts`** rewritten — `createApp`, `createPinia`, `useNotify()` composable replacing `Vue.prototype.$message/$error`, `SimpleLightbox` removed from `globalThis`.
3. ✅ **`src/router/index.ts`** rewritten — `createRouter` + `createWebHistory`, wildcard `/:pathMatch(.*)*`, return-value guards using `useAuthStore`.
4. ✅ **`src/shims-vue.d.ts`** updated for Vue 3 `DefineComponent`.
5. ✅ **`src/registerServiceWorker.ts`** replaced with no-op stub (PWA handled by `vite-plugin-pwa`).
6. ✅ **`src/helper/constants.ts`** — `process.env.VUE_APP_*` → `import.meta.env.VITE_*`.
7. ✅ **Composables created:** `src/composables/useNotify.ts`, `src/composables/useSiteMode.ts`.

**Exit criteria:** `npm run dev` starts, root route renders (even if minimal), no `Vue.` references remain in `src/`.
> ✅ Done.

---

## Phase 3 — Replace blocker deps (≈3–4 days) 🔄 IN PROGRESS

Tackle in this order — least to most risky:

1. ✅ **`node-sass` cleanup** — replaced with `sass` (dart-sass).
2. ⬜ **Vuelidate → `@vuelidate/core`** — rewrite affected forms (`Login.vue`, `Contact.vue`, dashboard add/edit views) using `useVuelidate` in composition style.
3. ⬜ **Hooper → Swiper v11** in `src/components/Slides.vue`. Update slide template structure.
4. ⬜ **vue2-editor → Tiptap** in dashboard editor views. Define a small wrapper component to isolate the swap.
5. ✅ **vue-stripe-menu replacement** in `src/components/Nav.vue` — custom CSS dropdown with scoped SCSS, hover/click behavior on desktop, hamburger on mobile. `$options.isPhotographerMode` refactored into `useSiteMode()` composable.
6. ✅ **PWA:** `vite-plugin-pwa` wired in `vite.config.ts`; `registerServiceWorker.ts` replaced with stub.

**Exit criteria:** All blocker deps removed from `package.json`; affected components render and behave at parity.
> 🔄 Remaining: Vuelidate forms, Swiper (Slides.vue), Tiptap (dashboard editors).

---

## Phase 4 — Component migration: Options API → `<script setup lang="ts">` (≈5–7 days) 🔄 IN PROGRESS

Migrate in dependency order (leaves first) so parents land on already-converted children.

### Batch 1 — Leaf presentational ✅ DONE
`Spiner.vue`, `Footer.vue`, `SVG-sprite.vue`, `Slide.vue`, `Error.vue`, `NotFound.vue`

### Batch 2 — Grids & previews ✅ DONE
`PhotosGrid.vue`, `PhotosPreviewGrid.vue`, `PhotosGridShots.vue`, `WorksGrid.vue`, `PhotoPreview.vue`, `TheCategoryFilter.vue`, `VimeoVideoPlayer.vue`

### Batch 3 — Nav & header ✅ DONE
`Header.vue`, `Nav.vue`, `dropdowns/ShotsSubmenu.vue`, `dropdowns/PhotosSubmenu.vue`, `dropdowns/PortfolioSubmenu.vue`

### Batch 4 — Public views ⬜ TODO
`App.vue`, `Main.vue`, `Work.vue`, `Shots.vue`, `Photo.vue`, `Photos.vue`, `Portfolio.vue`, `Personal.vue`, `Contact.vue`, `Login.vue`, `Slider.vue` (needs Swiper 11), `PhotographerMain.vue`, `CinematogapherMain.vue`, `Calendar.vue`

### Batch 5 — Dashboard (most logic, do last) ⬜ TODO
`dashboard/Dashboard.vue`, `dashboard/Contacts.vue`, `dashboard/PhotoAdd.vue`, `dashboard/Photos.vue`, `dashboard/ShotAdd.vue`, `dashboard/ShotEdit.vue`, `dashboard/Shots.vue`, `dashboard/SlideAdd.vue`, `dashboard/Slider.vue`, `dashboard/TheDashboardNav.vue`, `dashboard/ThemeToggle.vue`, `dashboard/WorkAdd.vue`, `dashboard/Works.vue`

### Per-file conversion checklist

- [ ] `data() { return {...} }` → `ref` / `reactive`
- [ ] `computed: {...}` → `computed(() => ...)`
- [ ] `methods: {...}` → plain functions in `<script setup>`
- [ ] `watch: {...}` → `watch` / `watchEffect`
- [ ] `props: {...}` → `defineProps<T>()` (or `withDefaults`)
- [ ] `this.$emit('x', y)` → `const emit = defineEmits<{ x: [Y] }>()`
- [ ] `created`/`mounted`/`beforeDestroy` → `onBeforeMount`/`onMounted`/`onBeforeUnmount`
- [ ] `this.$store.dispatch/commit/state` → Pinia store: `const store = useFooStore(); store.action(); store.value`
- [ ] `this.$router` / `this.$route` → `useRouter()` / `useRoute()`
- [ ] Custom `v-model`: `value` + `input` → `modelValue` + `update:modelValue`
- [ ] `.sync` → `v-model:propName`
- [ ] Filters (`{{ x | y }}`) → plain TS functions imported into template
- [ ] `$listeners` usage → drop (merged into `$attrs`)
- [ ] `this.$message(...)` → `const { success, error } = useNotify()`
- [ ] Slot syntax already uses `v-slot` — confirm no `slot=""` attribute left
- [ ] Type all refs explicitly where inference is weak (`ref<Photo[]>([])`)

---

## Phase 5 — Pinia store migration (parallel with Phase 4) ✅ DONE

Replace each Vuex module with a Pinia store 1:1. Recommend converting stores **before** Batch 4/5 views so dashboard work consumes the new API.

| Vuex module   | Pinia store       | File                    | Status |
| ------------- | ----------------- | ----------------------- | ------ |
| `general`     | `useGeneralStore` | `src/stores/general.ts` | ✅      |
| `videos`      | `useVideosStore`  | `src/stores/videos.ts`  | ✅      |
| `photos`      | `usePhotosStore`  | `src/stores/photos.ts`  | ✅      |
| `shots`       | `useShotsStore`   | `src/stores/shots.ts`   | ✅      |
| `slides`      | `useSlidesStore`  | `src/stores/slides.ts`  | ✅      |
| `auth.module` | `useAuthStore`    | `src/stores/auth.ts`    | ✅      |

Use **setup-style** Pinia stores (composition syntax) for consistency with components:

```ts
export const usePhotosStore = defineStore("photos", () => {
  const items = ref<Photo[]>([])
  const isLoading = ref(false)
  async function fetchAll() { /* ... */ }
  return { items, isLoading, fetchAll }
})
```

Move the root `init()` action (currently dispatching `getContacts`) into `App.vue` `onMounted` calling `useGeneralStore().fetchContacts()`.

Delete `src/store/` after all consumers are converted.

---

## Phase 6 — Type tightening (≈2 days) ⬜ TODO

1. Define domain interfaces in `src/models/`: `Photo`, `Shot`, `Slide`, `Work`, `Contact`, `User`, `Category`.
2. Type repositories in `src/repositories/` with axios generics:
   ```ts
   axios.get<Photo[]>("/api/photos")
   ```
3. Flip `tsconfig.json`:
   - `noImplicitAny: true`
   - `strict: true`
   - `allowJs: false`
4. Delete `src/shims-tsx.d.ts`; update `src/shims-vue.d.ts` for Vue 3 (`*.vue` exports `DefineComponent`).
5. Fix fallout file-by-file. Use `// @ts-expect-error` sparingly with a `TODO(types):` comment.

---

## Phase 7 — QA, polish, ship (≈1–2 days) ⬜ TODO

- Manual smoke (against `packages/backend` running locally):
  - Public site: each route renders, navigation, photo grids, lightbox, video player
  - Dashboard: login, CRUD on photos/shots/slides/works/contacts, image upload
  - Service worker registration, PWA install prompt
- Lighthouse before/after — flag regressions in performance/a11y
- Bundle size diff (`npm run build` output)
- Delete dead code: `db.json` (json-server) if unused, `helper/` audit, `services/` audit
- Update `packages/frontend/README.md` with new dev commands
- Final lint + typecheck CI green

---

## Effort summary

| Phase                             | Days                   |
| --------------------------------- | ---------------------- |
| 0 — Audit                         | 1                      |
| 1 — Tooling (Vite, sass)          | 1–2                    |
| 2 — Vue 3 core swap               | 2                      |
| 3 — Dep replacements              | 3–4                    |
| 4 — Component migration (46 SFCs) | 5–7                    |
| 5 — Pinia stores                  | 1–2 (overlaps Phase 4) |
| 6 — Type tightening               | 2                      |
| 7 — QA & ship                     | 1–2                    |
| **Total**                         | **~3 weeks solo**      |

## Risk register

| Risk                                                                  | Mitigation                                                                 |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `vue-stripe-menu` has no Vue 3 successor                              | Time-box 2 days. Fallback: plain CSS dropdown.                             |
| Vuelidate API change is breaking                                      | Treat as rewrite per form; do not attempt 1:1 port.                        |
| `node-sass` → `sass` may surface deprecated `@import`/division syntax | Fix incrementally during Phase 4.                                          |
| Vite alias mismatch with TS path aliases                              | Keep `tsconfig.json` `paths` and `vite.config.ts` `resolve.alias` in sync. |
| PWA behavior regression                                               | Compare manifest + SW output pre/post.                                     |
| Dashboard editor (`vue2-editor`) data shape differs from Tiptap       | Wrapper component to isolate; convert stored HTML on read if needed.       |

## Out of scope (explicitly)

- Backend changes (`packages/backend` stays Node/Express)
- Test framework introduction (no tests today; add post-migration)
- Redesign / UX changes
- i18n
- SSR

## Rollback strategy

Each phase is a separate PR merged to `main`. If Phase N regresses production, revert that PR — earlier phases stand on their own (tooling swap, audit doc, dep cleanups in Phase 3 are all independently shippable).
