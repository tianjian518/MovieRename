<script lang="ts" setup>
import { useRoute } from 'vue-router'
import router from '@/router'
import AccountSettingDirectory from '@/views/setting/AccountSettingDirectory.vue'
import { SettingTabs } from '@/router/menu'

const route = useRoute()

const activeTab = ref(route.query.tab)

function jumpTab(tab: string) {
  router.push('/setting?tab=' + tab)
}
</script>

<template>
  <div>
    <VTabs v-model="activeTab" show-arrows class="v-tabs-pill">
      <VTab
        v-for="item in SettingTabs"
        :key="item.icon"
        :value="item.tab"
        @click="jumpTab(item.tab)"
        selected-class="v-slide-group-item--active v-tab--selected"
      >
        <div class="flex align-center">
          <VIcon size="20" start :icon="item.icon" />
          {{ item.title }}
        </div>
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab" class="mt-5 disable-tab-transition" :touch="false">
      <!-- 存储 & 目录 -->
      <VWindowItem value="directory">
        <transition name="fade-slide" appear>
          <div>
            <AccountSettingDirectory />
          </div>
        </transition>
      </VWindowItem>
    </VWindow>
  </div>
</template>
