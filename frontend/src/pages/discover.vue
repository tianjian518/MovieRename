<script setup lang="ts">
import { DiscoverTabs } from '@/router/menu'
import router from '@/router'
import TheMovieDbView from '@/views/discover/TheMovieDbView.vue'
import DoubanView from '@/views/discover/DoubanView.vue'
import BangumiView from '@/views/discover/BangumiView.vue'
import ExtraSourceView from '@/views/discover/ExtraSourceView.vue'
import { DiscoverSource } from '@/api/types'
import api from '@/api'

const route = useRoute()
const activeTab = ref(route.query.tab)

function jumpTab(tab: string) {
  router.push('/subscribe/discover?tab=' + tab)
}

// 额外的数据源
const extraDiscoverSources = ref<DiscoverSource[]>([])

// 加载额外的发现数据源
async function loadExtraDiscoverSources() {
  try {
    extraDiscoverSources.value = await api.get('discover/source')
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  await loadExtraDiscoverSources()
})

onActivated(async () => {
  loadExtraDiscoverSources()
})
</script>

<template>
  <div>
    <VTabs v-model="activeTab" show-arrows>
      <VTab v-for="item in DiscoverTabs" :value="item.tab" @to="jumpTab(item.tab)">
        <div class="min-w-24">
          {{ item.title }}
        </div>
      </VTab>
      <VTab
        v-for="item in extraDiscoverSources"
        :key="item.mediaid_prefix"
        :value="item.mediaid_prefix"
        @to="jumpTab(item.mediaid_prefix)"
      >
        <div class="min-w-24">
          {{ item.name }}
        </div>
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab" class="mt-5 disable-tab-transition" :touch="false">
      <VWindowItem value="themoviedb">
        <transition name="fade-slide" appear>
          <div>
            <TheMovieDbView />
          </div>
        </transition>
      </VWindowItem>
      <VWindowItem value="douban">
        <transition name="fade-slide" appear>
          <div>
            <DoubanView />
          </div>
        </transition>
      </VWindowItem>
      <VWindowItem value="bangumi">
        <transition name="fade-slide" appear>
          <div>
            <BangumiView />
          </div>
        </transition>
      </VWindowItem>
      <VWindowItem v-for="item in extraDiscoverSources" :key="item.mediaid_prefix" :value="item.mediaid_prefix">
        <transition name="fade-slide" appear>
          <div>
            <ExtraSourceView :source="item" />
          </div>
        </transition>
      </VWindowItem>
    </VWindow>
  </div>
</template>
