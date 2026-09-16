/**
 * User Model (Native MongoDB Driver)
 * Fast, lightweight, Edge-compatible user model for TopMCQBD_DB
 */

import { createNativeModel, toObjectId } from './_baseModel.js';

const UserModel = createNativeModel('users', 'paid');

// Extend with any specific helper methods if needed
UserModel.findById = async function (id, projection = null) {
  return this.findOne({ _id: toObjectId(id) }, projection);
};

export default UserModel;
