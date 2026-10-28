/**
 * MinHeap Priority Queue implementation from scratch.
 * Time Complexities:
 *   - Insertion (push): O(log N)
 *   - Extraction (pop / extractMin): O(log N)
 *   - Peek: O(1)
 *   - Size / isEmpty: O(1)
 */
export class MinHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }

  /**
   * Push an item into the priority queue.
   * @param {*} element - The identifier or object stored (e.g. nodeId)
   * @param {number} priority - The numeric priority (lower value = higher priority)
   * @param {object} [metadata] - Optional additional info (gCost, hCost, parent, etc.)
   */
  push(element, priority, metadata = {}) {
    const item = { element, priority, metadata, insertedAt: Date.now() };
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  /**
   * Remove and return the item with the lowest priority value.
   * @returns {{ element: *, priority: number, metadata: object } | null}
   */
  pop() {
    if (this.isEmpty()) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._bubbleDown(0);
    return min;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[index].priority < this.heap[parentIdx].priority) {
        this._swap(index, parentIdx);
        index = parentIdx;
      } else {
        break;
      }
    }
  }

  _bubbleDown(index) {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }

      if (rightChild < length && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        this._swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Returns a clean snapshot of queue contents for trace / UI display,
   * sorted by priority.
   */
  getSnapshot() {
    return [...this.heap]
      .sort((a, b) => a.priority - b.priority)
      .map(item => ({
        element: item.element,
        priority: Number(item.priority.toFixed(2)),
        ...item.metadata
      }));
  }
}

