import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getMongoDb, parseClusterHost, getDbConfig } from '../utils/db.js';
import { generateToken, verifyTokenFromRequest, addPlanDuration } from '../utils/auth.js';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
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
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
      }
    });
  }

  const url = new URL(request.url);
  const rawRoute = context.params?.route;
  const routeParts = Array.isArray(rawRoute)
    ? rawRoute
    : (rawRoute ? [rawRoute] : url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean));
  const route = routeParts.join('/');

  try {
    const db = await getMongoDb(context, 'paid');

    // 1. SIDEBAR CONFIG (/api/sidebar-config)
    if (route === 'sidebar-config') {
      if (method === 'GET') {
        const config = await db.collection('adminsidebarconfigs').findOne();
        return jsonResponse(config || { menus: [], headerButtons: [] });
      }
      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        delete body._id;
        await db.collection('adminsidebarconfigs').updateOne(
          {},
          { $set: { ...body, updatedAt: new Date() } },
          { upsert: true }
        );
        const updated = await db.collection('adminsidebarconfigs').findOne();
        return jsonResponse({ success: true, message: 'Sidebar config saved successfully!', config: updated });
      }
    }

    // 2. HOME CONFIG (/api/home-config)
    if (route === 'home-config') {
      if (method === 'GET') {
        const config = await db.collection('homeconfigs').findOne();
        return jsonResponse(config || {});
      }
      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        delete body._id;
        await db.collection('homeconfigs').updateOne(
          {},
          { $set: { ...body, updatedAt: new Date() } },
          { upsert: true }
        );
        const updated = await db.collection('homeconfigs').findOne();
        return jsonResponse({ success: true, message: 'Home config saved successfully!', config: updated });
      }
    }

    // 3. LAYOUT CONFIG (/api/layout-config)
    if (route === 'layout-config') {
      if (method === 'GET') {
        const config = await db.collection('layoutconfigs').findOne();
        return jsonResponse(config || {});
      }
      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        delete body._id;
        await db.collection('layoutconfigs').updateOne(
          {},
          { $set: { ...body, updatedAt: new Date() } },
          { upsert: true }
        );
        const updated = await db.collection('layoutconfigs').findOne();
        return jsonResponse({ success: true, message: 'Layout config saved successfully!', config: updated });
      }
    }

    // 4. CATEGORIES (/api/categories)
    if (route === 'categories' && method === 'GET') {
      const categories = await db.collection('questions').distinct('category');
      return jsonResponse({
        success: true,
        categories: categories || [],
        data: categories || []
      });
    }

    // 5. POLICY (/api/policy/get, /api/policy/save)
    if (route === 'policy/get' && method === 'GET') {
      const policy = await db.collection('policyconfigs').findOne();
      return jsonResponse(policy || { content: '' });
    }
    if (route === 'policy/save' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      await db.collection('policyconfigs').updateOne(
        {},
        { $set: { content: body.content || '', updatedAt: new Date() } },
        { upsert: true }
      );
      return jsonResponse({ success: true, message: 'Policy saved successfully!' });
    }

    // 6. DB CHECK (/api/db-check)
    if (route === 'db-check' && method === 'GET') {
      const dbConfig = getDbConfig(context);
      let paidCollections = [];
      let paidError = null;
      let freeCollections = [];
      let freeError = null;

      try {
        const cols = await db.listCollections().toArray();
        paidCollections = cols.map(c => c.name);
      } catch (e) {
        paidError = e.message;
      }

      try {
        const freeDb = await getMongoDb(context, 'free');
        const cols = await freeDb.listCollections().toArray();
        freeCollections = cols.map(c => c.name);
      } catch (e) {
        freeError = e.message;
      }

      return jsonResponse({
        timestamp: new Date().toISOString(),
        server: 'Cloudflare Pages Functions (Connected to MongoDB Atlas)',
        runtime: 'Cloudflare Workers (nodejs_compat)',
        paidDb: {
          name: dbConfig.paidDbName,
          status: paidError ? 'Connection Error' : 'Connected',
          connected: !paidError,
          host: parseClusterHost(dbConfig.paidUri),
          collections: paidCollections,
          error: paidError
        },
        freeDb: {
          name: dbConfig.freeDbName,
          status: freeError ? 'Connection Error' : 'Connected',
          connected: !freeError,
          host: parseClusterHost(dbConfig.freeUri),
          collections: freeCollections,
          error: freeError
        }
      });
    }

    // 7. QUESTIONS CRUD (/api/questions, /api/mcq, /api/questions/:id)
    if (route === 'questions' || route === 'mcq') {
      if (method === 'GET') {
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const limit = parseInt(url.searchParams.get('limit') || '0', 10);

        let query = {};
        if (category && category !== 'all' && category !== 'All') {
          const trimmed = category.trim();
          const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.category = { $regex: `^${escaped}((\\s*>\\s*)|(/|$))`, $options: 'i' };
        }
        if (search) {
          const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.$or = [
            { q: { $regex: escapedSearch, $options: 'i' } },
            { explanation: { $regex: escapedSearch, $options: 'i' } }
          ];
        }

        let cursor = db.collection('questions').find(query).sort({ createdAt: -1, _id: -1 });
        if (limit > 0) cursor = cursor.limit(limit);

        const list = await cursor.toArray();
        return jsonResponse({
          success: true,
          mcqs: list,
          questions: list,
          total: list.length
        });
      }

      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));

        if (Array.isArray(body)) {
          const docs = body.map(q => ({
            q: (q.q || '').trim(),
            options: (q.options || []).map(o => String(o).trim()),
            ans: parseInt(q.ans || 0, 10),
            explanation: q.explanation || '',
            category: (q.category || '').trim(),
            createdAt: new Date()
          })).filter(q => q.q && q.options.length >= 2 && q.category);

          if (docs.length === 0) {
            return jsonResponse({ success: false, message: 'No valid questions found' }, 400);
          }

          const res = await db.collection('questions').insertMany(docs);
          return jsonResponse({ success: true, count: res.insertedCount, insertedIds: res.insertedIds }, 201);
        }

        const doc = {
          q: (body.q || '').trim(),
          options: (body.options || []).map(o => String(o).trim()),
          ans: parseInt(body.ans || 0, 10),
          explanation: body.explanation || '',
          category: (body.category || '').trim(),
          createdAt: new Date()
        };

        if (!doc.q || doc.options.length < 2 || !doc.category) {
          return jsonResponse({ success: false, message: 'Question, options, and category are required' }, 400);
        }

        const res = await db.collection('questions').insertOne(doc);
        return jsonResponse({ success: true, data: { ...doc, _id: res.insertedId } }, 201);
      }

      if (method === 'DELETE') {
        const category = url.searchParams.get('category');
        if (!category) {
          return jsonResponse({ success: false, error: 'Category query parameter is required' }, 400);
        }
        const trimmed = category.trim();
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const res = await db.collection('questions').deleteMany({
          category: { $regex: `^${escaped}((\\s*>\\s*)|(/|$))`, $options: 'i' }
        });
        return jsonResponse({ success: true, count: res.deletedCount });
      }
    }

    // Single Question operations (/api/questions/:id)
    if (routeParts[0] === 'questions' && routeParts.length === 2 && routeParts[1] !== 'upload-csv') {
      const qId = routeParts[1];
      let objId;
      try {
        objId = new ObjectId(qId);
      } catch {
        return jsonResponse({ success: false, message: 'Invalid Question ID' }, 400);
      }

      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        const updateFields = {};
        if (body.q !== undefined) updateFields.q = body.q.trim();
        if (body.options !== undefined) updateFields.options = body.options.map(o => String(o).trim());
        if (body.ans !== undefined) updateFields.ans = parseInt(body.ans, 10);
        if (body.explanation !== undefined) updateFields.explanation = body.explanation;
        if (body.category !== undefined) updateFields.category = body.category.trim();
        updateFields.updatedAt = new Date();

        await db.collection('questions').updateOne({ _id: objId }, { $set: updateFields });
        return jsonResponse({ success: true, message: 'Question updated successfully!' });
      }

      if (method === 'DELETE') {
        await db.collection('questions').deleteOne({ _id: objId });
        return jsonResponse({ success: true, message: 'Question deleted successfully!' });
      }
    }

    // Free Questions (/api/questions/free)
    if (route === 'questions/free' && method === 'GET') {
      const freeDb = await getMongoDb(context, 'free');
      const list = await freeDb.collection('questions').find().limit(100).toArray();
      return jsonResponse({ success: true, mcqs: list, questions: list });
    }

    // 8. AUTH (/api/auth/login, /api/auth/register, /api/auth/change-password)
    if (route === 'auth/login' && method === 'POST') {
      const { email, password } = await request.json().catch(() => ({}));
      if (!email || !password) {
        return jsonResponse({ success: false, message: 'ইমেইল এবং পাসওয়ার্ড আবশ্যক।' }, 400);
      }

      const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return jsonResponse({ success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' }, 400);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return jsonResponse({ success: false, message: 'ভুল পাসওয়ার্ড!' }, 400);
      }

      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      );

      const userPayload = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'customer',
        subscription: user.subscription || { plan: 'none', active: false },
        pendingRequests: user.pendingRequests || []
      };

      const token = generateToken(userPayload, context.env);
      return jsonResponse({
        success: true,
        message: 'Login successful!',
        token,
        user: userPayload
      });
    }

    if (route === 'auth/register' && method === 'POST') {
      const { name, email, password } = await request.json().catch(() => ({}));
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: 'সকল তথ্য প্রদান করুন।' }, 400);
      }

      const existing = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return jsonResponse({ success: false, message: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।' }, 400);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'customer',
        subscription: { plan: 'none', active: false, startDate: null, endDate: null },
        pendingRequests: [],
        createdAt: new Date(),
        lastLogin: new Date()
      };

      const res = await db.collection('users').insertOne(newUser);
      const userPayload = {
        _id: res.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subscription: newUser.subscription,
        pendingRequests: []
      };

      const token = generateToken(userPayload, context.env);
      return jsonResponse({
        success: true,
        message: 'Registration successful!',
        token,
        user: userPayload
      }, 201);
    }

    if (route === 'auth/change-password' && method === 'PUT') {
      const payload = verifyTokenFromRequest(request, context.env);
      if (!payload) {
        return jsonResponse({ success: false, message: 'অননুমোদিত রিকোয়েস্ট!' }, 401);
      }

      const { oldPassword, newPassword } = await request.json().catch(() => ({}));
      if (!oldPassword || !newPassword) {
        return jsonResponse({ success: false, message: 'উভয় পাসওয়ার্ড ফিল্ড পূরণ করুন।' }, 400);
      }

      let objId;
      try { objId = new ObjectId(payload.userId); } catch { return jsonResponse({ success: false, message: 'Invalid user' }, 400); }

      const user = await db.collection('users').findOne({ _id: objId });
      if (!user) {
        return jsonResponse({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' }, 404);
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return jsonResponse({ success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' }, 400);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await db.collection('users').updateOne(
        { _id: objId },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );

      return jsonResponse({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
    }

    // 9. USERS (/api/users, /api/users/:userId/...)
    if (route === 'users' && method === 'GET') {
      const usersList = await db.collection('users')
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .toArray();

      return jsonResponse({
        success: true,
        users: usersList
      });
    }

    if (route === 'users/me' && method === 'GET') {
      const payload = verifyTokenFromRequest(request, context.env);
      if (!payload) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);

      let objId;
      try { objId = new ObjectId(payload.userId); } catch {}
      const user = await db.collection('users').findOne({ _id: objId }, { projection: { password: 0 } });
      return jsonResponse({ success: true, user });
    }

    if (route === 'users/create-admin' && method === 'POST') {
      const payload = verifyTokenFromRequest(request, context.env);
      if (!payload || payload.role !== 'owner') {
        return jsonResponse({ success: false, message: 'শুধুমাত্র ওনার নতুন এডমিন তৈরি করতে পারেন।' }, 403);
      }

      const { name, email, password } = await request.json().catch(() => ({}));
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: 'সকল তথ্য প্রদান করুন।' }, 400);
      }

      const existing = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return jsonResponse({ success: false, message: 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হচ্ছে।' }, 400);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await db.collection('users').insertOne({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'admin',
        subscription: { plan: 'lifetime', active: true, startDate: new Date(), endDate: new Date('2099-12-31') },
        pendingRequests: [],
        createdAt: new Date()
      });

      return jsonResponse({ success: true, message: 'নতুন এডমিন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' });
    }

    // Single User operations (/api/users/:userId/...)
    if (routeParts[0] === 'users' && routeParts.length >= 2) {
      const userId = routeParts[1];
      let userObjId;
      try { userObjId = new ObjectId(userId); } catch { return jsonResponse({ success: false, message: 'Invalid User ID' }, 400); }

      // Delete User
      if (routeParts.length === 2 && method === 'DELETE') {
        const payload = verifyTokenFromRequest(request, context.env);
        if (!payload || payload.role !== 'owner') return jsonResponse({ success: false, message: 'Unauthorized' }, 403);

        const target = await db.collection('users').findOne({ _id: userObjId });
        if (target && target.role === 'owner') {
          return jsonResponse({ success: false, message: 'ওনার অ্যাকাউন্ট মুছে ফেলা যাবে না!' }, 403);
        }

        await db.collection('users').deleteOne({ _id: userObjId });
        return jsonResponse({ success: true, message: 'ইউজার সফলভাবে মুছে ফেলা হয়েছে!' });
      }

      // Update Subscription (/api/users/:userId/subscription)
      if (routeParts.length === 3 && routeParts[2] === 'subscription' && method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        const { plan, customName, years, months, days } = body;

        let startDate = new Date();
        let endDate = new Date();
        let finalPlanName = plan;

        if (plan === 'custom') {
          endDate.setFullYear(endDate.getFullYear() + (parseInt(years) || 0));
          endDate.setMonth(endDate.getMonth() + (parseInt(months) || 0));
          endDate.setDate(endDate.getDate() + (parseInt(days) || 0));
          finalPlanName = customName || 'Custom Package';
        } else if (plan === '1_month') endDate.setMonth(endDate.getMonth() + 1);
        else if (plan === '3_months') endDate.setMonth(endDate.getMonth() + 3);
        else if (plan === '6_months') endDate.setMonth(endDate.getMonth() + 6);
        else if (plan === '1_year') endDate.setFullYear(endDate.getFullYear() + 1);
        else if (plan === '2_years') endDate.setFullYear(endDate.getFullYear() + 2);
        else if (plan === '3_years') endDate.setFullYear(endDate.getFullYear() + 3);
        else if (plan === 'none') {
          startDate = null;
          endDate = null;
        }

        const newSub = {
          plan: finalPlanName,
          startDate: plan !== 'none' ? startDate : null,
          endDate: plan !== 'none' ? endDate : null,
          active: plan !== 'none'
        };

        await db.collection('users').updateOne(
          { _id: userObjId },
          { $set: { subscription: newSub } }
        );

        return jsonResponse({ success: true, message: `সাবস্ক্রিপশন ${finalPlanName} এ আপডেট করা হয়েছে!`, subscription: newSub });
      }

      // Approve Pending Request (/api/users/:userId/pending-requests/:requestId/approve)
      if (routeParts[2] === 'pending-requests' && routeParts.length === 5 && routeParts[4] === 'approve' && method === 'PUT') {
        const requestId = routeParts[3];
        const user = await db.collection('users').findOne({ _id: userObjId });
        if (!user) return jsonResponse({ success: false, message: 'User not found' }, 404);

        const pendingReq = (user.pendingRequests || []).find(r => (r._id?.toString() === requestId || r.id === requestId) && r.status === 'pending');
        if (!pendingReq) return jsonResponse({ success: false, message: 'Pending request not found' }, 404);

        const now = new Date();
        const hasFutureEnd = user.subscription?.active && user.subscription?.endDate && new Date(user.subscription.endDate) > now;
        const baseDate = hasFutureEnd ? new Date(user.subscription.endDate) : now;
        const newEndDate = addPlanDuration(baseDate, pendingReq.plan);

        let newPlanName = pendingReq.plan;
        if (hasFutureEnd && user.subscription.plan && user.subscription.plan !== 'none') {
          newPlanName = user.subscription.plan + ' + ' + pendingReq.plan;
        }

        const updatedSub = {
          plan: newPlanName,
          startDate: hasFutureEnd && user.subscription?.startDate ? user.subscription.startDate : now,
          endDate: newEndDate,
          active: true
        };

        const updatedRequests = (user.pendingRequests || []).map(r => {
          if (r._id?.toString() === requestId || r.id === requestId) {
            return { ...r, status: 'approved' };
          }
          return r;
        });

        await db.collection('users').updateOne(
          { _id: userObjId },
          { $set: { subscription: updatedSub, pendingRequests: updatedRequests } }
        );

        return jsonResponse({
          success: true,
          message: `${pendingReq.plan} প্ল্যান অনুমোদন করা হয়েছে! নতুন মেয়াদ শেষ হবে ${newEndDate.toLocaleDateString()} তারিখে।`,
          subscription: updatedSub
        });
      }

      // Reject Pending Request (/api/users/:userId/pending-requests/:requestId/reject)
      if (routeParts[2] === 'pending-requests' && routeParts.length === 5 && routeParts[4] === 'reject' && method === 'PUT') {
        const requestId = routeParts[3];
        const { reason } = await request.json().catch(() => ({}));
        const user = await db.collection('users').findOne({ _id: userObjId });
        if (!user) return jsonResponse({ success: false, message: 'User not found' }, 404);

        const updatedRequests = (user.pendingRequests || []).map(r => {
          if (r._id?.toString() === requestId || r.id === requestId) {
            return { ...r, status: 'rejected', rejectionReason: reason || 'পেমেন্ট তথ্য সঠিক নয়।' };
          }
          return r;
        });

        await db.collection('users').updateOne(
          { _id: userObjId },
          { $set: { pendingRequests: updatedRequests } }
        );

        return jsonResponse({ success: true, message: 'Request reject করা হয়েছে।' });
      }

      // Edit / Delete Payment Record (/api/users/:userId/pending-requests/:requestId)
      if (routeParts[2] === 'pending-requests' && routeParts.length === 4) {
        const requestId = routeParts[3];
        const user = await db.collection('users').findOne({ _id: userObjId });
        if (!user) return jsonResponse({ success: false, message: 'User not found' }, 404);

        if (method === 'PUT') {
          const editData = await request.json().catch(() => ({}));
          const updatedRequests = (user.pendingRequests || []).map(r => {
            if (r._id?.toString() === requestId || r.id === requestId) {
              return {
                ...r,
                plan: editData.plan || r.plan,
                paymentMethod: editData.paymentMethod || r.paymentMethod,
                phone: editData.phone || r.phone,
                transactionId: editData.transactionId || r.transactionId
              };
            }
            return r;
          });

          await db.collection('users').updateOne(
            { _id: userObjId },
            { $set: { pendingRequests: updatedRequests } }
          );

          return jsonResponse({ success: true, message: 'Payment record updated successfully!' });
        }

        if (method === 'DELETE') {
          const updatedRequests = (user.pendingRequests || []).filter(
            r => r._id?.toString() !== requestId && r.id !== requestId
          );

          await db.collection('users').updateOne(
            { _id: userObjId },
            { $set: { pendingRequests: updatedRequests } }
          );

          return jsonResponse({ success: true, message: 'Payment record deleted successfully!' });
        }
      }
    }

    // Default Fallback
    return jsonResponse({ success: true, message: 'TopMCQBD Cloudflare Edge API Online', route });

  } catch (err) {
    console.error('CLOUDFLARE FUNCTION API ERROR:', err);
    return jsonResponse({ success: false, error: err.message || 'Internal Server Error' }, 500);
  }
}
