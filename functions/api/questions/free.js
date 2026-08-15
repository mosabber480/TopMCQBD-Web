import { getFreeDb } from '../../utils/db.js';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function onRequest(context) {
  const { request } = context;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  if (method === 'GET') {
    try {
      const url = new URL(request.url);
      const category = url.searchParams.get('category');
      const limit = parseInt(url.searchParams.get('limit') || '0', 10);

      const db = await getFreeDb(context);
      let filter = {};

      if (category && category !== 'all' && category !== 'All') {
        const trimmed = category.trim();
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.category = { $regex: `^${escaped}((\\s*>\\s*)|(/|$))`, $options: 'i' };
      }

      let questions = [];
      try {
        let cursor = db.collection('questions').find(filter).sort({ _id: -1 });
        if (limit > 0) cursor = cursor.limit(limit);
        questions = await cursor.toArray();
      } catch (e) {}

      if (questions.length === 0) {
        try {
          let cursor2 = db.collection('examssolvedtest').find(filter).sort({ _id: -1 });
          if (limit > 0) cursor2 = cursor2.limit(limit);
          questions = await cursor2.toArray();
        } catch (e) {}
      }

      return jsonResponse({
        success: true,
        source: 'Free MongoDB Cluster',
        questions,
        mcqs: questions,
        total: questions.length
      });
    } catch (err) {
      console.error('FREE QUESTIONS API ERROR:', err);
      return jsonResponse({ success: false, error: err.message }, 500);
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}
