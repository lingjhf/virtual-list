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
    this.setItems(options.items)
  }

  private _buffer = 10;

  private _viewHeight = 0;

  private _totalHeight = 0;

  private _scrollDirection = 0;

  private _scrollTop = 0;

  private _startIndex = -1;

  private _endIndex = -1;

  private _items: VirtualScrollItem[] = [];

  private _virtualItems: VirtualScrollItem[] = [];

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

  setItems(items: VirtualScrollItemRaw[]): this {
    this._items = this._generateItems(items)
    const lastItem = this.getLastItem();
    if (lastItem) {
      this._totalHeight = lastItem.y + lastItem.height;
    }
    return this
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

  private _resetVirtualItems() {
    if (this._startIndex === -1) {
      this._startIndex = this._findStartIndex(this._items, 0, this._items.length - 1);
      if (this._startIndex === -1) return;
    }
    if (this._endIndex === -1) {
      this._endIndex = this._findEndIndex(this._startIndex);
      if (this._endIndex === -1) return;
    }
    const [boundaryStartIndex, boundaryEndIndex] = getExtendRange(0, this._items.length - 1, this._startIndex, this._endIndex, this._buffer / 2)
    const boundaryStartItem = this._items[boundaryStartIndex]
    const boundaryEndItem = this._items[boundaryEndIndex]
    if (this._virtualItems.length === 0 || boundaryStartItem.y > this._scrollTop || boundaryEndItem.y + boundaryEndItem.height < this._scrollTop + this._viewHeight) {
      this._startIndex = this._findStartIndex(this._virtualItems, 0, this._items.length - 1)
      if (this._startIndex === -1) return;
      this._endIndex = this._findEndIndex(this._startIndex);
      if (this._endIndex === -1) return;
      const [startIndex, endIndex] = getExtendRange(0, this._items.length - 1, this._startIndex, this._endIndex, this._buffer)
      this._virtualItems = this._items.slice(startIndex, endIndex + 1)
    }
  }

  private _generateItems(items: VirtualScrollItemRaw[]): VirtualScrollItem[] {
    let totalHeight = 0;
    const vItems: VirtualScrollItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item['index'] = i
      item['y'] = totalHeight
      vItems.push(item as VirtualScrollItem);
      totalHeight += item.height;
    }
    return vItems;
  }

  private _findStartIndex(items: VirtualScrollItem[], startIndex: number, endIndex: number): number {
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
      return this._findStartIndex(items, startIndex, middleIndex - 1);
    }
    if (this._scrollTop >= middleItemSum) {
      return this._findStartIndex(items, middleIndex + 1, endIndex);
    }
    if (middleItem.y <= this._scrollTop && middleItemSum > this.scrollTop) {
      return middleIndex;
    }
    return -1;
  }

  private _findEndIndex(startIndex: number): number {
    for (let i = startIndex; i < this._items.length; i++) {
      const item = this._items[i];
      if (item.y + item.height >= this._scrollTop + this._viewHeight) {
        return item.index
      }
    }
    return -1
  }
}


function getExtendRange(min: number, max: number, startIndex: number, endIndex: number, buffer: number): [startIndex: number, endIndex: number] {
  let bufferStartIndex = startIndex - buffer
  let bufferEndIndex = endIndex + buffer
  if (bufferStartIndex < min) {
    bufferEndIndex += Math.abs(bufferStartIndex - min)
    if (bufferEndIndex > max) {
      bufferEndIndex = max
    }
    bufferStartIndex = min
  }
  if (bufferEndIndex > max) {
    bufferStartIndex -= Math.abs(bufferEndIndex - max)
    if (bufferStartIndex < min) {
      bufferStartIndex = min
    }
    bufferEndIndex = max
  }

  return [bufferStartIndex, bufferEndIndex]
}