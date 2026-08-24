import { getPaidDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';

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
      _id: item._id.toString(),
      text: item.text || '',
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
    }));

    return jsonResponse({
      success: true,
      count: formatted.length,
      items: formatted,
      latestText: formatted.length > 0 ? formatted[0].text : '',
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: `MongoDB query failed: ${err.message}`,
      items: [],
    }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!text) {
      return jsonResponse({ success: false, error: 'Text field is required' }, 400);
    }

    const db = await getPaidDb(context);
    const collection = db.collection('db-test-text');
    const doc = {
      text,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return jsonResponse({
      success: true,
      item: {
        _id: result.insertedId.toString(),
        text: doc.text,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    return jsonResponse({ success: false, error: `MongoDB insert failed: ${err.message}` }, 500);
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

    const db = await getPaidDb(context);
    const collection = db.collection('db-test-text');

    const updateRes = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { text, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return jsonResponse({
      success: true,
      item: updateRes ? {
        _id: updateRes._id.toString(),
        text: updateRes.text,
        updatedAt: updateRes.updatedAt,
      } : null,
    });
  } catch (err) {
    return jsonResponse({ success: false, error: `MongoDB update failed: ${err.message}` }, 500);
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

    const db = await getPaidDb(context);
    const collection = db.collection('db-test-text');
    const deleteRes = await collection.deleteOne({ _id: new ObjectId(id) });

    return jsonResponse({
      success: true,
      deletedCount: deleteRes.deletedCount,
    });
  } catch (err) {
    return jsonResponse({ success: false, error: `MongoDB delete failed: ${err.message}` }, 500);
  }
}
