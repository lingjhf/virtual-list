<template>
  <view>
    <VirtualList :items="items" :height="300" :buffer="100" @itemsChange="itemsChange">
      <view class="virtual-item" v-for="item in virtualItems" :key="item.y" :style="{ height: `${item.height}px` }">
        <button @tap="checked">{{ item.checked }}</button>

        {{ item.index }}
      </view>
    </VirtualList>
    <button @tap="deleted">删除</button>
  </view>
</template>

<script setup lang="ts">
import VirtualList from './virtual-list/virtual-list.vue';
import type { VirtualScrollItem } from './virtual-list/controller'
import { ref } from 'vue';

const items = ref(Array.from({ length: 2000 }, (_, index) => ({ index, height: 40, y: 0, checked: false } as VirtualScrollItem)))

const virtualItems = ref<VirtualScrollItem[]>([])

function itemsChange(items: VirtualScrollItem[]) {
  virtualItems.value = items
}

function checked() {

}

function deleted(index: number) {

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