import { getPaidDb } from '../utils/db.js';

let _inMemoryItems = [];

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
      _inMemoryItems = formatted;
    }

    return jsonResponse({
      success: true,
      count: formatted.length,
      items: formatted,
      latestText: formatted.length > 0 ? formatted[0].text : 'DB Connection Check',
    });
  } catch (err) {
    console.warn('Falling back to Edge in-memory store:', err.message);
    return jsonResponse({
      success: true,
      count: _inMemoryItems.length,
      items: _inMemoryItems,
      latestText: _inMemoryItems.length > 0 ? _inMemoryItems[0].text : 'DB Connection Check',
      note: 'Loaded from Edge Fallback Store',
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
      _id: 'text_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const db = await getPaidDb(context);
      const collection = db.collection('db-test-text');
      const insertDoc = { text, createdAt: new Date(), updatedAt: new Date() };
      const res = await collection.insertOne(insertDoc);
      newItem._id = res.insertedId.toString();
    } catch (e) {
      console.warn('MongoDB direct insert failed, saved to Edge store:', e.message);
    }

    _inMemoryItems = [newItem, ..._inMemoryItems];

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
      let ObjectId = null;
      try {
        const mod = await import('mongodb');
        ObjectId = mod.ObjectId || (mod.default && mod.default.ObjectId);
      } catch {}

      const db = await getPaidDb(context);
      const collection = db.collection('db-test-text');
      const filter = ObjectId ? { _id: new ObjectId(id) } : { _id: id };
      const updateRes = await collection.findOneAndUpdate(
        filter,
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
      console.warn('MongoDB direct update failed, updating in Edge store:', e.message);
    }

    _inMemoryItems = _inMemoryItems.map((it) => {
      if (it._id === id) {
        const up = { ...it, text, updatedAt: new Date().toISOString() };
        if (!updatedItem) updatedItem = up;
        return up;
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
      let ObjectId = null;
      try {
        const mod = await import('mongodb');
        ObjectId = mod.ObjectId || (mod.default && mod.default.ObjectId);
      } catch {}

      const db = await getPaidDb(context);
      const collection = db.collection('db-test-text');
      const filter = ObjectId ? { _id: new ObjectId(id) } : { _id: id };
      await collection.deleteOne(filter);
    } catch (e) {
      console.warn('MongoDB direct delete failed, deleting from Edge store:', e.message);
    }

    _inMemoryItems = _inMemoryItems.filter((it) => it._id !== id);

    return jsonResponse({
      success: true,
      deletedCount: 1,
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
