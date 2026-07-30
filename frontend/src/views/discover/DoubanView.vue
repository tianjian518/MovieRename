<script setup lang="ts">
import MediaCardListView from '@/views/discover/MediaCardListView.vue'

// 电影或者电视剧 movies/tvs
const type = ref('movies')

// 过滤参数
const filterParams = reactive({
  'sort': 'U',
  'tags': '',
})

// 豆瓣风格类型
const doubanCategory = ref('')

// 地区
const doubanZone = ref('')

// 年代
const doubanYear = ref('')

// 豆瓣风格字典
const categoryDict = {
  '喜剧': '喜剧',
  '爱情': '爱情',
  '动作': '动作',
  '科幻': '科幻',
  '动画': '动画',
  '悬疑': '悬疑',
  '犯罪': '犯罪',
  '惊悚': '惊悚',
  '冒险': '冒险',
  '音乐': '音乐',
  '历史': '历史',
  '奇幻': '奇幻',
  '恐怖': '恐怖',
  '战争': '战争',
  '传记': '传记',
  '歌舞': '歌舞',
  '武侠': '武侠',
  '情色': '情色',
  '灾难': '灾难',
  '西部': '西部',
  '纪录片': '纪录片',
  '短片': '短片',
}

// 地区字典
const zoneDict = {
  '华语': '华语',
  '欧美': '欧美',
  '韩国': '韩国',
  '日本': '日本',
  '中国大陆': '中国大陆',
  '美国': '美国',
  '中国香港': '中国香港',
  '中国台湾': '中国台湾',
  '英国': '英国',
  '法国': '法国',
  '德国': '德国',
  '意大利': '意大利',
  '西班牙': '西班牙',
  '印度': '印度',
  '泰国': '泰国',
  '俄罗斯': '俄罗斯',
  '加拿大': '加拿大',
  '澳大利亚': '澳大利亚',
  '爱尔兰': '爱尔兰',
  '瑞典': '瑞典',
  '巴西': '巴西',
  '丹麦': '丹麦',
}

// 年代字典
const yearDict: Record<string, string> = {
  '2020年代': '2020年代',
  '2010年代': '2010年代',
  '2000年代': '2000年代',
  '90年代': '90年代',
  '80年代': '80年代',
  '70年代': '70年代',
  '60年代': '60年代',
}

// 往年代字典中追加当前年份及往前5年的字典
const currentYear = new Date().getFullYear()
for (let i = 0; i < 6; i++) {
  yearDict[`${currentYear - i}`] = `${currentYear - i}`
}

// 豆瓣过滤参数
const doubanSortDict = {
  'U': '综合排序',
  'R': '首播时间',
  'T': '近期热度',
  'S': '高分优先',
}

// 风格、年代、地区变化时，以,分隔拼接到tags参数
watch([doubanCategory, doubanZone, doubanYear], () => {
  filterParams.tags = [doubanCategory.value, doubanZone.value, doubanYear.value].filter(Boolean).join(',')
})

// 当前Key
const currentKey = ref(0)

// 类型和过滤参数变化后重新刷新列表
watch([type, filterParams], () => {
  if (!type.value) {
    type.value = 'movies'
  }
  if (!filterParams.sort) {
    filterParams.sort = 'U'
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
      <VChipGroup v-model="filterParams.sort">
        <VChip
          :color="filterParams.sort == key ? 'primary' : ''"
          filter
          tile
          :value="key"
          v-for="(value, key) in doubanSortDict"
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
      <VChipGroup v-model="doubanCategory">
        <VChip
          :color="doubanCategory == key ? 'primary' : ''"
          filter
          tile
          :value="key"
          v-for="(value, key) in categoryDict"
          :key="key"
        >
          {{ value }}
        </VChip>
      </VChipGroup>
    </div>
    <div class="flex justify-start align-center">
      <div class="mr-5">
        <VLabel>地区</VLabel>
      </div>
      <VChipGroup v-model="doubanZone">
        <VChip
          :color="doubanZone == key ? 'primary' : ''"
          filter
          tile
          :value="key"
          v-for="(value, key) in zoneDict"
          :key="key"
        >
          {{ value }}
        </VChip>
      </VChipGroup>
    </div>
    <div class="flex justify-start align-center">
      <div class="mr-5">
        <VLabel>年代</VLabel>
      </div>
      <VChipGroup v-model="doubanYear">
        <VChip
          :color="doubanYear == key ? 'primary' : ''"
          filter
          tile
          :value="key"
          v-for="(value, key) in yearDict"
          :key="key"
        >
          {{ value }}
        </VChip>
      </VChipGroup>
    </div>
  </div>
  <div>
    <MediaCardListView :key="currentKey" :apipath="`discover/douban_${type}`" :params="filterParams" />
  </div>
</template>
