<template>
  <nav class="header__nav-submenu">
    <ul>
      <li>
        <router-link
          exact
          exact-active-class="active"
          :to="{ path: '/shots', query: { filter: 'all' } }"
          class="header__nav-submenu-item"
        >
          all
        </router-link>
      </li>
      <li>
        <router-link
          exact-path
          exact-active-class="active"
          :to="{ path: '/shots', query: { filter: 'portrait' } }"
          class="header__nav-submenu-item"
        >
          portrait
        </router-link>
      </li>
      <li>
        <router-link
          exact-path
          exact-active-class="active"
          :to="{ path: '/shots', query: { filter: 'landscape' } }"
          class="header__nav-submenu-item"
        >
          landscape
        </router-link>
      </li>
      <li>
        <router-link
          exact-path
          exact-active-class="active"
          :to="{ path: '/shots', query: { filter: 'mood' } }"
          class="header__nav-submenu-item"
        >
          mood
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {};
</script>
