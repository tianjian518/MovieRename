<script setup lang="ts">
import { SystemNavMenus } from '@/router/menu'
import { useDisplay } from 'vuetify'
import { VMenu } from 'vuetify/lib/components/index.mjs'

const display = useDisplay()
const appMode = inject('pwaMode') && display.mdAndDown.value

const route = useRoute()

const moreMenuDialog = ref(false)

// 底部主按钮（最多 4 个），其余放入「更多」菜单
const footerMenus = computed(() => SystemNavMenus.slice(0, 4))
const moreMenus = computed(() => SystemNavMenus.slice(4))

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

const currentPath = computed(() => route.path)
</script>

<template>
  <div v-if="appMode" class="w-100">
    <VBottomNavigation
      grow
      horizontal
      color="primary"
      class="footer-nav border-t"
      style="block-size: calc(3.5rem + env(safe-area-inset-bottom))"
      :z-index="9998"
    >
      <VBtn
        v-for="menu in footerMenus"
        :key="menu.to"
        :to="menu.to"
        :ripple="false"
        :color="isActive(menu.to) ? 'primary' : undefined"
      >
        <VIcon size="28" :icon="menu.icon" />
      </VBtn>
      <VBtn :ripple="false" :color="moreMenus.length && moreMenus.every(m => !isActive(m.to)) ? 'primary' : undefined">
        <VIcon
          size="28"
          :icon="moreMenuDialog ? 'mdi-close' : 'mdi-dots-horizontal'"
        />
        <VMenu v-model="moreMenuDialog" close-on-content-click activator="parent">
          <VDivider />
          <VList class="font-bold" lines="one">
            <VListSubheader class="bg-transparent"> 更多 </VListSubheader>
            <VListItem
              class="pe-20"
              v-for="(menu, index) in moreMenus"
              :key="index"
              :prepend-icon="menu.icon"
              nav
              :to="menu.to"
              :base-color="currentPath === menu.to ? 'primary' : undefined"
            >
              <VListItemTitle>
                <span class="text-lg">{{ menu.title }}</span>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </VBtn>
    </VBottomNavigation>
  </div>
</template>

<style lang="scss">
.footer-nav {
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  background-color: rgb(var(--v-theme-surface), 0.8);
  padding-block-end: env(safe-area-inset-bottom);
}

.footer-nav .v-btn--variant-text .v-btn__overlay {
  background-color: transparent !important;
}
</style>
