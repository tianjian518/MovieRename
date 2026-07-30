<!-- eslint-disable sonarjs/no-duplicate-string -->
<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import { copyToClipboard } from '@/@core/utils/navigator'
import draggable from 'vuedraggable'
import api from '@/api'
import { CustomRule, FilterRuleGroup } from '@/api/types'
import CustomerRuleCard from '@/components/cards/CustomRuleCard.vue'
import FilterRuleGroupCard from '@/components/cards/FilterRuleGroupCard.vue'
import ImportCodeDialog from '@/components/dialog/ImportCodeDialog.vue'

// 自定义规则列表
const customRules = ref<CustomRule[]>([])

// 所有规则组列表
const filterRuleGroups = ref<FilterRuleGroup[]>([])

// 种子优先规则
const selectedTorrentPriority = ref<string>('seeder')

// 二级分类策略
const mediaCategories = ref<{ [key: string]: any }>({})

// 导入代码弹窗
const importCodeDialog = ref(false)

// 导入代码类型
const importCodeType = ref('')

// 提示框
const $toast = useToast()

// 种子优先规则下拉框
const TorrentPriorityItems = [
  { title: '资源优先级', value: 'torrent' },
  { title: '站点优先级', value: 'site' },
  { title: '站点上传量', value: 'upload' },
  { title: '资源做种数', value: 'seeder' },
]

// 调用API查询自动分类配置
async function loadMediaCategories() {
  try {
    mediaCategories.value = await api.get('media/category')
  } catch (error) {
    console.log(error)
  }
}

// 保存自定义规则
async function saveCustomRules() {
  // 检查是否存在空id规则
  if (customRules.value.some(item => !item.id)) {
    $toast.error('存在空ID的规则，无法保存，请修改！')
    return
  }
  // 检查是否存在空的规则名称
  if (customRules.value.some(item => !item.name)) {
    $toast.error('存在空名字的规则，无法保存，请修改！')
    return
  }
  // 获取所有规则ID和名称
  const ids = customRules.value.map(item => item.id)
  const names = customRules.value.map(item => item.name)
  // 检查是否存在重名的规则ID
  if (new Set(ids).size !== ids.length) {
    $toast.error('存在重复规则ID！无法保存，请修改！')
    return
  }
  // 检查是否存在重名规则名称
  if (new Set(names).size !== names.length) {
    $toast.error('存在重复规则名称！无法保存，请修改！')
    return
  }
  try {
    const result: { [key: string]: any } = await api.post('system/setting/CustomFilterRules', customRules.value)
    if (result.success) $toast.success('自定义规则保存成功')
    else $toast.error('自定义规则保存失败！')
  } catch (error) {
    console.log(error)
  }
}

// 添加自定义规则
async function addCustomRule() {
  let id = `RULE${customRules.value.length + 1}`
  while (customRules.value.some(item => item.id === id)) {
    id = `RULE${parseInt(id.split('RULE')[1]) + 1}`
  }
  let name = `规则${customRules.value.length + 1}`
  while (customRules.value.some(item => item.name === name)) {
    name = `规则${parseInt(name.split('规则')[1]) + 1}`
  }
  customRules.value.push({
    id: id,
    name: name,
  })
}

// 移除自定义规则
function removeCustomRule(rule: CustomRule) {
  const index = customRules.value.findIndex(item => item.id === rule.id)
  if (index !== -1) customRules.value.splice(index, 1)
}

// 加载规则组
async function queryFilterRuleGroups() {
  try {
    const result: { [key: string]: any } = await api.get('system/setting/UserFilterRuleGroups')
    filterRuleGroups.value = result.data?.value ?? []
  } catch (error) {
    console.log(error)
  }
}

// 保存规则组
async function saveFilterRuleGroups() {
  // 检查是否存在空的规则组名称
  if (filterRuleGroups.value.some(item => !item.name)) {
    $toast.error('存在空名字的规则组！无法保存，请修改！')
    return
  }
  // 检查是否存在重名规则组
  const names = filterRuleGroups.value.map(item => item.name)
  if (new Set(names).size !== names.length) {
    $toast.error('存在重复规则组名称！无法保存，请修改！')
    return
  }
  try {
    const result: { [key: string]: any } = await api.post('system/setting/UserFilterRuleGroups', filterRuleGroups.value)
    if (result.success) $toast.success('优先级规则组保存成功')
    else $toast.error('优先级规则组保存失败！')
  } catch (error) {
    console.log(error)
  }
}

// 添加规则组
function addFilterRuleGroup() {
  let name = `规则组${filterRuleGroups.value.length + 1}`
  while (filterRuleGroups.value.some(item => item.name === name)) {
    name = `规则组${parseInt(name.split('规则组')[1]) + 1}`
  }
  filterRuleGroups.value.push({
    name: name,
  })
}

// 分享规则
async function shareRules(rules: CustomRule[] | FilterRuleGroup[], type: string) {
  if (!rules || rules.length === 0) return

  // 将卡片规则接装为字符串
  const value = JSON.stringify(rules)

  // 复制到剪贴板
  try {
    let success
    success = copyToClipboard(value)
    if (await success) $toast.success(`${type === 'custom' ? '自定义规则' : '优先级规则组'}已复制到剪贴板！`)
    else $toast.error(`${type === 'custom' ? '自定义规则' : '优先级规则组'}复制失败：可能是浏览器不支持或被用户阻止！`)
  } catch (e) {
    $toast.error(`${type === 'custom' ? '自定义规则' : '优先级规则组'}复制失败！`)
    console.error(e)
  }
}

// 打开弹窗
async function importRules(ruleType: string) {
  importCodeType.value = ruleType
  importCodeDialog.value = true
}

// 保存导入的代码
function saveCodeString(type: string, codeString: any) {
  // codeString从子组件传递过来，从对象转换为JSON
  let parsedCode
  try {
    parsedCode = JSON.parse(codeString.value)
  } catch (e) {
    $toast.error('导入规则失败！无法解析输入的数据！')
    console.error(e)
    return
  }

  // 更新数据
  try {
    if (type === 'custom') {
      if (!checkValueValidity(parsedCode, type)) return false
      const newCustomRules = extractCustomRules(parsedCode) || []
      customRules.value = [...customRules.value, ...newCustomRules]
    } else if (type === 'group') {
      if (!checkValueValidity(parsedCode, type)) return false
      const newFilterRuleGroups = extractFilterRuleGroups(parsedCode) || []
      filterRuleGroups.value = [...filterRuleGroups.value, ...newFilterRuleGroups]
    } else {
      $toast.error('导入规则失败！未知的数据类型！')
    }
  } catch (e) {
    $toast.error('导入规则失败！')
    console.error(e)
  }
}

// 赋值自定义规则，避免存在多余的属性
function extractCustomRules(value: any) {
  try {
    return value.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        include: item.include,
        exclude: item.exclude,
        size_range: item.size_range,
        seeders: item.seeders,
        publish_time: item.publish_time,
      }
    })
  } catch (e) {
    console.error(e)
  }
}

// 赋值规则组，避免存在多余的属性
function extractFilterRuleGroups(value: any) {
  try {
    return value.map((item: any) => {
      return {
        name: item.name,
        rule_string: item.rule_string,
        media_type: item.media_type,
        category: item.category,
      }
    })
  } catch (e) {
    console.error(e)
  }
}

// 根据ID简单区分规则与规则组
function checkValueValidity(values: any, type: string): boolean {
  try {
    // 允许空值存在，不影响最终的导入
    if (!values) return true
    if (!type) return false
    for (const value of values) {
      const keys = Object.keys(value)
      const uniqueKeys = new Set(keys)

      const hasName = keys.includes('name')
      const hasId = keys.includes('id')
      const noDuplicates = keys.length === uniqueKeys.size
      if (type == 'custom') {
        if (!hasName || !hasId || !noDuplicates) {
          if (!noDuplicates) $toast.warning(`存在重名值`)
          if (!hasId) $toast.error(`导入失败！发现有规则不存在ID，可能属于优先级规则组！`)
          return false
        }
      } else if (type == 'group') {
        if (!hasName || hasId || !noDuplicates) {
          if (!noDuplicates) $toast.warning(`存在重名值`)
          if (hasId) $toast.error(`导入失败！发现有规则存在ID，可能属于自定义规则！`)
          return false
        }
      } else {
        console.error(`传入了不合法的类型！`)
        return false
      }
    }
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

// 清空规则（组）
function deleteAllRules(dateType: string) {
  if (!dateType) return
  if (dateType === 'custom') {
    customRules.value = []
  } else if (dateType === 'group') {
    filterRuleGroups.value = []
  } else {
    console.error(`传入了不支持的类型！`)
  }
}

// 规则变化时赋值
function onRuleChange(rule: CustomRule, id: string) {
  const index = customRules.value.findIndex(item => item.id === id)
  if (index !== -1) customRules.value[index] = rule
}

// 移除规则组
function removeFilterRuleGroup(rule: FilterRuleGroup) {
  const index = filterRuleGroups.value.findIndex(item => item.name === rule.name)
  if (index !== -1) filterRuleGroups.value.splice(index, 1)
}

// 规则组变化时赋值
function changeRuleGroup(group: FilterRuleGroup, name: string) {
  const index = filterRuleGroups.value.findIndex(item => item.name === name)
  if (index !== -1) filterRuleGroups.value[index] = group
}

// 查询种子优先规则
async function queryTorrentPriority() {
  try {
    const result: { [key: string]: any } = await api.get('system/setting/TorrentsPriority')

    selectedTorrentPriority.value = result.data?.value
  } catch (error) {
    console.log(error)
  }
}

// 查询自定义规则项
async function queryCustomRules() {
  try {
    const result: { [key: string]: any } = await api.get('system/setting/CustomFilterRules')
    customRules.value = result.data?.value ?? []
  } catch (error) {
    console.log(error)
  }
}

// 保存种子优先规则
async function saveTorrentPriority() {
  try {
    const result: { [key: string]: any } = await api.post(
      'system/setting/TorrentsPriority',
      selectedTorrentPriority.value,
    )
    if (result.success) $toast.success('优先规则保存成功')
    else $toast.error('优先规则保存失败！')
  } catch (error) {
    console.log(error)
  }
}

// 加载数据
onMounted(() => {
  loadMediaCategories()
  queryCustomRules()
  queryFilterRuleGroups()
  queryTorrentPriority()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardItem>
          <VCardTitle>自定义规则</VCardTitle>
          <VCardSubtitle>自定义优先级规则项</VCardSubtitle>
        </VCardItem>
        <VCardText>
          <draggable
            v-model="customRules"
            handle=".cursor-move"
            item-key="name"
            tag="div"
            :component-data="{ 'class': 'grid gap-3 grid-customrule-card' }"
          >
            <template #item="{ element }">
              <CustomerRuleCard
                :rule="element"
                :rules="customRules"
                @close="removeCustomRule(element)"
                @change="onRuleChange"
              />
            </template>
          </draggable>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="() => {}">
            <div class="d-flex flex-wrap gap-4 mt-4">
              <VBtn type="submit" class="me-2" @click="saveCustomRules"> 保存 </VBtn>
              <VBtnGroup density="comfortable">
                <VBtn color="success" variant="tonal" @click="addCustomRule">
                  <VIcon icon="mdi-plus" />
                </VBtn>
                <VBtn color="primary" variant="tonal" @click="importRules('custom')">
                  <VIcon icon="mdi-import" />
                </VBtn>
                <VBtn color="info" variant="tonal" @click="shareRules(customRules, 'custom')">
                  <VIcon icon="mdi-share" />
                </VBtn>
                <VBtn color="error" variant="tonal" @click="deleteAllRules('custom')">
                  <VIcon icon="mdi-delete" />
                </VBtn>
              </VBtnGroup>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardItem>
          <VCardTitle>优先级规则组</VCardTitle>
          <VCardSubtitle>预设优先级规则组，以便在搜索和订阅中使用。</VCardSubtitle>
        </VCardItem>
        <VCardText>
          <draggable
            v-model="filterRuleGroups"
            handle=".cursor-move"
            item-key="name"
            tag="div"
            :component-data="{ 'class': 'grid gap-3 grid-app-card' }"
          >
            <template #item="{ element }">
              <FilterRuleGroupCard
                :group="element"
                :groups="filterRuleGroups"
                :custom_rules="customRules"
                :categories="mediaCategories"
                @close="removeFilterRuleGroup(element)"
                @change="changeRuleGroup"
              />
            </template>
          </draggable>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="() => {}">
            <div class="d-flex flex-wrap gap-4 mt-4">
              <VBtn type="submit" class="me-2" @click="saveFilterRuleGroups"> 保存 </VBtn>
              <VBtnGroup density="comfortable">
                <VBtn color="success" variant="tonal" @click="addFilterRuleGroup">
                  <VIcon icon="mdi-plus" />
                </VBtn>
                <VBtn color="primary" variant="tonal" @click="importRules('group')">
                  <VIcon icon="mdi-import" />
                </VBtn>
                <VBtn color="info" variant="tonal" @click="shareRules(filterRuleGroups, 'group')">
                  <VIcon icon="mdi-share" />
                </VBtn>
                <VBtn color="error" variant="tonal" @click="deleteAllRules('group')">
                  <VIcon icon="mdi-delete" />
                </VBtn>
              </VBtnGroup>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <ImportCodeDialog
    v-if="importCodeDialog"
    v-model="importCodeDialog"
    :title="`导入${importCodeType === 'custom' ? '自定义规则' : '优先级规则组'}`"
    :dataType="importCodeType"
    @close="importCodeDialog = false"
    @save="saveCodeString"
  />
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardItem>
          <VCardTitle>下载规则</VCardTitle>
          <VCardSubtitle>同时命中多个资源时择优下载。</VCardSubtitle>
        </VCardItem>
        <VCardText>
          <VForm>
            <VRow>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="selectedTorrentPriority"
                  :items="TorrentPriorityItems"
                  multiple
                  clearable
                  chips
                  label="当前使用下载优先规则"
                  hint="排在前面的优先级越高，未选择的项不纳入排序"
                  persistent-hint
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="() => {}">
            <div class="d-flex flex-wrap gap-4 mt-4">
              <VBtn type="submit" @click="saveTorrentPriority"> 保存 </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
