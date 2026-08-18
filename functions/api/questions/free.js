import { getFreeDb, getPaidCollections } from '../../utils/db.js';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
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

  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const limit = parseInt(url.searchParams.get('limit') || '0', 10);

  try {
    const { db: freeDb, error } = await getFreeDb(context);
    if (freeDb && !error) {
      const questionsCol = freeDb.collection('questions');
      const query = {};
      if (category && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i') };
      }
      let cursor = questionsCol.find(query).sort({ _id: -1 });
      if (limit > 0) cursor = cursor.limit(limit);
      const list = await cursor.toArray();

      return jsonResponse({
        success: true,
        source: 'Free MongoDB Cluster',
        questions: list,
        mcqs: list,
        total: list.length
      });
    }

    // Fallback to paid DB questions
    const { questions: paidQuestions } = await getPaidCollections(context);
    if (paidQuestions) {
      let cursor = paidQuestions.find({}).sort({ _id: -1 });
      if (limit > 0) cursor = cursor.limit(limit);
      const list = await cursor.toArray();
      return jsonResponse({
        success: true,
        source: 'Primary DB (Fallback)',
        questions: list,
        mcqs: list,
        total: list.length
      });
    }

    return jsonResponse({
      success: true,
      source: 'Default',
      questions: [],
      mcqs: [],
      total: 0
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.message || 'Error fetching free questions'
    }, 500);
  }
}
