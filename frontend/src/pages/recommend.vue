<script setup lang="ts">
import api from '@/api'
import { RecommendSource } from '@/api/types'
import MediaCardSlideView from '@/views/discover/MediaCardSlideView.vue'
import { useDisplay } from 'vuetify'

// APP
const display = useDisplay()
const appMode = inject('pwaMode') && display.mdAndDown.value

const viewList = reactive<{ apipath: string; linkurl: string; title: string }[]>([
  {
    apipath: 'recommend/tmdb_trending',
    linkurl: '/browse/recommend/tmdb_trending?title=流行趋势',
    title: '流行趋势',
  },
  {
    apipath: 'recommend/douban_showing',
    linkurl: '/browse/recommend/douban_showing?title=正在热映',
    title: '正在热映',
  },
  {
    apipath: 'bangumi/calendar',
    linkurl: '/browse/bangumi/calendar?title=Bangumi每日放送',
    title: 'Bangumi每日放送',
  },
  {
    apipath: 'recommend/tmdb_movies',
    linkurl: '/browse/recommend/tmdb_movies?title=TMDB热门电影',
    title: 'TMDB热门电影',
  },
  {
    apipath: 'recommend/tmdb_tvs?with_original_language=zh|en|ja|ko',
    linkurl: '/browse/recommend/tmdb_tvs??with_original_language=zh|en|ja|ko&title=TMDB热门电视剧',
    title: 'TMDB热门电视剧',
  },
  {
    apipath: 'recommend/douban_movie_hot',
    linkurl: '/browse/recommend/douban_movie_hot?title=豆瓣热门电影',
    title: '豆瓣热门电影',
  },
  {
    apipath: 'recommend/douban_tv_hot',
    linkurl: '/browse/recommend/douban_tv_hot?title=豆瓣热门电视剧',
    title: '豆瓣热门电视剧',
  },
  {
    apipath: 'recommend/douban_tv_animation',
    linkurl: '/browse/recommend/douban_tv_animation?title=豆瓣热门动漫',
    title: '豆瓣热门动漫',
  },
  {
    apipath: 'recommend/douban_movies',
    linkurl: '/browse/recommend/douban_movies?title=豆瓣最新电影',
    title: '豆瓣最新电影',
  },
  {
    apipath: 'recommend/douban_tvs',
    linkurl: '/browse/recommend/douban_tvs?title=豆瓣最新电视剧',
    title: '豆瓣最新电视剧',
  },
  {
    apipath: 'recommend/douban_movie_top250',
    linkurl: '/browse/recommend/douban_movie_top250?title=电影TOP250',
    title: '豆瓣电影TOP250',
  },
  {
    apipath: 'recommend/douban_tv_weekly_chinese',
    linkurl: '/browse/recommend/douban_tv_weekly_chinese?title=豆瓣国产剧集榜',
    title: '豆瓣国产剧集榜',
  },
  {
    apipath: 'recommend/douban_tv_weekly_global',
    linkurl: '/browse/recommend/douban_tv_weekly_global?title=豆瓣全球剧集榜',
    title: '豆瓣全球剧集榜',
  },
])

// 计算启用的视图
const enabledViews = computed(() => viewList.filter(item => enableConfig.value[item.title]))

// 榜单启用配置， 以title为key
const enableConfig = ref<{ [key: string]: boolean }>({
  ...Object.fromEntries(viewList.map(item => [item.title, true])),
})

// 弹窗
const dialog = ref(false)

// 额外的数据源
const extraRecommendSources = ref<RecommendSource[]>([])

// 加载额外的发现数据源
async function loadExtraRecommendSources() {
  try {
    extraRecommendSources.value = await api.get('recommend/source')
    if (extraRecommendSources.value.length > 0) {
      viewList.push(
        ...extraRecommendSources.value.map(source => ({
          apipath: source.api_path,
          linkurl: `/browse/recommend/${source.api_path}?title=${source.name}`,
          title: source.name,
        })),
      )
    }
  } catch (error) {
    console.log(error)
  }
}

// 加载面板配置
async function loadConfig() {
  // 显示配置
  const local_enable = localStorage.getItem('MP_RECOMMEND')
  if (local_enable) {
    enableConfig.value = JSON.parse(local_enable)
  } else {
    const response = await api.get('/user/config/Recommend')
    if (response && response.data && response.data.value) {
      enableConfig.value = response.data.value
      localStorage.setItem('MP_RECOMMEND', JSON.stringify(response.data.value))
    }
  }
}

// 设置项目
async function saveConfig() {
  // 启用配置
  const enableString = JSON.stringify(enableConfig.value)
  localStorage.setItem('MP_RECOMMEND', enableString)

  // 保存到服务端
  try {
    await api.post('/user/config/Recommend', enableConfig.value)
  } catch (error) {
    console.error(error)
  }
  dialog.value = false
}

onBeforeMount(async () => {
  await loadConfig()
})

onMounted(async () => {
  await loadExtraRecommendSources()
})

onActivated(async () => {
  loadExtraRecommendSources()
})
</script>

<template>
  <div>
    <MediaCardSlideView v-for="item in enabledViews" :key="item.title" v-bind="item" />
    <!-- 弹窗，根据配置生成选项 -->
    <VDialog v-if="dialog" v-model="dialog" max-width="35rem" scrollable>
      <VCard>
        <VCardItem>
          <VCardTitle>设置推荐榜单</VCardTitle>
        </VCardItem>
        <VDivider />
        <VCardText>
          <VRow>
            <VCol v-for="item in viewList" :key="item.title" cols="6" md="4" sm="4">
              <VCheckbox v-model="enableConfig[item.title]" :label="item.title" />
            </VCol>
          </VRow>
        </VCardText>
        <VDivider />
        <VCardText class="pt-5 text-end">
          <VSpacer />
          <VBtn variant="outlined" color="secondary" class="me-4" @click="dialog = false"> 关闭 </VBtn>
          <VBtn @click="saveConfig">
            <template #prepend>
              <VIcon icon="mdi-content-save" />
            </template>
            保存
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
  <!-- 底部操作按钮 -->
  <VFab
    icon="mdi-text-box-edit"
    location="bottom"
    size="x-large"
    fixed
    app
    appear
    @click="dialog = true"
    :class="{ 'mb-12': appMode }"
  />
</template>
