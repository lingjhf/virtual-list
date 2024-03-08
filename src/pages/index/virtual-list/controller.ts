export interface VirtualScrollItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  index: number;
  y: number;
  height: number;
}

export interface VirtualScrollItemRaw {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  height: number;
}

export interface VirtualScrollOptions {
  items: VirtualScrollItemRaw[];
  viewHeight: number;
  scrollTop?: number;
  buffer?: number;
}

export class VirtualScroll {
  constructor(options: VirtualScrollOptions) {
    this.setScrollTop(options.scrollTop ?? 0);
    this.setViewHeight(options.viewHeight);
    this.setBuffer(options.buffer ?? 0);
    this._items = this._generateItems(options.items);
    const lastItem = this.getLastItem();
    if (lastItem) {
      this._totalHeight = lastItem.y + lastItem.height;
    }
  }

  private _buffer = 0;

  private _viewHeight = 0;

  private _totalHeight = 0;

  private _scrollDirection = 0;

  private _scrollTop = 0;

  private _startIndex = 0;

  private _endIndex = 0;

  private _items: VirtualScrollItem[] = [];

  private _virtualItems: VirtualScrollItem[] = [];

  private _beforeBufferItems: VirtualScrollItem[] = [];

  private _afterBufferItems: VirtualScrollItem[] = [];

  get buffer(): number {
    return this._buffer;
  }

  get viewHeight(): number {
    return this._viewHeight;
  }

  get totalHeight(): number {
    return this._totalHeight;
  }

  get scrollTop(): number {
    return this._scrollTop;
  }

  get startIndex(): number {
    return this._startIndex;
  }

  get endIndex(): number {
    return this._endIndex;
  }

  getFirstItem(): VirtualScrollItem | undefined {
    if (this._items.length > 0) {
      return this._items[0];
    }
    return;
  }

  getLastItem(): VirtualScrollItem | undefined {
    if (this._items.length > 0) {
      return this._items[this._items.length - 1];
    }
    return;
  }

  get items(): VirtualScrollItem[] {
    return this._items;
  }

  get virtualItems(): VirtualScrollItem[] {
    this._resetVirtualItems();
    return this._virtualItems;
  }

  setBuffer(value: number): this {
    if (value < 0) {
      return this;
    }
    this._buffer = value;
    return this;
  }

  setViewHeight(value: number): this {
    if (value < 0) {
      return this;
    }
    this._viewHeight = value;
    return this;
  }

  setScrollTop(value: number): this {
    if (value < 0) {
      return this;
    }
    this._scrollDirection = value - this._scrollTop;
    this._scrollTop = value;
    return this;
  }

  private _isRenderBeforeBufferItems() {
    if (this._beforeBufferItems.length > 0) {
      const item = this._beforeBufferItems[this._beforeBufferItems.length];
      if (item && !(item.y + item.height > this._scrollTop)) {
        return false;
      }
    }
    return true;
  }

  private _isRenderAfterBufferItems() {
    if (this._afterBufferItems.length > 0) {
      const item = this._afterBufferItems[this._afterBufferItems.length];
      if (item && !(item.y < this._scrollTop + this._viewHeight)) {
        return false;
      }
    }
    return true;
  }

  private _resetVirtualItems() {
    this._startIndex = this.findStartIndex(0, this._items.length - 1);
    if (this._startIndex === -1) return [];
    const viewItems = this._generateViewItems(this._startIndex);
    this._endIndex = this._startIndex + viewItems.length - 1;
    const isReset =
      this._scrollDirection > 0
        ? this._isRenderAfterBufferItems()
        : this._isRenderBeforeBufferItems();
    if (isReset) {
      this._afterBufferItems = this._generateAfterBufferItems(this._endIndex);
      this._beforeBufferItems = this._generateBeforeBufferItems(
        this._startIndex
      );
      this._virtualItems = [
        ...this._beforeBufferItems,
        ...viewItems,
        ...this._afterBufferItems,
      ];
    }
  }

  private _generateItems(items: VirtualScrollItemRaw[]): VirtualScrollItem[] {
    let totalHeight = 0;
    const vItems: VirtualScrollItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      vItems.push({ ...item, index: i, y: totalHeight });
      totalHeight += item.height;
    }
    return vItems;
  }

  private _generateBeforeBufferItems(startIndex: number): VirtualScrollItem[] {
    if (startIndex > 0) {
      const startBuffer = startIndex - this._buffer;
      return this._items.slice(startBuffer < 0 ? 0 : startBuffer, startIndex);
    }
    return [];
  }

  private _generateAfterBufferItems(endIndex: number): VirtualScrollItem[] {
    if (endIndex < this._items.length - 1) {
      const bufferStartIndex = endIndex + 1;
      const bufferEndIndex = bufferStartIndex + this._buffer;
      return this._items.slice(bufferStartIndex, bufferEndIndex);
    }
    return [];
  }

  private _generateViewItems(startIndex: number): VirtualScrollItem[] {
    const items: VirtualScrollItem[] = [];
    for (let i = startIndex; i < this._items.length; i++) {
      const item = this._items[i];
      items.push(item);
      if (item.y + item.height >= this._scrollTop + this._viewHeight) {
        break;
      }
    }
    return items;
  }

  private findStartIndex(startIndex: number, endIndex: number): number {
    if (startIndex > endIndex) {
      return -1;
    }
    const middleIndex = Math.floor((startIndex + endIndex) / 2);
    const middleItem = this._items[middleIndex];
    const viewSum = this._scrollTop + this._viewHeight;
    const middleItemSum = middleItem.y + middleItem.height;
    if (
      viewSum < middleItem.y ||
      (middleItem.y > this._scrollTop && viewSum >= middleItemSum) ||
      (middleItem.y > this._scrollTop && middleItemSum > viewSum)
    ) {
      return this.findStartIndex(startIndex, middleIndex - 1);
    }
    if (this._scrollTop >= middleItemSum) {
      return this.findStartIndex(middleIndex + 1, endIndex);
    }
    if (middleItem.y <= this._scrollTop && middleItemSum > this.scrollTop) {
      return middleIndex;
    }
    return -1;
  }
}
