export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 处理 OPTIONS 跨域预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // 2. 目标业务 Worker 地址 (Cloudflare 内部骨干网毫秒互联)
    const targetOrigin = 'https://sahngliu-prd-api.barrykino00.workers.dev';
    const targetUrl = new URL(url.pathname + url.search, targetOrigin);

    // 3. 构建透明转发请求
    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set('Host', new URL(targetOrigin).hostname);

    const newRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'follow',
    });

    try {
      const response = await fetch(newRequest);
      // 4. 追加无限制 CORS 标头，保证无论哪种前端、本地还是线上调用均畅通
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      newHeaders.set('Access-Control-Allow-Headers', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (err) {
      return new Response(JSON.stringify({ code: 502, msg: 'API 网关转发异常: ' + err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
