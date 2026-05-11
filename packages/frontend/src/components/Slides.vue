<template>
  <ul class="dashboard-slides" v-if="slides && slides.length">
    <li
      v-for="(item, index) in slides"
      :key="index"
      :class="[
        'dashboard-slides__item',
        { 'type-video': item.type === 'video' }
      ]"
    >
      <div class="dashboard-slides__top">
        <h4 class="dashboard-slides__title">{{ item.title }}</h4>
        <div class="dashboard-slides__btns">
          <button
            type="button"
            class="dashboard__btn-inline"
            title="order"
            disabled
          >
            {{ item.order }}
          </button>
          <button
            type="submit"
            class="dashboard__btn-inline"
            @click="onEdit(item.id)"
          >
            Edit
          </button>
          <button
            type="button"
            class="dashboard__btn-inline"
            @click="onDelete(item.id)"
          >
            Delete
          </button>
          <button
            type="button"
            class="dashboard__btn-inline"
            title="id"
            disabled
          >
            id:{{ item.id }}
          </button>
        </div>
      </div>
      <template v-if="item.type === 'image'">
        <img :src="item.image" class="slides__img" />
      </template>
      <template v-else-if="item.type === 'video'">
        <VimeoVideoPlayer :id="item.videos.vimeoId" />
      </template>
      <template v-else> bad type: {{ item.type }} </template>
    </li>
  </ul>
</template>
<script>
import VimeoVideoPlayer from "@/components/VimeoVideoPlayer";
export default {
  props: {
    slides: {
      type: Array,
      required: true
    }
  },
  components: {
    VimeoVideoPlayer
  },
  methods: {
    onEdit(item) {
      this.$emit("edit", item);
    },
    onDelete(item) {
      this.$emit("delete", item);
    }
  }
};
</script>
