<template>
  <div>
    <template v-if="chunkedImages">
      <div
        class="grid-container"
        v-for="(arrImages, idx) in chunkedImages"
        :key="idx"
      >
        <div
          class="grid-type grid-type--oneline"
          :class="{
            'grid-type--oneline-1': arrImages.length === 1,
            'grid-type--oneline-2': arrImages.length === 2,
            'grid-type--oneline-3': arrImages.length === 3
          }"
        >
          <figure
            v-for="(item, index) in arrImages"
            :key="index"
            class="grid__item"
          >
            <ul class="dashboard__list" v-if="isManage">
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
            </ul>

            <router-link
              class="grid__lightbox1"
              tag="a"
              :to="{ name: 'work', params: { id: item.workId } }"
            >
              <img :src="item.src" alt="" class="grid__img" loading="lazy" />
            </router-link>
            <!-- <a class="grid__lightbox" :href="item.src">
              <img :src="item.src" alt="" class="grid__img" loading="lazy" />
            </a> -->
          </figure>
        </div>
      </div>
    </template>
    <div v-else-if="chunkedImages === 0" class="grid-empty">
      Don't have any items yet
    </div>
  </div>
</template>

<script>
import { chunk } from "lodash";

export default {
  props: {
    images: {
      type: Array,
      required: true
    },
    isManage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      lightbox: null
    };
  },
  watch: {
    images(v) {
      if (v.length) {
        this.uninstallLightBox();
        this.installLightBox();
      }
    }
  },
  methods: {
    installLightBox() {
      this.lightbox = new SimpleLightbox({
        elements: ".grid-container .grid__lightbox"
      });
    },
    uninstallLightBox() {
      if (this.lightbox) {
        this.lightbox.destroy();
        this.lightbox = null;
      }
    },
    remove(id) {
      this.$emit("removeImg", id);
    },
    edit(id) {
      this.$emit("editImg", id);
    }
  },
  computed: {
    chunkedImages() {
      if (!this.images) {
        return false;
      } else if (this.images.length === 0) {
        return 0;
      }
      return chunk(this.images, 3);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.installLightBox();
    });
  },
  destroyed() {
    this.uninstallLightBox();
  }
};
</script>
