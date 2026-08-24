import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin';

let _mongoClient = null;

async function getDb() {
  if (_mongoClient) {
    try {
      await _mongoClient.db('TopMCQBD_DB').command({ ping: 1 });
      return _mongoClient.db('TopMCQBD_DB');
    } catch {
      _mongoClient = null;
    }
  }

  const primaryUri = process.env.MONGODB_URI_PAID || 'mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority';
  const uris = [DIRECT_PAID_URI, primaryUri];

  let lastError = null;
  for (const uri of uris) {
    try {
      const client = new MongoClient(uri, {
        connectTimeoutMS: 8000,
        serverSelectionTimeoutMS: 8000,
        tls: true,
      });
      await client.connect();
      _mongoClient = client;
      return _mongoClient.db(process.env.MONGODB_DB_NAME_PAID || 'TopMCQBD_DB');
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`Failed to connect to TopMCQBD_DB: ${lastError?.message || 'Unknown error'}`);
}

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('db-test-text');
    const items = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      count: items.length,
      items: items.map((item) => ({
        _id: item._id.toString(),
        text: item.text || '',
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null,
      })),
      latestText: items.length > 0 ? items[0].text : 'DB Connection Check',
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      latestText: 'DB Connection Check',
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!text) {
      return NextResponse.json({ success: false, error: 'Text is required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('db-test-text');
    const doc = {
      text,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json({
      success: true,
      item: {
        _id: result.insertedId.toString(),
        text: doc.text,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body?._id || body?.id;
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!id || !text) {
      return NextResponse.json({ success: false, error: 'ID and Text are required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('db-test-text');

    const updateRes = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { text, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return NextResponse.json({
      success: true,
      item: updateRes ? {
        _id: updateRes._id.toString(),
        text: updateRes.text,
        updatedAt: updateRes.updatedAt,
      } : null,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id || body?._id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('db-test-text');
    const deleteRes = await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      deletedCount: deleteRes.deletedCount,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
