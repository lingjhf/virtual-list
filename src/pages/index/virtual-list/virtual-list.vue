<template>
    <scroll-view class="virtual-list" scroll-y @scroll="scroll" :style="{ height: `${visualHeight}px` }">
        <view class="virtual-list-container" :style="{ height: `${totalHeight}px` }">
            <view class="virtual-item-container" :style="`transform: translateY(${contentTop}px)`">
                <slot></slot>
            </view>
        </view>
    </scroll-view>
    {{ totalHeight }}
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VirtualScroll, type VirtualScrollItem } from './controller'

const props = withDefaults(
    defineProps<{
        height: number
        items?: VirtualScrollItem[]
        buffer?: number
    }>(),
    {
        items: () => [],
        buffer: 0
    }
)

const emits = defineEmits<{
    (e: "itemsChange", items: VirtualScrollItem[]): void
}>()

let virtualScroll = new VirtualScroll({ items: [], viewHeight: props.height, buffer: 0 })
const visualHeight = ref(0)
const totalHeight = ref(0)
const contentTop = ref(0)

watch([() => props.items, () => props.height, () => props.buffer], () => {
    let items = virtualScroll.items
    let viewHeight = virtualScroll.viewHeight
    let buffer = virtualScroll.buffer
    if (props.items.length > 0) {
        items = props.items
    }
    if (props.height > 0 && props.height !== virtualScroll.viewHeight) {
        viewHeight = props.height
    }
    if (props.buffer >= 0 && props.buffer !== virtualScroll.buffer) {
        buffer = props.buffer
    }
    virtualScroll = new VirtualScroll({ items, viewHeight, buffer })
    visualHeight.value = virtualScroll.viewHeight
    totalHeight.value = virtualScroll.totalHeight
    emits('itemsChange', virtualScroll.virtualItems)
}, {
    immediate: true
})

function scroll(event: any) {
    const source = virtualScroll.virtualItems
    virtualScroll.setScrollTop(event.target.scrollTop)
    contentTop.value = virtualScroll.virtualItems[0].y
    const target = virtualScroll.virtualItems
    if (isVirtualItemsDiff(source, target)) {
        emits('itemsChange', virtualScroll.virtualItems)
    }
}


/**
* 判断两个VirtualScrollItems是否一样
* @param source 
* @param target 
* @returns 
*/
function isVirtualItemsDiff(source: VirtualScrollItem[], target: VirtualScrollItem[]): boolean {
    if (source.length === 0 && target.length === 0) {
        return false
    }
    if (source.length !== target.length) {
        return true
    }
    if (
        source[0].index === target[0].index
        &&
        source[source.length - 1].index === source[source.length - 1].index
    ) {
        return false
    }
    return true
}


</script>

<style>
.virtual-list {
    background-color: skyblue;
}

.virtual-list-container {
    position: relative;
}

.virtual-item-container {
    position: absolute;
    left: 0;
    right: 0;
}
</style>