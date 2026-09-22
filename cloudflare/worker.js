export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, Cache-Control, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. Health check
      if (path === '/' || path === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          service: 'sahngliu-prd-api',
          time: new Date().toISOString()
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 2. GET /api/prd/list - 列表
      if (request.method === 'GET' && (path === '/api/prd/list' || path === '/api/prd/list/')) {
        const query = await env.DB.prepare('SELECT id, updated_at FROM sahngliu_prd ORDER BY updated_at DESC').all();
        return new Response(JSON.stringify({ success: true, list: query.results || [] }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 3. GET /api/prd/:docId - 公开只读
      if (request.method === 'GET' && path.startsWith('/api/prd/')) {
        const docId = decodeURIComponent(path.replace('/api/prd/', '')).trim();
        if (!docId) {
          return new Response(JSON.stringify({ error: 'Missing docId' }), { status: 400, headers: corsHeaders });
        }

        const query = await env.DB.prepare('SELECT id, data, updated_at FROM sahngliu_prd WHERE id = ?').bind(docId).first();
        if (!query) {
          return new Response(JSON.stringify({ id: docId, data: null }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        let parsedData = null;
        try {
          parsedData = typeof query.data === 'string' ? JSON.parse(query.data) : query.data;
        } catch (e) {
          parsedData = query.data;
        }

        return new Response(JSON.stringify({
          id: query.id,
          data: parsedData,
          updated_at: query.updated_at
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 4. POST /api/prd/:docId - 管理写入 (需鉴权)
      if (request.method === 'POST' && path.startsWith('/api/prd/')) {
        const docId = decodeURIComponent(path.replace('/api/prd/', '')).trim();
        if (!docId) {
          return new Response(JSON.stringify({ error: 'Missing docId' }), { status: 400, headers: corsHeaders });
        }

        // 鉴权校验
        const authHeader = request.headers.get('Authorization') || request.headers.get('apikey') || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        const expectedSecret = (env.PRD_ADMIN_SECRET || '').trim();

        if (!token || !expectedSecret || token !== expectedSecret) {
          return new Response(JSON.stringify({
            error: '401 Unauthorized',
            message: '管理员密钥无效或未提供，禁止修改打点数据'
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const body = await request.json();
        const rawPayload = body.data !== undefined ? body.data : body;
        const dataStr = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);

        await env.DB.prepare(`
          INSERT INTO sahngliu_prd (id, data, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
        `).bind(docId, dataStr).run();

        return new Response(JSON.stringify({
          success: true,
          id: docId,
          message: '打点数据保存成功'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
