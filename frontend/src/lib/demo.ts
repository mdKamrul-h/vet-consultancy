export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const DEMO_TOKEN = 'demo-token-pawpet';

export function demoDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mockResponse<T>(data: T) {
  return Promise.resolve({
    data: { success: true, data },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  });
}
