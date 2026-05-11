<template>
  <vsm-menu
    :menu="myMenu"
    :base-width="380"
    :screen-offset="10"
    element="div"
    handler="hover"
  >
    <template #default="data">
      <component :is="data.item.content" class="content" />
    </template>
    <template #title="data">
      {{ data.item.title }}
    </template>
    <template #after-nav>
      <vsm-mob ref="mobile">
        <div class="vsm-mob-content__mob-menu">
          <!-- 1 -->
          <template v-if="$options.isCinematographerMode">
            <router-link class="vsm-link" exact-path :to="{ path: '/' }">
              Works
            </router-link>
            <router-link class="vsm-link" exact-path :to="{ path: '/shots' }">
              Shots
            </router-link>
            <router-link class="vsm-link" exact-path :to="{ path: '/photo' }">
              Photo
            </router-link>
          </template>
          <!-- 2 -->
          <template v-else-if="$options.isPhotographerMode">
            <router-link class="vsm-link" exact-path :to="{ path: '/' }">
              Main
            </router-link>
            <router-link
              class="vsm-link"
              exact-path
              :to="{ path: '/portfolio' }"
            >
              Portfolio
            </router-link>
            <router-link class="vsm-link" exact-path :to="{ path: '/photo' }">
              Personal
            </router-link>
          </template>
          <!-- for all roles -->
          <router-link class="vsm-link" exact-path :to="{ path: '/contact' }">
            Contact
          </router-link>
        </div>
      </vsm-mob>
    </template>
  </vsm-menu>
</template>

<script>
import ShotsSubmenu from "./dropdowns/ShotsSubmenu.vue";
import PhotosSubmenu from "./dropdowns/PhotosSubmenu.vue";
import PortfolioSubmenu from "./dropdowns/PortfolioSubmenu.vue";
import { isCinematographerMode, isPhotographerMode } from "@/helper/constants";

export default {
  isPhotographerMode,
  isCinematographerMode,
  computed: {
    myMenu() {
      const classes = ["header__nav-item"];

      let menu;
      if (isCinematographerMode) {
        menu = [
          // 1
          {
            title: "Works",
            attributes: {
              class: classes
            },
            listeners: {
              click: () => {
                if (this.$route.path === "/") return;
                this.$router.push("/");
              }
            }
          },
          // 2
          {
            title: "Shots",
            attributes: {
              class: classes
            },
            listeners: {
              click: () => {
                if (this.$route.path === "/shots") return;
                this.$router.push("/shots");
              }
            },
            dropdown: "ShotsSubmenu",
            content: ShotsSubmenu
          },
          // 3
          {
            title: "Photo",
            attributes: {
              class: classes
            },
            listeners: {
              click: () => {
                if (this.$route.path === "/photo") return;
                this.$router.push("/photo");
              }
            },
            dropdown: "PhotosSubmenu",
            content: PhotosSubmenu
          }
        ];
      } else {
        menu = [
          /// 1
          {
            title: "Main",
            attributes: {
              class: classes
            },
            listeners: {
              click: () => {
                const path = "/";
                if (this.$route.path === path) return;
                this.$router.push(path);
              }
            }
          },
          /// 2
          {
            title: "Portfolio",
            attributes: {
              class: classes
            },
            listeners: {
              click: () => {
                const path = "/portfolio";
                if (this.$route.path === path) return;
                this.$router.push(path);
              }
            },
            dropdown: "PortfolioSubmenu",
            content: PortfolioSubmenu
          },
          /// 3
          {
            title: "Personal",
            attributes: {
              class: classes
            },
            listeners: {
              click: () => {
                const path = "/personal";
                if (this.$route.path === path) return;
                this.$router.push(path);
              }
            }
          }
        ];
      }

      const baseMenu = [
        {
          title: "Contact",
          attributes: {
            class: classes
          },
          listeners: {
            click: () => {
              if (this.$route.path === "/contact") return;
              this.$router.push("/contact");
            }
          }
        }
      ];

      return menu.concat(baseMenu);
    }
  },
  methods: {
    closeMobMenu(e) {
      if (e.target.closest(".vsm-link")) {
        this.$refs["mobile"].closeDropdown();
      }
    }
  },
  mounted() {
    document.addEventListener("click", this.closeMobMenu);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.closeMobMenu);
  }
};
</script>
