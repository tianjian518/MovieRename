<script setup lang="ts">
import api from '@/api'
import { DownloaderConf } from '@/api/types'
import DownloadingListView from '@/views/reorganize/DownloadingListView.vue'
import router from '@/router'
import NoDataFound from '@/components/NoDataFound.vue'

const route = useRoute()
const activeTab = ref(route.query.tab)

// 下载器
const downloaders = ref<DownloaderConf[]>([])

// 调用API查询下载器设置
async function loadDownloaderSetting() {
  try {
    downloaders.value = await api.get('download/clients')
    if (downloaders.value && downloaders.value.length > 0 && !activeTab.value)
      activeTab.value = downloaders.value[0].name
  } catch (error) {
    console.log(error)
  }
}

function jumpTab(tab: string) {
  router.push('/subscribe/movie?tab=' + tab)
}

onMounted(async () => {
  await loadDownloaderSetting()
})

onActivated(async () => {
  loadDownloaderSetting()
})
</script>

<template>
  <div v-if="downloaders.length > 0">
    <VTabs v-model="activeTab">
      <VTab v-for="item in downloaders" :value="item.name" @to="jumpTab(item.name)">
        <span class="min-w-24">{{ item.name }}</span>
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab" class="mt-5 disable-tab-transition" :touch="false">
      <VWindowItem v-for="item in downloaders" :value="item.name">
        <transition name="fade-slide" appear>
          <div>
            <DownloadingListView :name="item.name" />
          </div>
        </transition>
      </VWindowItem>
    </VWindow>
  </div>
  <NoDataFound
    v-else
    error-code="404"
    error-title="没有下载器"
    error-description="请先在设置中正确配置并启用下载器。"
  />
</template>
