<template>
  <view>
    <VirtualList :items="items" :height="300" :buffer="100" @itemsChange="itemsChange">
      <view class="virtual-item" v-for="item in virtualItems" :key="item.y" :style="{ height: `${item.height}px` }">
        <button @tap="checked(item)">{{ item.checked }}</button>
        {{ item.id }}
      </view>
    </VirtualList>
    {{ items.length }}
    <button @tap="deleted">删除</button>
  </view>
</template>

<script setup lang="ts">
import VirtualList from './virtual-list/virtual-list.vue';
import type { VirtualScrollItemRaw, VirtualScrollItem } from './virtual-list/controller'
import { ref } from 'vue';

const items = ref(Array.from({ length: 2000 }, (_, index) => ({ id: index, height: getRandom(40, 120), checked: false } as VirtualScrollItemRaw)))

const virtualItems = ref<VirtualScrollItem[]>([])

function itemsChange(items: VirtualScrollItem[]) {
  virtualItems.value = items
}

function checked(item: VirtualScrollItem) {
  const index = virtualItems.value.findIndex(v => v.index === item.index)
  if (index > -1) {
    virtualItems.value[index].checked = !virtualItems.value[index].checked
  }
}

function deleted() {
  const deletedItems = [...items.value]
  for (let i = deletedItems.length - 1; i >= 0; i--) {
    const item = deletedItems[i]
    if (item.checked) {
      deletedItems.splice(item.index, 1)
    }
  }
  items.value = deletedItems
}

function getRandom(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

</script>

<style scoped>
.virtual-item {
  display: flex;
  box-sizing: border-box;
  border-bottom: 1px solid;
  background-color: blanchedalmond;
}
</style>