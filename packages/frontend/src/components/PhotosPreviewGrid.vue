<template>
  <div class="works" v-if="photos.length">
    <!-- <transition-group
      v-if="photos.length"
      class="works company content__list"
      tag="div"
      name="company"
      mode="in-out"
    > -->
    <router-link
      tag="figure"
      class="work"
      v-for="item in sortedPhotos"
      :key="item.title"
      :to="{ path: `/photo/${item.id}` }"
      :style="getPreviewStyle(item.id)"
    >
      <div class="work__description">
        <!-- <svg width="24" height="24">
          <use xlink:href="#svg-sprite--video"></use>
        </svg> -->
        <h2 class="work__title">{{ item.title }}</h2>
      </div>
    </router-link>
    <!-- </transition-group> -->
  </div>
</template>

<script>
export default {
  props: {
    photos: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    sortedPhotos() {
      const photos = this.photos;
      if (!photos?.length) {
        return [];
      }
      return photos?.sort((a, b) => a.order - b.order);
    }
  },
  methods: {
    getPreviewStyle(id) {
      return `background-image: url(${this.getFirstPreviewPhoto(id)})`;
    },
    getFirstPreviewPhoto(id) {
      const photoCollection = this.photos?.filter(v => v.id === id);
      if (!photoCollection?.length) {
        return "";
      }
      // get preview photos
      const previewPhotos = photoCollection?.[0]?.photos?.filter(
        v => v.isPreview
      );
      // sort preview photo by order index
      const sortedPreviewPhotos = previewPhotos.sort(
        (a, b) => a.order - b.order
      );

      return sortedPreviewPhotos?.length ? sortedPreviewPhotos?.[0].src : "";
    }
  }
};
</script>
