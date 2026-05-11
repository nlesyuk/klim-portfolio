<template>
  <div class="work-page">
    <Spiner v-if="isLoading" />

    <template v-if="work">
      <VimeoVideoPlayer :id="work.videos.vimeoId" :previewImg="previewImg" />
      <h1 class="work-page__title">{{ work.title }}</h1>
      <p class="work-page__description" v-html="work.description"></p>
      <PhotosGrid
        v-show="work.photos"
        :images="work.photos"
        :isWorks="isPreview"
      />
      <p class="work-page__credits" v-html="work.credits"></p>
    </template>
    <h2 v-else-if="!error && !work && !isLoading" class="something-went-wrong">
      Something went wrong :()
    </h2>

    <Error
      v-if="error"
      :statusCode="error.status"
      :message="error.statusText"
    />
  </div>
</template>

<script>
import PhotosGrid from "../components/PhotosGrid";
import VimeoVideoPlayer from "../components/VimeoVideoPlayer";
import { RepositoryFactory } from "./../repositories/RepositoryFactory";
const VideosRepository = RepositoryFactory.get("videos");
import { setTitle, handlerServerErrors } from "../helper/index";

export default {
  name: "Work",
  props: {
    previewWork: {
      type: Object
    },
    isPreview: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    previewWork(v) {
      this.work = v;
    }
  },
  components: {
    PhotosGrid,
    VimeoVideoPlayer
  },
  data() {
    return {
      work: null,
      error: null,
      isLoading: false
    };
  },
  computed: {
    previewImg() {
      if (!this.work) {
        return null;
      }
      if (this.isPreview) {
        const res = this.work?.photos
          ? this.work.photos.filter(img => img.isPreview)
          : [];
        return res.length ? res[0].src : "";
      }
      const res = this.work.photos.filter(img => img.isPreview);
      return res.length ? res[0].src : null;
    }
  },
  async mounted() {
    setTitle("Work");

    if (this.isPreview) {
      this.work = this.previewWork;
      return;
    }

    try {
      this.isLoading = true;
      const { data } = await VideosRepository.getVideo(this.$route.params.id);
      this.work = data;
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
      this.error = handlerServerErrors(e);
    } finally {
      this.isLoading = false;
    }
  }
};
</script>
