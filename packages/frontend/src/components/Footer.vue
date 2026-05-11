<template>
  <footer class="footer">
    <p class="footer__text">
      {{ description }}
    </p>
    <p class="footer__text" v-if="contacts">
      contact me
      <a :href="`mailto:${contacts.email}`">{{ contacts.email }}</a>
    </p>
  </footer>
</template>

<script>
import { mapState } from "vuex";
import { currentUser } from "@/helper/constants";

export default {
  computed: {
    ...mapState({
      contacts: state => state.general.contacts
    }),
    description() {
      return currentUser.footerDescription;
    }
  }
};
</script>
