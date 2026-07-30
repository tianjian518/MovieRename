<script lang="ts" setup>
import api from '@/api'
import QrcodeVue from 'qrcode.vue'
import { VCardItem, VTextField } from 'vuetify/lib/components/index.mjs'

// 定义输入
const props = defineProps({
  conf: {
    type: Object as PropType<{ [key: string]: any }>,
    required: true,
  },
})

// 定义事件
const emit = defineEmits(['done', 'close'])

// 二维码内容
const qrCodeContent = ref('')

// 下方的提示信息
const text = ref('请使用微信或115客户端扫码，或在下方输入Cookie')

// 提醒类型
const alertType = ref<'success' | 'info' | 'error' | 'warning' | undefined>('info')

// timeout定时器
let timeoutTimer: NodeJS.Timeout | undefined = undefined

// 完成
async function handleDone() {
  clearTimeout(timeoutTimer)
  if (props.conf?.cookie) {
    await savaU115Config()
  }
  emit('done')
}

// 调用/aliyun/qrcode api生成二维码
async function getQrcode() {
  try {
    const result: { [key: string]: any } = await api.get('/storage/qrcode/u115')
    if (result.success && result.data) {
      qrCodeContent.value = result.data.codeContent
    } else {
      text.value = result.message
    }
  } catch (e) {
    console.error(e)
  }
}

// 调用/aliyun/check api验证二维码
async function checkQrcode() {
  try {
    const result: { [key: string]: any } = await api.get('/storage/check/u115')
    if (result.success && result.data) {
      const status = result.data.status
      text.value = result.data.tip
      if (status == 0) {
        alertType.value = 'info'
        // 新建、待扫码
        clearTimeout(timeoutTimer)
        timeoutTimer = setTimeout(checkQrcode, 3000)
      } else if (status == 1) {
        // 已扫码
        alertType.value = 'info'
        text.value = '已扫码，请确认登录'
        clearTimeout(timeoutTimer)
        timeoutTimer = setTimeout(checkQrcode, 3000)
      } else if (status == 2) {
        // 已确认完成
        alertType.value = 'success'
        handleDone()
      } else {
        // 过期或者已取消
        alertType.value = 'error'
      }
    } else {
      alertType.value = 'error'
      text.value = result.message
    }
  } catch (e) {
    console.error(e)
  }
}

// 保存cookie设置
async function savaU115Config() {
  try {
    await api.post(`storage/save/u115`, props.conf)
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  await getQrcode()
  timeoutTimer = setTimeout(checkQrcode, 3000)
})

onUnmounted(() => {
  if (timeoutTimer) clearTimeout(timeoutTimer)
})
</script>

<template>
  <VDialog width="40rem" scrollable max-height="85vh">
    <VCard title="115网盘登录" class="rounded-t">
      <DialogCloseBtn @click="emit('close')" />
      <VCardText class="pt-2 flex flex-col items-center">
        <div class="my-6 shadow-lg rounded text-center p-3 border">
          <QrcodeVue class="mx-auto" :value="qrCodeContent" :size="200" />
        </div>
        <VAlert variant="tonal" :type="alertType" class="my-4 text-center" :text="text">
          <template #prepend />
        </VAlert>
      </VCardText>
      <VCardText>
        <VRow>
          <VCol class="mt-2">
            <VTextField label="自定义Cookie" v-model="props.conf.cookie" outlined dense />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="elevated" @click="handleDone" prepend-icon="mdi-check" class="px-5 me-3"> 完成 </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
