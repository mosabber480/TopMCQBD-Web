import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SERVICES = [
  {
    name: 'TopMCQBD Paid API',
    url: 'https://topmcqbd-paid-api.onrender.com/status',
  },
  {
    name: 'TopMCQBD Free API',
    url: 'https://topmcqbd-free-api.onrender.com/status',
  },
];

export async function GET() {
  const startTime = Date.now();

  const pingResults = await Promise.allSettled(
    SERVICES.map(async (service) => {
      const pingStart = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(service.url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'TopMCQBD-KeepAlive/2.0',
          },
          cache: 'no-store',
        });
        clearTimeout(timeoutId);

        const latency = Date.now() - pingStart;
        return {
          name: service.name,
          url: service.url,
          status: res.ok || res.status < 500 ? 'online' : 'degraded',
          statusCode: res.status,
          latency: `${latency}ms`,
        };
      } catch (err) {
        return {
          name: service.name,
          url: service.url,
          status: 'reachable_or_waking',
          statusCode: null,
          error: err.name === 'AbortError' ? 'Timeout (Waking up)' : err.message,
          latency: `${Date.now() - pingStart}ms`,
        };
      }
    })
  );

  const formattedResults = pingResults.map((r, index) => {
    if (r.status === 'fulfilled') {
      return r.value;
    }
    return {
      name: SERVICES[index].name,
      url: SERVICES[index].url,
      status: 'error',
      error: r.reason?.message || 'Unknown error',
    };
  });

  return NextResponse.json(
    {
      status: 'active',
      message: 'MCQ Engine & Render Backends are Fully Charged!',
      totalDuration: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
      services: formattedResults,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
