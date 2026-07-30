<script setup lang="ts">
import { Context } from '@/api/types'
import MediaInfoCard from '../cards/MediaInfoCard.vue'

// 输入参数
defineProps({
  context: Object as PropType<Context>,
})

// 定义事件
const emit = defineEmits(['close'])
</script>
<template>
  <VDialog max-width="50rem">
    <VCard>
      <DialogCloseBtn @click="emit('close')" />
      <VCardItem>
        <MediaInfoCard :context="context" />
      </VCardItem>
    </VCard>
  </VDialog>
</template>
