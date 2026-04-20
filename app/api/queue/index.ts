export class FetchQueue {
  maxSimultaneous: number;
  running: number;
  queue: any[];

  constructor(maxSimultaneous = 10) {
    this.maxSimultaneous = maxSimultaneous;
    this.running = 0;
    this.queue = [];
  }

  async fetch(url, options?) {
    if (this.running >= this.maxSimultaneous) {
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.running++;
    
    try {
      return await window.fetch(url, options);
    } finally {
      this.running--;
      
      if (this.queue.length > 0) {
        const nextInLine = this.queue.shift();
        nextInLine();
      }
    }
  }

  static instance: FetchQueue;
  static getInstance() {
    if (!FetchQueue.instance) {
      FetchQueue.instance = new FetchQueue();
    }
    return FetchQueue.instance;
  }
}