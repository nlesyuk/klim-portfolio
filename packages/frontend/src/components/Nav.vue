<template>
  <nav class="nav" :class="{ 'nav--open': mobileOpen }">
    <!-- desktop menu -->
    <ul class="nav__list">
      <template v-if="isCinematographerMode">
        <li
          class="nav__item"
          @mouseenter="openDropdown('shots')"
          @mouseleave="closeDropdown"
        >
          <button class="nav__btn header__nav-item" @click="go('/')">
            Works
          </button>
        </li>
        <li
          class="nav__item nav__item--has-dropdown"
          @mouseenter="openDropdown('shots')"
          @mouseleave="closeDropdown"
        >
          <button class="nav__btn header__nav-item" @click="go('/shots')">
            Shots
          </button>
          <div v-if="activeDropdown === 'shots'" class="nav__dropdown">
            <ShotsSubmenu />
          </div>
        </li>
        <li
          class="nav__item nav__item--has-dropdown"
          @mouseenter="openDropdown('photos')"
          @mouseleave="closeDropdown"
        >
          <button class="nav__btn header__nav-item" @click="go('/photo')">
            Photo
          </button>
          <div v-if="activeDropdown === 'photos'" class="nav__dropdown">
            <PhotosSubmenu />
          </div>
        </li>
      </template>
      <template v-else>
        <li
          class="nav__item"
          @mouseenter="closeDropdown"
          @mouseleave="closeDropdown"
        >
          <button class="nav__btn header__nav-item" @click="go('/')">
            Main
          </button>
        </li>
        <li
          class="nav__item nav__item--has-dropdown"
          @mouseenter="openDropdown('portfolio')"
          @mouseleave="closeDropdown"
        >
          <button class="nav__btn header__nav-item" @click="go('/portfolio')">
            Portfolio
          </button>
          <div v-if="activeDropdown === 'portfolio'" class="nav__dropdown">
            <PortfolioSubmenu />
          </div>
        </li>
        <li
          class="nav__item"
          @mouseenter="closeDropdown"
          @mouseleave="closeDropdown"
        >
          <button class="nav__btn header__nav-item" @click="go('/personal')">
            Personal
          </button>
        </li>
      </template>
      <li
        class="nav__item"
        @mouseenter="closeDropdown"
        @mouseleave="closeDropdown"
      >
        <button class="nav__btn header__nav-item" @click="go('/contact')">
          Contact
        </button>
      </li>
    </ul>

    <!-- hamburger -->
    <button
      class="nav__hamburger"
      aria-label="menu"
      @click="mobileOpen = !mobileOpen"
    >
      <span></span><span></span><span></span>
    </button>

    <!-- mobile menu -->
    <div v-if="mobileOpen" class="nav__mobile" @click="mobileOpen = false">
      <template v-if="isCinematographerMode">
        <router-link class="vsm-link" :to="{ path: '/' }">Works</router-link>
        <router-link class="vsm-link" :to="{ path: '/shots' }"
          >Shots</router-link
        >
        <router-link class="vsm-link" :to="{ path: '/photo' }"
          >Photo</router-link
        >
      </template>
      <template v-else>
        <router-link class="vsm-link" :to="{ path: '/' }">Main</router-link>
        <router-link class="vsm-link" :to="{ path: '/portfolio' }"
          >Portfolio</router-link
        >
        <router-link class="vsm-link" :to="{ path: '/photo' }"
          >Personal</router-link
        >
      </template>
      <router-link class="vsm-link" :to="{ path: '/contact' }"
        >Contact</router-link
      >
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import ShotsSubmenu from "./dropdowns/ShotsSubmenu.vue";
import PhotosSubmenu from "./dropdowns/PhotosSubmenu.vue";
import PortfolioSubmenu from "./dropdowns/PortfolioSubmenu.vue";
import { isCinematographerMode } from "@/helper/constants";

const router = useRouter();
const activeDropdown = ref<string | null>(null);
const mobileOpen = ref(false);

function openDropdown(name: string) {
  activeDropdown.value = name;
}
function closeDropdown() {
  activeDropdown.value = null;
}

function go(path: string) {
  mobileOpen.value = false;
  if (router.currentRoute.value.path !== path) router.push(path);
}

function handleClickOutside(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest(".nav")) {
    mobileOpen.value = false;
    closeDropdown();
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside),
);
</script>

<style lang="scss" scoped>
.nav {
  position: relative;

  &__list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0;
  }

  &__item {
    position: relative;

    &--has-dropdown:hover .nav__dropdown {
      display: block;
    }
  }

  &__btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 16px;
  }

  &__dropdown {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 100;
    background: #fff;
    min-width: 160px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  &__hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;

    span {
      display: block;
      width: 24px;
      height: 2px;
      background: currentColor;
    }

    @media (max-width: 768px) {
      display: flex;
    }
  }

  &__list {
    @media (max-width: 768px) {
      display: none;
    }
  }

  &__mobile {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }
}
</style>
