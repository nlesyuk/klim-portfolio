<template>
  <header class="header">
    <ul class="header__social">
      <li v-if="contacts && contacts.facebook">
        <a :href="contacts.facebook" target="_blank">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <use xlink:href="#svg-sprite--facebook"></use>
          </svg>
        </a>
      </li>
      <li v-if="contacts && contacts.instagram">
        <a :href="contacts.instagram" target="_blank">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <use xlink:href="#svg-sprite--instagram"></use>
          </svg>
        </a>
      </li>
      <li v-if="contacts && contacts.vimeo">
        <a :href="contacts.vimeo" target="_blank">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <use xlink:href="#svg-sprite--vimeo"></use>
          </svg>
        </a>
      </li>
    </ul>

    <router-link
      :class="[
        'header__logo-link',
        { 'cinematographer-active': isCinematographer }
      ]"
      :to="{ path: '/' }"
    >
      <img
        v-if="isCinematographer"
        src="@/assets/cinematographer-logo.svg"
        alt="logo"
      />
      <img v-else src="@/assets/photographer-logo.svg" alt="logo" />
    </router-link>

    <Nav class="header__nav" />
  </header>
</template>

<script>
import Nav from "./Nav.vue";
import { mapState } from "vuex";
import { isCinematographerMode } from "@/helper/constants";

export default {
  components: {
    Nav
  },
  computed: {
    ...mapState({
      contacts: state => state.general.contacts
    }),
    isCinematographer() {
      return isCinematographerMode;
    }
  }
};
</script>
