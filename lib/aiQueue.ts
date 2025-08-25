// AI Request Queue to prevent API overload
interface QueueItem {
  request: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  priority: number;
}

class AIRequestQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private maxConcurrent = 2; // Conservative limit
  private currentRequests = 0;
  private requestDelay = 1000; // 1 second between requests

  async add<T>(
    request: () => Promise<T>, 
    priority: number = 1
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ 
        request: request as () => Promise<unknown>, 
        resolve: resolve as (value: unknown) => void, 
        reject, 
        priority 
      });
      // Sort by priority (higher number = higher priority)
      this.queue.sort((a, b) => b.priority - a.priority);
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.currentRequests >= this.maxConcurrent) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0 && this.currentRequests < this.maxConcurrent) {
      const item = this.queue.shift()!;
      this.currentRequests++;
      
      // Add delay between requests
      if (this.currentRequests > 1) {
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
      }
      
      this.executeRequest(item);
    }
    
    this.processing = false;
  }

  private async executeRequest(item: QueueItem) {
    try {
      const result = await item.request();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.currentRequests--;
      // Continue processing queue
      setTimeout(() => this.process(), 100);
    }
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getCurrentRequests(): number {
    return this.currentRequests;
  }
}

export const aiQueue = new AIRequestQueue();
