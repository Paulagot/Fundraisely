export async function checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', { method: 'GET' });
      if (!response.ok) {
        console.error('Health check failed:', response.status);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Server unreachable:', error);
      return false;
    }
  }
  