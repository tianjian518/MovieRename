<script setup lang="ts">
import MediaCardListView from '@/views/discover/MediaCardListView.vue'

// 电影或者电视剧 movies/tvs
const type = ref('movies')

// 过滤参数
const filterParams = reactive({
  sort_by: 'popularity.desc',
  with_genres: '',
  with_original_language: '',
  with_keywords: '',
  with_watch_providers: '',
  vote_average: 0,
  vote_count: 10,
  release_date: '',
})

// TMDB 电影排序字典
const tmdbSortDict: Record<string, string> = {
  'popularity.desc': '热度降序',
  'popularity.asc': '热度升序',
  'release_date.desc': '上映日期降序',
  'release_date.asc': '上映日期升序',
  'vote_average.desc': '评分降序',
  'vote_average.asc': '评分升序',
}

// TMDB 电视剧排序字典
const tmdbTvSortDict: Record<string, string> = {
  'popularity.desc': '热度降序',
  'popularity.asc': '热度升序',
  'first_air_date.desc': '首播日期降序',
  'first_air_date.asc': '首播日期升序',
  'vote_average.desc': '评分降序',
  'vote_average.asc': '评分升序',
}

// TMDB电影风格字典
const tmdbMovieGenreDict: Record<string, string> = {
  '28': '动作',
  '12': '冒险',
  '16': '动画',
  '35': '喜剧',
  '80': '犯罪',
  '99': '纪录片',
  '18': '剧情',
  '10751': '家庭',
  '14': '奇幻',
  '36': '历史',
  '27': '恐怖',
  '10402': '音乐',
  '9648': '悬疑',
  '10749': '爱情',
  '878': '科幻',
  '10770': '电视电影',
  '53': '惊悚',
  '10752': '战争',
  '37': '西部',
}

// TMDB电视剧风格字典
const tmdbTvGenreDict: Record<string, string> = {
  '10759': '动作冒险',
  '16': '动画',
  '35': '喜剧',
  '80': '犯罪',
  '99': '纪录片',
  '18': '剧情',
  '10751': '家庭',
  '10762': '儿童',
  '9648': '悬疑',
  '10763': '新闻',
  '10764': '真人秀',
  '10765': '科幻奇幻',
  '10766': '肥皂剧',
  '10767': '戏剧',
  '10768': '战争政治',
  '37': '西部',
}

// TMDB原始语言字典（主要语言）
const tmdbLanguageDict = {
  'zh': '中文',
  'en': '英语',
  'ja': '日语',
  'ko': '韩语',
  'fr': '法语',
  'de': '德语',
  'es': '西班牙语',
  'it': '意大利语',
  'ru': '俄语',
  'pt': '葡萄牙语',
  'ar': '阿拉伯语',
  'hi': '印地语',
  'th': '泰语',
}

// 当前Key
const currentKey = ref(0)

// 类型变化
watch(type, () => {
  if (!type.value) {
    type.value = 'movies'
  }
  if (type.value === 'movies') {
    if (!tmdbSortDict[filterParams.sort_by]) {
      filterParams.sort_by = 'popularity.desc'
    }
    if (!tmdbMovieGenreDict[filterParams.with_genres]) {
      filterParams.with_genres = ''
    }
  }
  if (type.value === 'tvs') {
    if (!tmdbTvSortDict[filterParams.sort_by]) {
      filterParams.sort_by = 'popularity.desc'
    }
    if (!tmdbTvGenreDict[filterParams.with_genres]) {
      filterParams.with_genres = ''
    }
  }
  currentKey.value++
})

// 过滤参数变化
watch(filterParams, () => {
  if (!filterParams.sort_by) {
    filterParams.sort_by = 'popularity.desc'
  }
  currentKey.value++
})
</script>

<template>
  <div class="px-3">
    <div class="flex justify-start align-center">
      <div class="mr-5">
        <VLabel>类型</VLabel>
      </div>
      <VChipGroup v-model="type">
        <VChip :color="type == 'movies' ? 'primary' : ''" filter tile value="movies">电影</VChip>
        <VChip :color="type == 'tvs' ? 'primary' : ''" filter tile value="tvs">电视剧</VChip>
      </VChipGroup>
    </div>
    <div class="flex justify-start align-center">
      <div class="mr-5">
        <VLabel>排序</VLabel>
      </div>
      <VChipGroup v-model="filterParams.sort_by">
        <VChip
          :color="filterParams.sort_by == key ? 'primary' : ''"
          filter
          tile
          :value="key"
          v-for="(value, key) in type == 'movies' ? tmdbSortDict : tmdbTvSortDict"
          :key="key"
        >
          {{ value }}
        </VChip>
      </VChipGroup>
    </div>
    <div class="flex justify-start align-center">
      <div class="mr-5">
        <VLabel>风格</VLabel>
      </div>
      <VChipGroup v-model="filterParams.with_genres">
        <VChip
          :color="filterParams.with_genres == key ? 'primary' : ''"
          filter
          tile
          :value="key"
          v-for="(value, key) in type == 'movies' ? tmdbMovieGenreDict : tmdbTvGenreDict"
          :key="key"
        >
          {{ value }}
        </VChip>
      </VChipGroup>
    </div>
    <div class="flex justify-start align-center">
      <div class="mr-5">
        <VLabel>语言</VLabel>
      </div>
      <VChipGroup v-model="filterParams.with_original_language">
        <VChip
          :color="filterParams.with_original_language == key ? 'primary' : ''"
          filter
          tile
          :value="key"
          v-for="(value, key) in tmdbLanguageDict"
          :key="key"
        >
          {{ value }}
        </VChip>
      </VChipGroup>
    </div>
    <div class="flex justify-start align-center">
      <div class="mr-5">
        <VLabel>评分</VLabel>
      </div>
      <VSlider v-model="filterParams.vote_average" thumb-label max="10" min="0" class="align-center" hide-details>
        <template v-slot:append>
          <VTextField
            width="5rem"
            v-model="filterParams.vote_count"
            density="compact"
            type="number"
            hide-details
            single-line
          />
        </template>
      </VSlider>
    </div>
  </div>

  <div>
    <MediaCardListView :key="currentKey" :apipath="`discover/tmdb_${type}`" :params="filterParams" />
  </div>
</template>
