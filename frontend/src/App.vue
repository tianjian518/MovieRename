<script lang="ts" setup>
import { useTheme } from 'vuetify'
import { checkPrefersColorSchemeIsDark } from '@/@core/utils'
import { ensureRenderComplete, removeEl } from './@core/utils/dom'

// 生效主题
const { global: globalTheme } = useTheme()
let themeValue = localStorage.getItem('theme') || 'light'
const autoTheme = checkPrefersColorSchemeIsDark() ? 'dark' : 'light'
globalTheme.name.value = themeValue === 'auto' ? autoTheme : themeValue

// 显示状态
const show = ref(false)

// ApexCharts 全局配置
declare global {
  interface Window {
    Apex: any
  }
}

if (window.Apex) {
  // 数据标签
  window.Apex.dataLabels = {
    formatter: function (_: number, { seriesIndex, w }: { seriesIndex: number; w: any }) {
      // 如果有小数点，保留两位小数，否则保留整数
      const data = w.config.series[seriesIndex]
      return data.toFixed(data % 1 === 0 ? 0 : 1)
    },
  }
  // 图例
  window.Apex.legend = {
    labels: {
      useSeriesColors: true,
    },
  }
  // 标题
  window.Apex.title = {
    style: {
      color: 'rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity))',
    },
  }
}

onMounted(() => {
  ensureRenderComplete(() => {
    nextTick(() => {
      setTimeout(() => {
        // 移除加载动画
        removeEl('#loading-bg')
        // 将background属性从html的style中移除
        document.documentElement.style.removeProperty('background')
        // 显示页面
        show.value = true
      }, 1500)
    })
  })
})
</script>

<template>
  <VApp v-show="show">
    <RouterView />
  </VApp>
</template>
