/**
 * Native MongoDB Model Layer for TopMCQBD
 * Lightweight, zero-Mongoose dependency wrapper designed for Cloudflare Pages Edge,
 * Workers, and Node.js environments.
 */

import { ObjectId } from 'mongodb';
import { getDatabase } from '../lib/db.js';

export function toObjectId(id) {
  if (!id) return id;
  if (id instanceof ObjectId) return id;
  if (typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
    try {
      return new ObjectId(id);
    } catch {
      return id;
    }
  }
  return id;
}

export function normalizeQuery(query = {}) {
  if (!query || typeof query !== 'object') return query;
  const normalized = { ...query };

  if (normalized._id) {
    if (typeof normalized._id === 'string') {
      normalized._id = toObjectId(normalized._id);
    } else if (normalized._id.$in && Array.isArray(normalized._id.$in)) {
      normalized._id.$in = normalized._id.$in.map(toObjectId);
    }
  } else if (normalized.id) {
    normalized._id = toObjectId(normalized.id);
    delete normalized.id;
  }

  return normalized;
}

export function wrapDoc(doc, collection) {
  if (!doc || typeof doc !== 'object') return doc;
  if (doc.save) return doc;

  Object.defineProperty(doc, 'save', {
    enumerable: false,
    writable: true,
    value: async function () {
      if (this._id) {
        const { _id, ...updates } = this;
        updates.updatedAt = new Date();
        await collection.updateOne({ _id: toObjectId(_id) }, { $set: updates });
        return this;
      } else {
        this.createdAt = this.createdAt || new Date();
        this.updatedAt = new Date();
        const res = await collection.insertOne(this);
        this._id = res.insertedId;
        return this;
      }
    }
  });

  return doc;
}

export class ChainableQuery {
  constructor(collectionPromise, filter = {}, projection = null) {
    this._collectionPromise = collectionPromise;
    this._filter = normalizeQuery(filter);
    this._projection = projection;
    this._sort = null;
    this._limit = null;
    this._skip = null;
  }

  sort(s) {
    this._sort = s;
    return this;
  }

  limit(n) {
    this._limit = Number(n) || 0;
    return this;
  }

  skip(n) {
    this._skip = Number(n) || 0;
    return this;
  }

  select(p) {
    this._projection = p;
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    const col = await this._collectionPromise;
    let cursor = col.find(this._filter);
    if (this._projection) {
      cursor = cursor.project(this._projection);
    }
    if (this._sort) {
      cursor = cursor.sort(this._sort);
    }
    if (this._skip) {
      cursor = cursor.skip(this._skip);
    }
    if (this._limit) {
      cursor = cursor.limit(this._limit);
    }

    const docs = await cursor.toArray();
    return docs.map(d => wrapDoc(d, col));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

export function createNativeModel(collectionName, clusterKey = 'paid') {
  async function getCollection() {
    const db = await getDatabase(clusterKey);
    return db.collection(collectionName);
  }

  return {
    collectionName,
    clusterKey,
    getCollection,

    find(filter = {}, projection = null) {
      return new ChainableQuery(getCollection(), filter, projection);
    },

    async findOne(filter = {}, projection = null) {
      const col = await getCollection();
      const doc = await col.findOne(normalizeQuery(filter), { projection: projection || undefined });
      return wrapDoc(doc, col);
    },

    async findById(id, projection = null) {
      return this.findOne({ _id: toObjectId(id) }, projection);
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      const col = await getCollection();
      const filter = { _id: toObjectId(id) };
      const updateDoc = update.$set ? update : { $set: update };
      await col.updateOne(filter, updateDoc);
      if (options && options.new) {
        return this.findById(id);
      }
      return null;
    },

    async findByIdAndDelete(id) {
      const col = await getCollection();
      return col.deleteOne({ _id: toObjectId(id) });
    },

    async findOneAndUpdate(filter, update, options = { new: true }) {
      const col = await getCollection();
      const updateDoc = update.$set ? update : { $set: update };
      await col.updateOne(normalizeQuery(filter), updateDoc);
      if (options && options.new) {
        return this.findOne(filter);
      }
      return null;
    },

    async findOneAndDelete(filter) {
      const col = await getCollection();
      return col.deleteOne(normalizeQuery(filter));
    },

    async create(docOrDocs) {
      const col = await getCollection();
      if (Array.isArray(docOrDocs)) {
        const docs = docOrDocs.map(d => ({
          ...d,
          createdAt: d.createdAt || new Date(),
          updatedAt: new Date()
        }));
        const res = await col.insertMany(docs);
        return docs.map((d, i) => wrapDoc({ ...d, _id: res.insertedIds[i] }, col));
      }

      const doc = {
        ...docOrDocs,
        createdAt: docOrDocs.createdAt || new Date(),
        updatedAt: new Date()
      };
      const res = await col.insertOne(doc);
      return wrapDoc({ ...doc, _id: res.insertedId }, col);
    },

    async insertOne(doc) {
      const col = await getCollection();
      return col.insertOne(doc);
    },

    async insertMany(docs) {
      const col = await getCollection();
      return col.insertMany(docs);
    },

    async updateOne(filter, update, options = {}) {
      const col = await getCollection();
      return col.updateOne(normalizeQuery(filter), update, options);
    },

    async updateMany(filter, update, options = {}) {
      const col = await getCollection();
      return col.updateMany(normalizeQuery(filter), update, options);
    },

    async deleteOne(filter) {
      const col = await getCollection();
      return col.deleteOne(normalizeQuery(filter));
    },

    async deleteMany(filter) {
      const col = await getCollection();
      return col.deleteMany(normalizeQuery(filter));
    },

    async countDocuments(filter = {}) {
      const col = await getCollection();
      return col.countDocuments(normalizeQuery(filter));
    },

    async distinct(field, filter = {}) {
      const col = await getCollection();
      return col.distinct(field, normalizeQuery(filter));
    },

    async aggregate(pipeline = []) {
      const col = await getCollection();
      return col.aggregate(pipeline).toArray();
    }
  };
}
