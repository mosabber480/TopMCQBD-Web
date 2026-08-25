import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import dns from 'dns';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const getFreeDb = async () => {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {}

  const uri = process.env.MONGODB_URI_FREE;
  const dbName = process.env.MONGODB_DB_NAME_FREE || 'TopMCQBD_DB_Free';

  if (!uri) {
    throw new Error('MONGODB_URI_FREE environment variable is not defined.');
  }

  const client = new MongoClient(uri, {
    connectTimeoutMS: 6000,
    serverSelectionTimeoutMS: 6000,
  });
  await client.connect();
  return { client, db: client.db(dbName) };
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// GET: Fetch status and all items from db-free-test
export async function GET() {
  let client;
  const start = Date.now();
  try {
    const connection = await getFreeDb();
    client = connection.client;
    const db = connection.db;

    await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const items = await db
      .collection('db-free-test')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedItems = items.map((doc) => ({
      id: doc._id.toString(),
      text: doc.text || '',
      createdAt: doc.createdAt || null,
      updatedAt: doc.updatedAt || null,
    }));

    return NextResponse.json(
      {
        success: true,
        cluster: 'TopMCQBD_DB_Free',
        collection: 'db-free-test',
        connected: true,
        latencyMs: Date.now() - start,
        collections: collectionNames,
        totalItems: formattedItems.length,
        items: formattedItems,
        timestamp: new Date().toISOString(),
      },
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        cluster: 'TopMCQBD_DB_Free',
        collection: 'db-free-test',
        connected: false,
        error: err.message || String(err),
        latencyMs: Date.now() - start,
        items: [],
      },
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (e) {}
    }
  }
}

// POST: Add new text item to db-free-test
export async function POST(req) {
  let client;
  try {
    const body = await req.json();
    const text = (body.text || '').trim();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'টেক্সট ফিল্ড খালি রাখা যাবে না।' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const connection = await getFreeDb();
    client = connection.client;
    const db = connection.db;

    const newDoc = {
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const insertResult = await db.collection('db-free-test').insertOne(newDoc);

    return NextResponse.json(
      {
        success: true,
        message: 'ডাটা সফলভাবে db-free-test কালেকশনে যুক্ত হয়েছে।',
        item: {
          id: insertResult.insertedId.toString(),
          ...newDoc,
        },
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500, headers: CORS_HEADERS }
    );
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (e) {}
    }
  }
}

// PUT: Edit existing item in db-free-test
export async function PUT(req) {
  let client;
  try {
    const body = await req.json();
    const id = body.id || body._id;
    const text = (body.text || '').trim();

    if (!id || !text) {
      return NextResponse.json(
        { success: false, error: 'ID এবং টেক্সট উভয়েই আবশ্যক।' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const connection = await getFreeDb();
    client = connection.client;
    const db = connection.db;

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const updateResult = await db.collection('db-free-test').updateOne(filter, {
      $set: {
        text,
        updatedAt: new Date().toISOString(),
      },
    });

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'কোনো তথ্য পাওয়া যায়নি।' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'ডাটা সফলভাবে আপডেট করা হয়েছে।',
        updatedId: id,
        text,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500, headers: CORS_HEADERS }
    );
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (e) {}
    }
  }
}

// DELETE: Delete item from db-free-test
export async function DELETE(req) {
  let client;
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id || body?._id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'মুছে ফেলার জন্য ID প্রদান করুন।' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const connection = await getFreeDb();
    client = connection.client;
    const db = connection.db;

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const delResult = await db.collection('db-free-test').deleteOne(filter);

    if (delResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'মুছে ফেলার জন্য ডাটা পাওয়া যায়নি।' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'ডাটা সফলভাবে মুছে ফেলা হয়েছে।',
        deletedId: id,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500, headers: CORS_HEADERS }
    );
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (e) {}
    }
  }
}
