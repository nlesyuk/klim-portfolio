<template>
  <div class="works" v-if="works">
    <router-link
      tag="figure"
      class="work"
      v-for="(item, idx) in sortedWorks"
      :key="idx"
      :to="{ path: `/work/${item.id}` }"
      :style="getPreviewStyle(item.id)"
    >
      <ul class="dashboard__list" v-if="isAdmin">
        <li>
          <button
            type="button"
            class="dashboard__btn-inline"
            @click.prevent="remove(item.id)"
          >
            Remove
          </button>
        </li>
        <li>
          <button
            type="button"
            class="dashboard__btn-inline"
            @click.prevent="edit(item.id)"
          >
            Edit
          </button>
        </li>
        <li>
          <button
            type="button"
            class="dashboard__btn-inline"
            title="id"
            disabled
          >
            {{ item.id }}
          </button>
        </li>
        <li>
          <button
            type="button"
            class="dashboard__btn-inline"
            title="order"
            disabled
          >
            {{ item.order }}
          </button>
        </li>
      </ul>
      <div class="work__description">
        <!-- <svg width="24" height="24">
          <use xlink:href="#svg-sprite--video"></use>
        </svg> -->
        <h2 class="work__title">{{ item.title }}</h2>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    works: {
      type: Array,
      required: true,
      default: () => []
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    sortedWorks() {
      const works = this.works;
      if (!works?.length) {
        return [];
      }
      return works?.sort((a, b) => b.order - a.order); // new add to the begin
      // return works?.sort((a, b) => a.order - b.order); // new add to the end
    }
  },
  methods: {
    getPreviewStyle(id) {
      return `background-image: url(${this.getPreviewPhoto(id)})`;
    },
    getPreviewPhoto(id) {
      const work = this.works?.filter(v => v.id === id);
      if (!work?.length) {
        return "";
      }
      const res = work?.[0]?.photos?.filter(v => v.isPreview);
      return res?.length ? res[0].src : "";
    },

    // admin:
    edit(id) {
      this.$emit("edit", id);
    },
    remove(id) {
      this.$emit("delete", id);
    }
  }
};
</script>
