// Simple performance monitoring utility
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      }
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverageMetric(label: string): number | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMetricSummary(label: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;
    
    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [label] of this.metrics) {
      const summary = this.getMetricSummary(label);
      if (summary) {
        result[label] = summary;
      }
    }
    
    return result;
  }

  logSummary(): void {
    if (process.env.NODE_ENV === 'development') {
      console.table(this.getAllMetrics());
    }
  }
}

export const perfMonitor = new PerformanceMonitor();

// Helper function to measure async operations
export async function measureAsync<T>(
  label: string, 
  operation: () => Promise<T>
): Promise<T> {
  const stopTimer = perfMonitor.startTimer(label);
  try {
    const result = await operation();
    return result;
  } finally {
    stopTimer();
  }
}
