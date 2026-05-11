<template>
  <div>
    <template v-if="chunkedImages && chunkedImages.vertical">
      <div
        class="grid-container"
        v-for="(arrImages, idx) in chunkedImages.vertical"
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
            v-for="(image, index) in arrImages"
            :key="index"
            class="grid__item"
          >
            <ul class="dashboard__list" v-if="isManage">
              <li>
                <span class="dashboard__badge badge-green m0">
                  id: {{ image.id }}
                </span>
              </li>
              <li>
                <button type="button" @click.prevent="remove(image.id)">
                  Remove
                </button>
              </li>
              <li>
                <button type="button" @click.prevent="edit(image.id)">
                  Edit
                </button>
              </li>
            </ul>

            <button
              v-if="isShots"
              type="button"
              class="grid__btn"
              @click="goTo(image)"
            >
              MORE
            </button>

            <a class="grid__lightbox" :href="image.src" ref="lightbox">
              <img :src="image.src" alt="" class="grid__img" loading="lazy" />
            </a>
          </figure>
        </div>
      </div>
    </template>
    <template v-if="chunkedImages && chunkedImages.horizontal">
      <div
        class="grid-container"
        v-for="(arrImages, idx) in chunkedImages.horizontal"
        :key="`0${idx}`"
      >
        <div
          class="grid-type"
          :class="{
            'grid-type--big-on-left': arrImages.length === 3 && (idx + 1) % 2,
            'grid-type--big-on-right':
              arrImages.length === 3 && !((idx + 1) % 2),
            'grid-type--two': arrImages.length === 2,
            'grid-type--one': arrImages.length === 1
          }"
        >
          <figure
            v-for="(image, index) in arrImages"
            :key="index"
            class="grid__item"
          >
            <ul class="dashboard__list" slot="default" v-if="isManage">
              <li>
                <span class="dashboard__badge badge-green m0">
                  id: {{ image.id }}
                </span>
              </li>
              <li>
                <button type="button" @click.prevent="remove(image.id)">
                  Remove
                </button>
              </li>
              <li>
                <button type="button" @click.prevent="edit(image.id)">
                  Edit
                </button>
              </li>
            </ul>

            <button
              v-if="isShots"
              type="button"
              class="grid__btn"
              @click="goTo(image)"
            >
              MORE
            </button>

            <a class="grid__lightbox" :href="image.src" ref="lightbox">
              <img :src="image.src" alt="" class="grid__img" loading="lazy" />
            </a>
          </figure>
        </div>
      </div>
    </template>
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
    },
    isShots: {
      type: Boolean,
      default: false
    },
    isWorks: {
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
        // elements: ".grid-container .grid__lightbox",
        elements: this.$refs.lightbox
      });
    },
    uninstallLightBox() {
      if (this.lightbox) {
        this.lightbox.destroy();
        this.lightbox = null;
      }
    },
    goTo(item) {
      if (item?.hasOwnProperty("photoId")) {
        this.$router.push({
          name: "photo",
          params: { id: item.photoId }
        });
      }
      if (item?.hasOwnProperty("workId")) {
        this.$router.push({
          name: "work",
          params: { id: item.workId }
        });
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
      if (!this.images.length) return;

      const sortOrder = (f, s) =>
        f?.order && s?.order ? f.order - s.order : 0;

      // type of render grid 1: vertical, 2: horizontal 3: big on left, big on right
      // if (this.isShots) {
      //   const str = JSON.stringify(this.images);
      //   const arr = JSON.parse(str).sort(sortOrder);
      //   return {
      //     vartical: chunk(arr, 3)
      //   };
      // }

      if (this.isWorks) {
        const str = JSON.stringify(this.images);
        const arr = JSON.parse(str).sort(sortOrder);
        return {
          horizontal: chunk(arr, 3)
        };
      }

      let vertivalImages = this.images.filter(v =>
        v?.format ? v.format === "vertical" : true
      );
      vertivalImages = vertivalImages.sort(sortOrder);

      let horizontalImages = this.images.filter(v =>
        v?.format ? v.format === "horizontal" : true
      );
      horizontalImages = horizontalImages.sort(sortOrder);

      return {
        vertical: chunk(vertivalImages, 3),
        horizontal: chunk(horizontalImages, 3)
      };
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
