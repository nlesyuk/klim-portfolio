<template>
  <div class="contact">
    <div class="contact__main" v-if="contacts">
      <div class="contact__top-container">
        <figure class="contact__figure">
          <img v-if="image" :src="image" class="contact__img" loading="lazy" />
          <img
            v-else
            src="@/assets/contact-image.jpg"
            class="contact__img"
            loading="lazy"
          />
        </figure>
        <div class="contact__info">
          <span class="contact__text" v-if="contacts.email">
            Email
            <a :href="`mailto:${contacts.email}`">{{ contacts.email }}</a>
          </span>
          <span class="contact__text" v-if="contacts.phone">
            phone number
            <a :href="`tel:${phone}`">{{ contacts.phone }}</a>
          </span>
          <div class="contact__text">
            social media
            <ul class="contact__social">
              <li>
                <a :href="contacts.facebook" target="_blank">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <use xlink:href="#svg-sprite--facebook"></use>
                  </svg>
                </a>
              </li>
              <li>
                <a :href="contacts.instagram" target="_blank">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <use xlink:href="#svg-sprite--instagram"></use>
                  </svg>
                </a>
              </li>
              <li>
                <a :href="contacts.telegram" target="_blank">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <use xlink:href="#svg-sprite--telegram"></use>
                  </svg>
                </a>
              </li>
              <li>
                <a :href="contacts.vimeo" target="_blank">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <use xlink:href="#svg-sprite--vimeo"></use>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        class="contact__description"
        v-if="description"
        v-html="description"
      ></div>
      <iframe
        v-if="isActivateCalendar"
        src="https://calendar.google.com/calendar/embed?src=jj25uk5sp09g04sk4g9pru6538%40group.calendar.google.com&ctz=Europe%2FKiev"
        width="800"
        height="600"
        frameborder="0"
        scrolling="no"
      ></iframe>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
import { setTitle } from "@/helper";

export default {
  data() {
    return {
      isActivateCalendar: false
    };
  },
  computed: {
    image() {
      return this.contacts?.image;
    },
    phone() {
      if (!this.contacts) return null;
      return this.contacts.phone.replace(/[^\w\s]/gi, "").replace(/\s/gi, "");
    },
    ...mapState({
      contacts: state => state.general.contacts
    }),
    description() {
      try {
        const res = JSON.parse(this.contacts?.description);
        return res;
      } catch (e) {
        const res = this.contacts?.description;
        return res;
      }
    }
  },
  methods: {
    ...mapActions(["getContacts"])
  },
  mounted() {
    setTitle("Contact");
    if (!this.contacts) {
      this.getContacts();
    }

    // /contact/?calendar=on
    if (this.$route.query.calendar === "on") {
      this.isActivateCalendar = true;
      setTitle("Calendar");
    }
  }
};
</script>
