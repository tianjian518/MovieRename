<script lang="ts" setup>
import { isNullOrEmptyObject } from '@/@core/utils'
import api from '@/api'
import { useToast } from 'vue-toast-notification'

// 定义事件
const emit = defineEmits(['done', 'close'])

// 提示框
const $toast = useToast()

// 是否加载中
const loading = ref(false)

// 用户认证表单
const authForm = ref<any>({
  site: null,
  params: {},
})

// 所有认证站点
const authSites = ref<{
  [key: string]: {
    name: string
    icon: string
    params: { [key: string]: any }
  }
}>({})

// 生成站点拉选项
const dropdownItems = computed(() => {
  return Object.keys(authSites.value).map(key => {
    return {
      key,
      name: authSites.value[key].name,
      prependAvatar: authSites.value[key].icon,
    }
  })
})

// 读取authSites.params，生成表单配置列表
const formFields = computed(() => {
  const site = authSites.value[authForm.value.site]
  return Object.keys(site?.params || {})
    .filter(item => {
      return site.params[item].name && site.params[item].type
    })
    .map(key => {
      return {
        key,
        site: authForm.value.site,
        name: site.params[key].name,
        type: site.params[key].type,
        placeholder: site.params[key].placeholder,
        tooltip: site.params[key].tooltip,
      }
    })
})

// 查询之前使用的认证参数
async function loadLastAuthParams() {
  try {
    const result: { [key: string]: any } = await api.get(`system/setting/UserSiteAuthParams`)
    if (result.success) {
      const ret = result.data?.value
      if (ret && !isNullOrEmptyObject(ret.params)) {
        authForm.value = ret
      }
    }
  } catch (e) {
    console.error(e)
  }
}

// 加载认证站点配置
async function loadAuthSites() {
  try {
    authSites.value = (await api.get(`site/auth`)) || {}
  } catch (e) {
    console.error(e)
  }
}

// 完成
async function handleDone() {
  await checkUser()
}

// 认证处理
async function checkUser() {
  if (!authForm.value.site) {
    $toast.error('请选择认证站点！')
    return
  }
  if (!authSites.value[authForm.value.site]) {
    $toast.error('站点配置不存在！')
    return
  }
  if (formFields.value.length > 0) {
    for (const field of formFields.value) {
      if (!authForm.value.params[field.site.toUpperCase() + '_' + field.key.toUpperCase()]) {
        $toast.error(`请输入${field.name}！`)
        return
      }
    }
  }
  loading.value = true
  try {
    const result: { [key: string]: any } = await api.post(`site/auth`, authForm.value)
    if (result.success) {
      $toast.success('用户认证成功，请重新登录！')
      // 1秒后刷新页面
      setTimeout(() => {
        emit('done')
      }, 1000)
    } else {
      $toast.error(`认证失败：${result.message}`)
    }
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

onMounted(async () => {
  await loadAuthSites()
  loadLastAuthParams()
})
</script>

<template>
  <VDialog width="40rem" max-height="85vh">
    <VCard title="用户认证" class="rounded-t">
      <DialogCloseBtn @click="emit('close')" />
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VSelect
              v-model="authForm.site"
              :items="dropdownItems"
              item-value="key"
              item-title="name"
              label="选择认证站点"
              item-props
            >
            </VSelect>
          </VCol>
        </VRow>
        <VRow>
          <VCol v-for="param in formFields" :key="param.key">
            <VTextField
              v-model="authForm.params[param.site.toUpperCase() + '_' + param.key.toUpperCase()]"
              :type="param.type"
              :label="param.name"
              :placeholder="param.placeholder"
              :hint="param.tooltip"
              clearable
              persistent-hint
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="text-center">
        <VBtn
          variant="elevated"
          @click="handleDone"
          prepend-icon="mdi-check"
          class="px-5"
          size="large"
          :disabled="loading"
        >
          开始认证
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
