<template>
  <div class="shots">
    <div class="shots__tags">
      <button
        type="button"
        v-for="(name, idx) in categories"
        :key="idx"
        @click="changeFilter(name)"
        :class="['btn', 'btn-primary', { active: filter === name }]"
      >
        {{ name }}
      </button>
    </div>

    <transition name="fade" mode="out-in">
      <template v-if="toggle">
        <PhotosGrid
          v-if="filteredShots.length"
          :images="filteredShots"
          :is-shots="true"
        />
        <p v-else-if="filteredShots.length === 0" class="home__empty-category">
          Don't have any shots yet
        </p>
        <Spiner v-else />
      </template>
    </transition>
  </div>
</template>
<script>
import PhotosGrid from "../components/PhotosGrid";
import { mapActions, mapState } from "vuex";
import { setTitle } from "@/helper";

export default {
  components: {
    PhotosGrid
  },
  data() {
    return {
      toggle: true, // for relaunch gridPhotos component when change filter
      filteredShots: []
    };
  },
  computed: {
    filter() {
      return this.$route.query.filter;
    },
    ...mapState({
      allShots: state => state.shots.shots,
      categories: state => state.shots.categories
    }),
    sortedFilteredShots() {
      return [...this.filteredShots].sort((a, b) => b.id - a.id);
    }
  },
  watch: {
    $route(route) {
      const filter = route.query.filter;
      this.applyFilter(filter);
    }
  },
  methods: {
    ...mapActions(["getAllShots"]),
    init() {
      if (!this.allShots.length) {
        this.getAllShots().then(data => {
          this.filteredShots = data;

          // apply filter if exist in route
          const filter = this.$route?.query?.filter;
          if (filter) {
            this.applyFilter(filter);
          }
        });
      }
      this.filteredShots = this.allShots;
    },
    changeFilter(filter) {
      this.toggle = false;
      if (this.$route.query.filter !== filter) {
        this.$router.replace({ name: "shots", query: { filter } });
        this.applyFilter(filter);
        setTimeout(() => {
          this.toggle = true;
        }, 300);
      }
    },
    applyFilter(key) {
      this.filteredShots =
        key === "all"
          ? this.allShots
          : this.allShots.filter(item => item.categories.includes(key));
    }
  },
  mounted() {
    setTitle("Shots");
    this.init();
  }
};
</script>
