<script setup lang="ts">
import SubscribeListView from '@/views/subscribe/SubscribeListView.vue'
import SubscribePopularView from '@/views/subscribe/SubscribePopularView.vue'
import SubscribeShareView from '@/views/subscribe/SubscribeShareView.vue'
import { SubscribeMovieTabs, SubscribeTvTabs } from '@/router/menu'
import router from '@/router'

const route = useRoute()

const subType = route.meta.subType?.toString()
const subId = ref(route.query.id as string)
const activeTab = ref(route.query.tab)

function jumpTab(tab: string) {
  router.push('/subscribe/movie?tab=' + tab)
}
</script>

<template>
  <div>
    <VTabs v-model="activeTab" show-arrows>
      <VTab v-if="subType == '电影'" v-for="item in SubscribeMovieTabs" :value="item.tab" @to="jumpTab(item.tab)">
        <div class="flex align-center min-w-24">
          <VIcon size="20" start :icon="item.icon" />
          {{ item.title }}
        </div>
      </VTab>
      <VTab v-if="subType == '电视剧'" v-for="item in SubscribeTvTabs" :value="item.tab" @to="jumpTab(item.tab)">
        <div class="flex align-center min-w-24">
          <VIcon size="20" start :icon="item.icon" />
          {{ item.title }}
        </div>
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab" class="mt-5 disable-tab-transition" :touch="false">
      <VWindowItem value="mysub">
        <transition name="fade-slide" appear>
          <div>
            <SubscribeListView :type="subType" :subid="subId" />
          </div>
        </transition>
      </VWindowItem>
      <VWindowItem value="popular">
        <transition name="fade-slide" appear>
          <div>
            <SubscribePopularView :type="subType" />
          </div>
        </transition>
      </VWindowItem>
      <VWindowItem value="share">
        <transition name="fade-slide" appear>
          <div>
            <SubscribeShareView />
          </div>
        </transition>
      </VWindowItem>
    </VWindow>
  </div>
</template>
