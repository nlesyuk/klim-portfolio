<template>
  <section class="dashboard-works">
    <button class="dashboard__btn" @click="isShowAddWork = !isShowAddWork">
      Add work
    </button>
    <WorkAdd
      v-if="isShowAddWork"
      :work="work"
      :works="videos"
      :isEdit="isEdit"
      @resetForm="isEdit = false"
      @workCreateSuccessfully="refresh"
    ></WorkAdd>

    <button type="button" @click="refresh" class="dashboard__btn">
      Refresh works
    </button>

    <WorksGrid
      v-if="videos && videos.length"
      :works="videos"
      :isAdmin="true"
      @delete="onDelete"
      @edit="onEdit"
    ></WorksGrid>
    <div v-else-if="videos && videos.length === 0" class="grid-empty">
      Don't have any items yet
    </div>
    <Spiner v-else />
  </section>
</template>

<script>
import WorkAdd from "./WorkAdd.vue";
import WorksGrid from "../../components/WorksGrid.vue";
import { mapState, mapActions } from "vuex";
import { RepositoryFactory } from "Repositories/RepositoryFactory.ts";
const VideosRepository = RepositoryFactory.get("videos");

export default {
  components: {
    WorkAdd,
    WorksGrid
  },
  data() {
    return {
      work: null,
      isEdit: false,
      isShowAddWork: false
    };
  },
  computed: {
    ...mapState({
      videos: state => state.videos.videos
    })
  },
  methods: {
    ...mapActions(["getAllVideos"]),
    refresh() {
      this.getAllVideos();
    },
    onEdit(id) {
      this.isEdit = true;
      const item = this.videos.filter(v => v.id === id);
      this.work = item?.length ? item[0] : null;
      this.isShowAddWork = true; // we use the addWork form for edit a work
    },
    onDelete(id) {
      VideosRepository.delete(id);
    }
  },
  created() {
    if (!this.videos) {
      this.getAllVideos();
    }
  }
};
</script>
