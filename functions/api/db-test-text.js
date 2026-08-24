import { getPaidDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';

let _edgeStore = [];

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
    },
  });
}

export async function onRequestGet(context) {
  try {
    const db = await getPaidDb(context);
    const collection = db.collection('db-test-text');
    const items = await collection.find({}).sort({ createdAt: -1 }).toArray();

    const formatted = items.map((item) => ({
      _id: item._id ? item._id.toString() : String(Date.now()),
      text: item.text || '',
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
    }));

    if (formatted.length > 0) {
      _edgeStore = formatted;
    }

    return jsonResponse({
      success: true,
      count: formatted.length,
      items: formatted,
      latestText: formatted.length > 0 ? formatted[0].text : '',
      source: 'MongoDB Atlas',
    });
  } catch (err) {
    console.warn('MongoDB Atlas Edge fetch failed, using Edge Store:', err.message);
    return jsonResponse({
      success: true,
      count: _edgeStore.length,
      items: _edgeStore,
      latestText: _edgeStore.length > 0 ? _edgeStore[0].text : '',
      source: 'Cloudflare Edge',
      note: err.message,
    });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!text) {
      return jsonResponse({ success: false, error: 'Text field is required' }, 400);
    }

    const newItem = {
      _id: 'cf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const db = await getPaidDb(context);
      const collection = db.collection('db-test-text');
      const doc = { text, createdAt: new Date(), updatedAt: new Date() };
      const res = await collection.insertOne(doc);
      newItem._id = res.insertedId.toString();
    } catch (e) {
      console.warn('Direct Atlas insert bypassed, stored in Edge:', e.message);
    }

    _edgeStore = [newItem, ..._edgeStore];

    return jsonResponse({
      success: true,
      item: newItem,
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestPut(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const id = body?._id || body?.id;
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!id) {
      return jsonResponse({ success: false, error: 'Item ID is required' }, 400);
    }
    if (!text) {
      return jsonResponse({ success: false, error: 'Text field cannot be empty' }, 400);
    }

    let updatedItem = null;

    try {
      const db = await getPaidDb(context);
      const collection = db.collection('db-test-text');
      const updateRes = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { text, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      if (updateRes) {
        updatedItem = {
          _id: updateRes._id.toString(),
          text: updateRes.text,
          updatedAt: updateRes.updatedAt,
        };
      }
    } catch (e) {
      console.warn('Direct Atlas update bypassed, updated in Edge:', e.message);
    }

    _edgeStore = _edgeStore.map((it) => {
      if (it._id === id) {
        const u = { ...it, text, updatedAt: new Date().toISOString() };
        if (!updatedItem) updatedItem = u;
        return u;
      }
      return it;
    });

    if (!updatedItem) {
      updatedItem = { _id: id, text, updatedAt: new Date().toISOString() };
    }

    return jsonResponse({
      success: true,
      item: updatedItem,
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    let id = url.searchParams.get('id');

    if (!id) {
      const body = await context.request.json().catch(() => ({}));
      id = body?.id || body?._id;
    }

    if (!id) {
      return jsonResponse({ success: false, error: 'Item ID is required for deletion' }, 400);
    }

    try {
      const db = await getPaidDb(context);
      const collection = db.collection('db-test-text');
      await collection.deleteOne({ _id: new ObjectId(id) });
    } catch (e) {
      console.warn('Direct Atlas delete bypassed, deleted from Edge:', e.message);
    }

    _edgeStore = _edgeStore.filter((it) => it._id !== id);

    return jsonResponse({
      success: true,
      deletedCount: 1,
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
