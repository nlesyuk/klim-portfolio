<template>
  <section class="dashboard-shots">
    <button
      type="button"
      class="dashboard__btn"
      @click="isShowAddShot = !isShowAddShot"
    >
      Add shot
    </button>
    <ShotAdd v-if="isShowAddShot" />

    <ShotEdit
      v-if="isEdit"
      :shot="editedShot"
      :videos="videos"
      @close="closeEdit"
    />

    <button type="button" @click="refresh" class="dashboard__btn">
      Refresh shots
    </button>

    <PhotosGridShots
      v-if="sortedFilteredPhotos"
      :images="sortedFilteredPhotos"
      :isManage="true"
      @removeImg="remove"
      @editImg="edit"
    ></PhotosGridShots>
    <Spiner v-else />
  </section>
</template>

<script>
import ShotAdd from "./ShotAdd.vue";
import ShotEdit from "./ShotEdit.vue";
import PhotosGridShots from "../../components/PhotosGridShots";
import { mapState, mapActions } from "vuex";
import { RepositoryFactory } from "Repositories/RepositoryFactory.ts";
const ShotRepository = RepositoryFactory.get("shots");

export default {
  components: {
    PhotosGridShots,
    ShotAdd,
    ShotEdit
  },
  data() {
    return {
      isLoading: false,
      isEdit: false,
      editedShot: null,
      isShowAddShot: false,
      filteredPhotos: []
    };
  },
  computed: {
    ...mapState({
      videos: state => state.videos.videos,
      allPhotos: state => state.shots.shots
    }),
    sortedFilteredPhotos() {
      return [...this.filteredPhotos].sort((a, b) => b.id - a.id);
    }
  },
  methods: {
    ...mapActions(["getAllShots", "getAllVideos"]),
    refresh() {
      this.getAllShots();
    },
    async remove(id) {
      try {
        this.isLoading = true;
        this.filteredPhotos = this.filteredPhotos.filter(v => v.id != id);
        await ShotRepository.delete(id);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("REMOVE ERROR", e);
      } finally {
        this.isLoading = false;
      }
    },
    edit(id) {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
      this.isEdit = true;
      const finded = this.filteredPhotos.filter(v => v.id === id);
      this.editedShot = finded?.length ? finded[0] : null;
    },

    closeEdit() {
      this.isEdit = false;
    }
  },
  async mounted() {
    try {
      if (!this.allPhotos.length) {
        const { data } = await this.getAllShots();
        this.filteredPhotos = data;
      }
      this.filteredPhotos = this.allPhotos;

      if (!this.videos) {
        this.getAllVideos();
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
};
</script>
