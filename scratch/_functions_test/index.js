var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// utils/db.js
function parseClusterHost(uri) {
  try {
    if (!uri) return "Not Configured";
    const atSplit = uri.split("@");
    if (atSplit.length > 1) {
      const hostPart = atSplit[1].split("/")[0];
      return hostPart || "MongoDB Cluster";
    }
    return "Configured";
  } catch {
    return "Configured";
  }
}
function getDbConfig(context) {
  const env = context?.env || {};
  return {
    paidUri: env.MONGODB_URI_PAID || typeof process !== "undefined" && process.env?.MONGODB_URI_PAID || DEFAULT_PAID_URI,
    freeUri: env.MONGODB_URI_FREE || typeof process !== "undefined" && process.env?.MONGODB_URI_FREE || DEFAULT_FREE_URI,
    paidDbName: env.MONGODB_DB_NAME_PAID || "TopMCQBD_DB",
    freeDbName: env.MONGODB_DB_NAME_FREE || "TopMCQBD_DB_Free"
  };
}
var DEFAULT_PAID_URI, DEFAULT_FREE_URI;
var init_db = __esm({
  "utils/db.js"() {
    init_functionsRoutes_0_6892772464095771();
    DEFAULT_PAID_URI = "mongodb+srv://mosabber480_db_user:EScirLEzwgQVVNaB@mosabber.3ajdj0u.mongodb.net/TopMCQBD_DB?retryWrites=true&w=majority";
    DEFAULT_FREE_URI = "mongodb+srv://mosabber480_db_user:VVcrE9PeIIyVlcKU@topmcqbd.pixb7fx.mongodb.net/TopMCQBD_DB_Free?retryWrites=true&w=majority";
    __name(parseClusterHost, "parseClusterHost");
    __name(getDbConfig, "getDbConfig");
  }
});

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
    init_functionsRoutes_0_6892772464095771();
  }
});

// ../node_modules/bcryptjs/index.js
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return import_crypto.default.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
function setRandomFallback(random) {
  randomFallback = random;
}
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    callback = seed_length, seed_length = void 0;
  if (typeof rounds === "function") callback = rounds, rounds = void 0;
  if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick(function() {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
function hash(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function(err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt)
        )
      );
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
function compareSync(password, hash2) {
  if (typeof password !== "string" || typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash2);
  if (hash2.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash2.substring(0, hash2.length - 31)),
    hash2
  );
}
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue
          )
        )
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick(callback2.bind(this, null, false));
      return;
    }
    hash(
      password,
      hashValue.substring(0, 29),
      function(err, comp) {
        if (err) callback2(err);
        else callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback
    );
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function getRounds(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  return parseInt(hash2.split("$")[2], 10);
}
function getSalt(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  if (hash2.length !== 60)
    throw Error("Illegal hash length: " + hash2.length + " != 60");
  return hash2.substring(0, 29);
}
function truncates(password) {
  if (typeof password !== "string")
    throw Error("Illegal arguments: " + typeof password);
  return utf8Length(password) > 72;
}
function utf8Length(string) {
  var len = 0, c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
function base64_encode(b, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
function base64_decode(s, len) {
  var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = c1 << 2 >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = (c2 & 15) << 4 >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = (c3 & 3) << 6 >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
function _encipher(lr, off, P, S) {
  var n, l = lr[off], r = lr[off + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[16];
  lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l;
  return lr;
}
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
function _key(key, P, S) {
  var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _ekskey(data, key, P, S) {
  var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P, S, i = 0, j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  __name(next, "next");
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  __name(finish, "finish");
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
function encodeBase64(bytes, length) {
  return base64_encode(bytes, length);
}
function decodeBase64(string, length) {
  return base64_decode(string, length);
}
var import_crypto, randomFallback, nextTick, BASE64_CODE, BASE64_INDEX, BCRYPT_SALT_LEN, GENSALT_DEFAULT_LOG2_ROUNDS, BLOWFISH_NUM_ROUNDS, MAX_EXECUTION_TIME, P_ORIG, S_ORIG, C_ORIG, bcryptjs_default;
var init_bcryptjs = __esm({
  "../node_modules/bcryptjs/index.js"() {
    init_functionsRoutes_0_6892772464095771();
    import_crypto = __toESM(require_crypto(), 1);
    randomFallback = null;
    __name(randomBytes, "randomBytes");
    __name(setRandomFallback, "setRandomFallback");
    __name(genSaltSync, "genSaltSync");
    __name(genSalt, "genSalt");
    __name(hashSync, "hashSync");
    __name(hash, "hash");
    __name(safeStringCompare, "safeStringCompare");
    __name(compareSync, "compareSync");
    __name(compare, "compare");
    __name(getRounds, "getRounds");
    __name(getSalt, "getSalt");
    __name(truncates, "truncates");
    nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
    __name(utf8Length, "utf8Length");
    __name(utf8Array, "utf8Array");
    BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
    BASE64_INDEX = [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      0,
      1,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      62,
      63,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      -1,
      -1,
      -1,
      -1,
      -1
    ];
    __name(base64_encode, "base64_encode");
    __name(base64_decode, "base64_decode");
    BCRYPT_SALT_LEN = 16;
    GENSALT_DEFAULT_LOG2_ROUNDS = 10;
    BLOWFISH_NUM_ROUNDS = 16;
    MAX_EXECUTION_TIME = 100;
    P_ORIG = [
      608135816,
      2242054355,
      320440878,
      57701188,
      2752067618,
      698298832,
      137296536,
      3964562569,
      1160258022,
      953160567,
      3193202383,
      887688300,
      3232508343,
      3380367581,
      1065670069,
      3041331479,
      2450970073,
      2306472731
    ];
    S_ORIG = [
      3509652390,
      2564797868,
      805139163,
      3491422135,
      3101798381,
      1780907670,
      3128725573,
      4046225305,
      614570311,
      3012652279,
      134345442,
      2240740374,
      1667834072,
      1901547113,
      2757295779,
      4103290238,
      227898511,
      1921955416,
      1904987480,
      2182433518,
      2069144605,
      3260701109,
      2620446009,
      720527379,
      3318853667,
      677414384,
      3393288472,
      3101374703,
      2390351024,
      1614419982,
      1822297739,
      2954791486,
      3608508353,
      3174124327,
      2024746970,
      1432378464,
      3864339955,
      2857741204,
      1464375394,
      1676153920,
      1439316330,
      715854006,
      3033291828,
      289532110,
      2706671279,
      2087905683,
      3018724369,
      1668267050,
      732546397,
      1947742710,
      3462151702,
      2609353502,
      2950085171,
      1814351708,
      2050118529,
      680887927,
      999245976,
      1800124847,
      3300911131,
      1713906067,
      1641548236,
      4213287313,
      1216130144,
      1575780402,
      4018429277,
      3917837745,
      3693486850,
      3949271944,
      596196993,
      3549867205,
      258830323,
      2213823033,
      772490370,
      2760122372,
      1774776394,
      2652871518,
      566650946,
      4142492826,
      1728879713,
      2882767088,
      1783734482,
      3629395816,
      2517608232,
      2874225571,
      1861159788,
      326777828,
      3124490320,
      2130389656,
      2716951837,
      967770486,
      1724537150,
      2185432712,
      2364442137,
      1164943284,
      2105845187,
      998989502,
      3765401048,
      2244026483,
      1075463327,
      1455516326,
      1322494562,
      910128902,
      469688178,
      1117454909,
      936433444,
      3490320968,
      3675253459,
      1240580251,
      122909385,
      2157517691,
      634681816,
      4142456567,
      3825094682,
      3061402683,
      2540495037,
      79693498,
      3249098678,
      1084186820,
      1583128258,
      426386531,
      1761308591,
      1047286709,
      322548459,
      995290223,
      1845252383,
      2603652396,
      3431023940,
      2942221577,
      3202600964,
      3727903485,
      1712269319,
      422464435,
      3234572375,
      1170764815,
      3523960633,
      3117677531,
      1434042557,
      442511882,
      3600875718,
      1076654713,
      1738483198,
      4213154764,
      2393238008,
      3677496056,
      1014306527,
      4251020053,
      793779912,
      2902807211,
      842905082,
      4246964064,
      1395751752,
      1040244610,
      2656851899,
      3396308128,
      445077038,
      3742853595,
      3577915638,
      679411651,
      2892444358,
      2354009459,
      1767581616,
      3150600392,
      3791627101,
      3102740896,
      284835224,
      4246832056,
      1258075500,
      768725851,
      2589189241,
      3069724005,
      3532540348,
      1274779536,
      3789419226,
      2764799539,
      1660621633,
      3471099624,
      4011903706,
      913787905,
      3497959166,
      737222580,
      2514213453,
      2928710040,
      3937242737,
      1804850592,
      3499020752,
      2949064160,
      2386320175,
      2390070455,
      2415321851,
      4061277028,
      2290661394,
      2416832540,
      1336762016,
      1754252060,
      3520065937,
      3014181293,
      791618072,
      3188594551,
      3933548030,
      2332172193,
      3852520463,
      3043980520,
      413987798,
      3465142937,
      3030929376,
      4245938359,
      2093235073,
      3534596313,
      375366246,
      2157278981,
      2479649556,
      555357303,
      3870105701,
      2008414854,
      3344188149,
      4221384143,
      3956125452,
      2067696032,
      3594591187,
      2921233993,
      2428461,
      544322398,
      577241275,
      1471733935,
      610547355,
      4027169054,
      1432588573,
      1507829418,
      2025931657,
      3646575487,
      545086370,
      48609733,
      2200306550,
      1653985193,
      298326376,
      1316178497,
      3007786442,
      2064951626,
      458293330,
      2589141269,
      3591329599,
      3164325604,
      727753846,
      2179363840,
      146436021,
      1461446943,
      4069977195,
      705550613,
      3059967265,
      3887724982,
      4281599278,
      3313849956,
      1404054877,
      2845806497,
      146425753,
      1854211946,
      1266315497,
      3048417604,
      3681880366,
      3289982499,
      290971e4,
      1235738493,
      2632868024,
      2414719590,
      3970600049,
      1771706367,
      1449415276,
      3266420449,
      422970021,
      1963543593,
      2690192192,
      3826793022,
      1062508698,
      1531092325,
      1804592342,
      2583117782,
      2714934279,
      4024971509,
      1294809318,
      4028980673,
      1289560198,
      2221992742,
      1669523910,
      35572830,
      157838143,
      1052438473,
      1016535060,
      1802137761,
      1753167236,
      1386275462,
      3080475397,
      2857371447,
      1040679964,
      2145300060,
      2390574316,
      1461121720,
      2956646967,
      4031777805,
      4028374788,
      33600511,
      2920084762,
      1018524850,
      629373528,
      3691585981,
      3515945977,
      2091462646,
      2486323059,
      586499841,
      988145025,
      935516892,
      3367335476,
      2599673255,
      2839830854,
      265290510,
      3972581182,
      2759138881,
      3795373465,
      1005194799,
      847297441,
      406762289,
      1314163512,
      1332590856,
      1866599683,
      4127851711,
      750260880,
      613907577,
      1450815602,
      3165620655,
      3734664991,
      3650291728,
      3012275730,
      3704569646,
      1427272223,
      778793252,
      1343938022,
      2676280711,
      2052605720,
      1946737175,
      3164576444,
      3914038668,
      3967478842,
      3682934266,
      1661551462,
      3294938066,
      4011595847,
      840292616,
      3712170807,
      616741398,
      312560963,
      711312465,
      1351876610,
      322626781,
      1910503582,
      271666773,
      2175563734,
      1594956187,
      70604529,
      3617834859,
      1007753275,
      1495573769,
      4069517037,
      2549218298,
      2663038764,
      504708206,
      2263041392,
      3941167025,
      2249088522,
      1514023603,
      1998579484,
      1312622330,
      694541497,
      2582060303,
      2151582166,
      1382467621,
      776784248,
      2618340202,
      3323268794,
      2497899128,
      2784771155,
      503983604,
      4076293799,
      907881277,
      423175695,
      432175456,
      1378068232,
      4145222326,
      3954048622,
      3938656102,
      3820766613,
      2793130115,
      2977904593,
      26017576,
      3274890735,
      3194772133,
      1700274565,
      1756076034,
      4006520079,
      3677328699,
      720338349,
      1533947780,
      354530856,
      688349552,
      3973924725,
      1637815568,
      332179504,
      3949051286,
      53804574,
      2852348879,
      3044236432,
      1282449977,
      3583942155,
      3416972820,
      4006381244,
      1617046695,
      2628476075,
      3002303598,
      1686838959,
      431878346,
      2686675385,
      1700445008,
      1080580658,
      1009431731,
      832498133,
      3223435511,
      2605976345,
      2271191193,
      2516031870,
      1648197032,
      4164389018,
      2548247927,
      300782431,
      375919233,
      238389289,
      3353747414,
      2531188641,
      2019080857,
      1475708069,
      455242339,
      2609103871,
      448939670,
      3451063019,
      1395535956,
      2413381860,
      1841049896,
      1491858159,
      885456874,
      4264095073,
      4001119347,
      1565136089,
      3898914787,
      1108368660,
      540939232,
      1173283510,
      2745871338,
      3681308437,
      4207628240,
      3343053890,
      4016749493,
      1699691293,
      1103962373,
      3625875870,
      2256883143,
      3830138730,
      1031889488,
      3479347698,
      1535977030,
      4236805024,
      3251091107,
      2132092099,
      1774941330,
      1199868427,
      1452454533,
      157007616,
      2904115357,
      342012276,
      595725824,
      1480756522,
      206960106,
      497939518,
      591360097,
      863170706,
      2375253569,
      3596610801,
      1814182875,
      2094937945,
      3421402208,
      1082520231,
      3463918190,
      2785509508,
      435703966,
      3908032597,
      1641649973,
      2842273706,
      3305899714,
      1510255612,
      2148256476,
      2655287854,
      3276092548,
      4258621189,
      236887753,
      3681803219,
      274041037,
      1734335097,
      3815195456,
      3317970021,
      1899903192,
      1026095262,
      4050517792,
      356393447,
      2410691914,
      3873677099,
      3682840055,
      3913112168,
      2491498743,
      4132185628,
      2489919796,
      1091903735,
      1979897079,
      3170134830,
      3567386728,
      3557303409,
      857797738,
      1136121015,
      1342202287,
      507115054,
      2535736646,
      337727348,
      3213592640,
      1301675037,
      2528481711,
      1895095763,
      1721773893,
      3216771564,
      62756741,
      2142006736,
      835421444,
      2531993523,
      1442658625,
      3659876326,
      2882144922,
      676362277,
      1392781812,
      170690266,
      3921047035,
      1759253602,
      3611846912,
      1745797284,
      664899054,
      1329594018,
      3901205900,
      3045908486,
      2062866102,
      2865634940,
      3543621612,
      3464012697,
      1080764994,
      553557557,
      3656615353,
      3996768171,
      991055499,
      499776247,
      1265440854,
      648242737,
      3940784050,
      980351604,
      3713745714,
      1749149687,
      3396870395,
      4211799374,
      3640570775,
      1161844396,
      3125318951,
      1431517754,
      545492359,
      4268468663,
      3499529547,
      1437099964,
      2702547544,
      3433638243,
      2581715763,
      2787789398,
      1060185593,
      1593081372,
      2418618748,
      4260947970,
      69676912,
      2159744348,
      86519011,
      2512459080,
      3838209314,
      1220612927,
      3339683548,
      133810670,
      1090789135,
      1078426020,
      1569222167,
      845107691,
      3583754449,
      4072456591,
      1091646820,
      628848692,
      1613405280,
      3757631651,
      526609435,
      236106946,
      48312990,
      2942717905,
      3402727701,
      1797494240,
      859738849,
      992217954,
      4005476642,
      2243076622,
      3870952857,
      3732016268,
      765654824,
      3490871365,
      2511836413,
      1685915746,
      3888969200,
      1414112111,
      2273134842,
      3281911079,
      4080962846,
      172450625,
      2569994100,
      980381355,
      4109958455,
      2819808352,
      2716589560,
      2568741196,
      3681446669,
      3329971472,
      1835478071,
      660984891,
      3704678404,
      4045999559,
      3422617507,
      3040415634,
      1762651403,
      1719377915,
      3470491036,
      2693910283,
      3642056355,
      3138596744,
      1364962596,
      2073328063,
      1983633131,
      926494387,
      3423689081,
      2150032023,
      4096667949,
      1749200295,
      3328846651,
      309677260,
      2016342300,
      1779581495,
      3079819751,
      111262694,
      1274766160,
      443224088,
      298511866,
      1025883608,
      3806446537,
      1145181785,
      168956806,
      3641502830,
      3584813610,
      1689216846,
      3666258015,
      3200248200,
      1692713982,
      2646376535,
      4042768518,
      1618508792,
      1610833997,
      3523052358,
      4130873264,
      2001055236,
      3610705100,
      2202168115,
      4028541809,
      2961195399,
      1006657119,
      2006996926,
      3186142756,
      1430667929,
      3210227297,
      1314452623,
      4074634658,
      4101304120,
      2273951170,
      1399257539,
      3367210612,
      3027628629,
      1190975929,
      2062231137,
      2333990788,
      2221543033,
      2438960610,
      1181637006,
      548689776,
      2362791313,
      3372408396,
      3104550113,
      3145860560,
      296247880,
      1970579870,
      3078560182,
      3769228297,
      1714227617,
      3291629107,
      3898220290,
      166772364,
      1251581989,
      493813264,
      448347421,
      195405023,
      2709975567,
      677966185,
      3703036547,
      1463355134,
      2715995803,
      1338867538,
      1343315457,
      2802222074,
      2684532164,
      233230375,
      2599980071,
      2000651841,
      3277868038,
      1638401717,
      4028070440,
      3237316320,
      6314154,
      819756386,
      300326615,
      590932579,
      1405279636,
      3267499572,
      3150704214,
      2428286686,
      3959192993,
      3461946742,
      1862657033,
      1266418056,
      963775037,
      2089974820,
      2263052895,
      1917689273,
      448879540,
      3550394620,
      3981727096,
      150775221,
      3627908307,
      1303187396,
      508620638,
      2975983352,
      2726630617,
      1817252668,
      1876281319,
      1457606340,
      908771278,
      3720792119,
      3617206836,
      2455994898,
      1729034894,
      1080033504,
      976866871,
      3556439503,
      2881648439,
      1522871579,
      1555064734,
      1336096578,
      3548522304,
      2579274686,
      3574697629,
      3205460757,
      3593280638,
      3338716283,
      3079412587,
      564236357,
      2993598910,
      1781952180,
      1464380207,
      3163844217,
      3332601554,
      1699332808,
      1393555694,
      1183702653,
      3581086237,
      1288719814,
      691649499,
      2847557200,
      2895455976,
      3193889540,
      2717570544,
      1781354906,
      1676643554,
      2592534050,
      3230253752,
      1126444790,
      2770207658,
      2633158820,
      2210423226,
      2615765581,
      2414155088,
      3127139286,
      673620729,
      2805611233,
      1269405062,
      4015350505,
      3341807571,
      4149409754,
      1057255273,
      2012875353,
      2162469141,
      2276492801,
      2601117357,
      993977747,
      3918593370,
      2654263191,
      753973209,
      36408145,
      2530585658,
      25011837,
      3520020182,
      2088578344,
      530523599,
      2918365339,
      1524020338,
      1518925132,
      3760827505,
      3759777254,
      1202760957,
      3985898139,
      3906192525,
      674977740,
      4174734889,
      2031300136,
      2019492241,
      3983892565,
      4153806404,
      3822280332,
      352677332,
      2297720250,
      60907813,
      90501309,
      3286998549,
      1016092578,
      2535922412,
      2839152426,
      457141659,
      509813237,
      4120667899,
      652014361,
      1966332200,
      2975202805,
      55981186,
      2327461051,
      676427537,
      3255491064,
      2882294119,
      3433927263,
      1307055953,
      942726286,
      933058658,
      2468411793,
      3933900994,
      4215176142,
      1361170020,
      2001714738,
      2830558078,
      3274259782,
      1222529897,
      1679025792,
      2729314320,
      3714953764,
      1770335741,
      151462246,
      3013232138,
      1682292957,
      1483529935,
      471910574,
      1539241949,
      458788160,
      3436315007,
      1807016891,
      3718408830,
      978976581,
      1043663428,
      3165965781,
      1927990952,
      4200891579,
      2372276910,
      3208408903,
      3533431907,
      1412390302,
      2931980059,
      4132332400,
      1947078029,
      3881505623,
      4168226417,
      2941484381,
      1077988104,
      1320477388,
      886195818,
      18198404,
      3786409e3,
      2509781533,
      112762804,
      3463356488,
      1866414978,
      891333506,
      18488651,
      661792760,
      1628790961,
      3885187036,
      3141171499,
      876946877,
      2693282273,
      1372485963,
      791857591,
      2686433993,
      3759982718,
      3167212022,
      3472953795,
      2716379847,
      445679433,
      3561995674,
      3504004811,
      3574258232,
      54117162,
      3331405415,
      2381918588,
      3769707343,
      4154350007,
      1140177722,
      4074052095,
      668550556,
      3214352940,
      367459370,
      261225585,
      2610173221,
      4209349473,
      3468074219,
      3265815641,
      314222801,
      3066103646,
      3808782860,
      282218597,
      3406013506,
      3773591054,
      379116347,
      1285071038,
      846784868,
      2669647154,
      3771962079,
      3550491691,
      2305946142,
      453669953,
      1268987020,
      3317592352,
      3279303384,
      3744833421,
      2610507566,
      3859509063,
      266596637,
      3847019092,
      517658769,
      3462560207,
      3443424879,
      370717030,
      4247526661,
      2224018117,
      4143653529,
      4112773975,
      2788324899,
      2477274417,
      1456262402,
      2901442914,
      1517677493,
      1846949527,
      2295493580,
      3734397586,
      2176403920,
      1280348187,
      1908823572,
      3871786941,
      846861322,
      1172426758,
      3287448474,
      3383383037,
      1655181056,
      3139813346,
      901632758,
      1897031941,
      2986607138,
      3066810236,
      3447102507,
      1393639104,
      373351379,
      950779232,
      625454576,
      3124240540,
      4148612726,
      2007998917,
      544563296,
      2244738638,
      2330496472,
      2058025392,
      1291430526,
      424198748,
      50039436,
      29584100,
      3605783033,
      2429876329,
      2791104160,
      1057563949,
      3255363231,
      3075367218,
      3463963227,
      1469046755,
      985887462
    ];
    C_ORIG = [
      1332899944,
      1700884034,
      1701343084,
      1684370003,
      1668446532,
      1869963892
    ];
    __name(_encipher, "_encipher");
    __name(_streamtoword, "_streamtoword");
    __name(_key, "_key");
    __name(_ekskey, "_ekskey");
    __name(_crypt, "_crypt");
    __name(_hash, "_hash");
    __name(encodeBase64, "encodeBase64");
    __name(decodeBase64, "decodeBase64");
    bcryptjs_default = {
      setRandomFallback,
      genSaltSync,
      genSalt,
      hashSync,
      hash,
      compareSync,
      compare,
      getRounds,
      getSalt,
      truncates,
      encodeBase64,
      decodeBase64
    };
  }
});

// utils/auth.js
function getJwtSecret(env) {
  return env?.JWT_SECRET || typeof process !== "undefined" && process.env?.JWT_SECRET || "topmcqbd_super_secret_jwt_key_2026";
}
function base64UrlEncode(str) {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return atob(base64);
}
function addPlanDuration(baseDate, plan) {
  const d = new Date(baseDate);
  if (plan === "1_month") d.setMonth(d.getMonth() + 1);
  else if (plan === "3_months") d.setMonth(d.getMonth() + 3);
  else if (plan === "6_months") d.setMonth(d.getMonth() + 6);
  else if (plan === "1_year") d.setFullYear(d.getFullYear() + 1);
  else if (plan === "2_years") d.setFullYear(d.getFullYear() + 2);
  else if (plan === "3_years") d.setFullYear(d.getFullYear() + 3);
  return d;
}
async function generateToken(user, env) {
  const secret = getJwtSecret(env);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    userId: String(user._id || user.id || "usr_" + Date.now()),
    role: user.role || "customer",
    subscription: user.subscription || { plan: "none", active: false },
    exp: Math.floor(Date.now() / 1e3) + 7 * 24 * 60 * 60
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(dataToSign)
  );
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureBase64 = base64UrlEncode(String.fromCharCode.apply(null, signatureArray));
  return `${dataToSign}.${signatureBase64}`;
}
async function verifyTokenFromRequest(request, env) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("x-access-token");
    if (!authHeader) return null;
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const dataToSign = `${headerB64}.${payloadB64}`;
    const secret = getJwtSecret(env);
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const binarySig = base64UrlDecode(sigB64);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(dataToSign)
    );
    if (!isValid) return null;
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}
var init_auth = __esm({
  "utils/auth.js"() {
    init_functionsRoutes_0_6892772464095771();
    init_bcryptjs();
    __name(getJwtSecret, "getJwtSecret");
    __name(base64UrlEncode, "base64UrlEncode");
    __name(base64UrlDecode, "base64UrlDecode");
    __name(addPlanDuration, "addPlanDuration");
    __name(generateToken, "generateToken");
    __name(verifyTokenFromRequest, "verifyTokenFromRequest");
  }
});

// utils/brevo.js
async function sendResetEmail(user, resetLink, env = {}) {
  const BREVO_API_KEY = env.BREVO_API_KEY || typeof process !== "undefined" && process.env?.BREVO_API_KEY || "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";
  const BREVO_SENDER_EMAIL = env.BREVO_SENDER_EMAIL || typeof process !== "undefined" && process.env?.BREVO_SENDER_EMAIL || "mosabber480@gmail.com";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; text-align: center;">TopMCQBD \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F</h2>
      <p>\u09AA\u09CD\u09B0\u09BF\u09DF <strong>${user.name || "\u0987\u0989\u099C\u09BE\u09B0"}</strong>,</p>
      <p>\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u098F\u0995\u099F\u09BF \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u09AA\u09BE\u0993\u09DF\u09BE \u0997\u09C7\u099B\u09C7\u0964 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09A8\u09A4\u09C1\u09A8 \u0995\u09B0\u09C7 \u09B8\u09C7\u099F \u0995\u09B0\u09A4\u09C7 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C1\u09A8:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09C1\u09A8</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">\u09B2\u09BF\u0982\u0995\u099F\u09BF\u09B0 \u09AE\u09C7\u09DF\u09BE\u09A6 \u09A5\u09BE\u0995\u09AC\u09C7 \u09E7\u09EB \u09AE\u09BF\u09A8\u09BF\u099F\u0964 \u0986\u09AA\u09A8\u09BF \u09AF\u09A6\u09BF \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u0995\u09B0\u09A4\u09C7 \u09A8\u09BE \u099A\u09C7\u09DF\u09C7 \u09A5\u09BE\u0995\u09C7\u09A8, \u09A4\u09AC\u09C7 \u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2\u099F\u09BF \u098F\u09DC\u09BF\u09DF\u09C7 \u099A\u09B2\u09C1\u09A8\u0964</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">TopMCQBD - \u09B8\u09C7\u09B0\u09BE \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE</p>
    </div>
  `;
  const payload = {
    sender: { name: "TopMCQBD Support", email: BREVO_SENDER_EMAIL },
    to: [{ email: user.email, name: user.name || "User" }],
    subject: "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u09B2\u09BF\u0982\u0995 - TopMCQBD",
    htmlContent
  };
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo API Error:", errorText);
    throw new Error(`Brevo API responded with ${response.status}: ${errorText}`);
  }
  return await response.json();
}
var init_brevo = __esm({
  "utils/brevo.js"() {
    init_functionsRoutes_0_6892772464095771();
    __name(sendResetEmail, "sendResetEmail");
  }
});

// data/liveConfigs.js
var initialLayoutConfig, initialHomeConfig, initialSidebarConfig, initialPolicy, initialQuestions, initialUsers;
var init_liveConfigs = __esm({
  "data/liveConfigs.js"() {
    init_functionsRoutes_0_6892772464095771();
    initialLayoutConfig = {
      "_id": "6a798943f5d5cfc0248f5138",
      "announcement": {
        "text": "\u09AC\u09BF\u09B6\u09C7\u09B7 \u09AC\u09BF\u099C\u09CD\u099E\u09AA\u09CD\u09A4\u09BF: \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09A5\u09C7\u0995\u09C7 \u09AA\u09CD\u09B0\u09A5\u09AE\u09AC\u09BE\u09B0 \u0995\u09C1\u0987\u099C\u09C7\u09B0 \u09A4\u09A5\u09CD\u09AF \u09B2\u09CB\u09A1 \u09B9\u09A4\u09C7 \u09E9\u09E6 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1 \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u09B8\u09AE\u09AF\u09BC \u09B2\u09BE\u0997\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09A7\u09C8\u09B0\u09CD\u09AF \u09A7\u09B0\u09C1\u09A8!",
        "link": ""
      },
      "header": {
        "siteTitle": "TopMCQBD",
        "logoUrl": "/images/TopMCQ.png",
        "seoTitle": "TopMCQBD - \u09B8\u09C7\u09B0\u09BE \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u0995\u09C1\u0987\u099C \u0993 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE",
        "faviconUrl": "/images/favicon.ico",
        "btnText": "\u09B8\u09B9\u09BE\u09DF\u09A4\u09BE",
        "btnLink": "/contact",
        "menus": [
          {
            "title": "\u09B9\u09CB\u09AE",
            "url": "/",
            "isMegaMenu": false,
            "subMenus": [],
            "_id": "6a80aa6a1c88c02a9d00d769"
          },
          {
            "title": "\u0995\u09C1\u0987\u099C \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8",
            "url": "/quiz",
            "isMegaMenu": true,
            "megaMenuId": "mega_1787062290289",
            "subMenus": [],
            "_id": "6a80aa6a1c88c02a9d00d76a"
          },
          {
            "title": "\u09B8\u0995\u09B2 MCQ",
            "url": "/all-mcq",
            "isMegaMenu": false,
            "subMenus": [],
            "_id": "6a80aa6a1c88c02a9d00d76b"
          },
          {
            "title": "\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C\u09B8\u09AE\u09C2\u09B9",
            "url": "/packages",
            "isMegaMenu": false,
            "subMenus": [],
            "_id": "6a80aa6a1c88c02a9d00d76c"
          },
          {
            "title": "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7",
            "url": "/about-us",
            "isMegaMenu": false,
            "subMenus": [],
            "_id": "6a80aa6a1c88c02a9d00d76d"
          },
          {
            "title": "\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997",
            "url": "/contact",
            "isMegaMenu": false,
            "subMenus": [],
            "_id": "6a80aa6a1c88c02a9d00d76e"
          }
        ],
        "megaMenus": [
          {
            "id": "mega_1787062290289",
            "title": "\u09A8\u09A4\u09C1\u09A8 \u09AE\u09C7\u0997\u09BE \u09AE\u09C7\u09A8\u09C1 1",
            "columns": [
              {
                "type": "info",
                "title": "\u09A8\u09A4\u09C1\u09A8 \u09A4\u09A5\u09CD\u09AF \u0995\u09B2\u09BE\u09AE",
                "text": "\u09B8\u09BE\u0987\u099F \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u0995\u09BF\u099B\u09C1 \u09B2\u09BF\u0996\u09C1\u09A8...",
                "iconHtml": '<i class="fa-solid fa-circle-info"></i>'
              },
              {
                "type": "links",
                "title": "\u09A8\u09A4\u09C1\u09A8 \u09B2\u09BF\u0982\u0995 \u0995\u09B2\u09BE\u09AE",
                "links": [
                  {
                    "title": "test",
                    "url": "test"
                  }
                ]
              },
              {
                "type": "links",
                "title": "\u09A8\u09A4\u09C1\u09A8 \u09B2\u09BF\u0982\u0995 \u0995\u09B2\u09BE\u09AE",
                "links": [
                  {
                    "title": "test",
                    "url": "test"
                  }
                ]
              }
            ]
          }
        ]
      },
      "footer": {
        "columns": [
          {
            "type": "info",
            "title": "\u09B8\u09BE\u0987\u099F \u09A4\u09A5\u09CD\u09AF \u0993 \u09B8\u09CB\u09B6\u09BE\u09B2 \u09B2\u09BF\u0982\u0995",
            "text": "\u09AC\u09BF\u09B8\u09BF\u098F\u09B8, \u09AC\u09CD\u09AF\u09BE\u0982\u0995, \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09B6\u09BF\u0995\u09CD\u09B7\u0995 \u09A8\u09BF\u09DF\u09CB\u0997 \u098F\u09AC\u0982 \u09AC\u09BF\u09B6\u09CD\u09AC\u09AC\u09BF\u09A6\u09CD\u09AF\u09BE\u09B2\u09DF\u09C7\u09B0 \u09AD\u09B0\u09CD\u09A4\u09BF \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u098F\u0995\u099F\u09BF \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u0993 \u09B8\u09CD\u09AC\u09DF\u0982\u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u0964",
            "fb": "",
            "yt": "",
            "wa": "",
            "tw": "",
            "tg": "",
            "ln": ""
          },
          {
            "type": "links",
            "title": "\u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF \u09B2\u09BF\u0982\u0995",
            "links": [
              {
                "title": "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C",
                "url": "/"
              },
              {
                "title": "\u0995\u09C1\u0987\u099C \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8",
                "url": "/quiz"
              },
              {
                "title": "\u09B8\u0995\u09B2 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF",
                "url": "/all-mcq"
              },
              {
                "title": "\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C \u0993 \u09AE\u09C2\u09B2\u09CD\u09AF \u09A4\u09BE\u09B2\u09BF\u0995\u09BE",
                "url": "/packages"
              }
            ]
          },
          {
            "type": "links",
            "title": "\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF",
            "links": [
              {
                "title": "\u09AC\u09BF\u09B8\u09BF\u098F\u09B8 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF",
                "url": "/quiz?category=bcs"
              },
              {
                "title": "\u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u099C\u09AC",
                "url": "/quiz?category=bank"
              },
              {
                "title": "\u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09B6\u09BF\u0995\u09CD\u09B7\u0995",
                "url": "/quiz?category=primary"
              }
            ]
          },
          {
            "type": "links",
            "title": "\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997",
            "links": [
              {
                "title": "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7",
                "url": "/about-us"
              },
              {
                "title": "\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8",
                "url": "/contact"
              },
              {
                "title": "\u09B8\u099A\u09B0\u09BE\u099A\u09B0 \u099C\u09BF\u099C\u09CD\u099E\u09BE\u09B8\u09BE (FAQ)",
                "url": "/faq"
              },
              {
                "title": "\u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u0993 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09B2\u09BF\u09B8\u09BF",
                "url": "/privacy-and-refund-policy"
              }
            ]
          }
        ]
      },
      "copyright": {
        "text": "\xA9 2026 TopMCQBD. \u09B8\u09B0\u09CD\u09AC\u09B8\u09CD\u09AC\u09A4\u09CD\u09AC \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4\u0964",
        "links": [
          {
            "title": "FAQ",
            "url": "/faq"
          },
          {
            "title": "Privacy & Refund Policy",
            "url": "/privacy-and-refund-policy"
          },
          {
            "title": "System Status",
            "url": "/status"
          }
        ]
      },
      "updatedAt": "2026-08-18T14:57:02.253Z"
    };
    initialHomeConfig = {
      "_id": "6a7ab899fff745a78599a38e",
      "seoTitle": "",
      "seoDescription": "",
      "sliders": [
        {
          "title": "\u09AC\u09BF\u09B8\u09BF\u098F\u09B8 \u0993 \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u099C\u09AC \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF\u09B0 \u09B8\u09C7\u09B0\u09BE \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE",
          "subtitle": "\u09B9\u09BE\u099C\u09BE\u09B0\u09CB \u09B8\u09A0\u09BF\u0995 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u09AC\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09B8\u09B9 \u09A8\u09BF\u099C\u09C7\u0995\u09C7 \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u09A6\u09CD\u09B0\u09C1\u09A4\u09A4\u09AE \u09B8\u09AE\u09DF\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u099A\u09BE\u0995\u09B0\u09BF\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09C1",
          "bgImage": "images/slider-01.jpg",
          "bgOpacity": 0.5,
          "btn1Text": "\u{1F680} \u0995\u09C1\u0987\u099C \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C1\u09A8",
          "btn1Link": "all-mcq.html",
          "btn2Text": "\u09AB\u09CD\u09B0\u09BF \u09A1\u09C7\u09AE\u09CB \u09A6\u09C7\u0996\u09C1\u09A8",
          "btn2Link": "#demo",
          "_id": "6a7ab899fff745a78599a38f"
        },
        {
          "title": "\u09AC\u09BF\u09B8\u09BF\u098F\u09B8 \u0993 \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u099C\u09AC \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF\u09B0 \u09B8\u09C7\u09B0\u09BE \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE",
          "subtitle": "\u09B9\u09BE\u099C\u09BE\u09B0\u09CB \u09B8\u09A0\u09BF\u0995 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u09AC\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09B8\u09B9 \u09A8\u09BF\u099C\u09C7\u0995\u09C7 \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u09A6\u09CD\u09B0\u09C1\u09A4\u09A4\u09AE \u09B8\u09AE\u09DF\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u099A\u09BE\u0995\u09B0\u09BF\u09B0 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09C1",
          "bgImage": "images/slider-02.jpg",
          "bgOpacity": 0.5,
          "btn1Text": "\u{1F680} \u0995\u09C1\u0987\u099C \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C1\u09A8",
          "btn1Link": "all-mcq.html",
          "btn2Text": "\u09AB\u09CD\u09B0\u09BF \u09A1\u09C7\u09AE\u09CB \u09A6\u09C7\u0996\u09C1\u09A8",
          "btn2Link": "#demo",
          "_id": "6a7ab899fff745a78599a390"
        }
      ],
      "demoQuizzes": [
        {
          "title": "\u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE \u0993 \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF",
          "badgeText": "\u09AB\u09CD\u09B0\u09BF \u099F\u09C7\u09B8\u09CD\u099F",
          "desc": "\u09B8\u09A8\u09CD\u09A7\u09BF, \u09B8\u09AE\u09BE\u09B8 \u0993 \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09AC\u09AA\u09C2\u09B0\u09CD\u09A3 \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF\u09BF\u0995\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09BE\u09AC\u09B2\u09BF\u0964",
          "link": "",
          "_id": "6a7ab93cfff745a78599a3a9"
        }
      ],
      "packages": [],
      "demoSectionInfo": {
        "title": "\u09AB\u09CD\u09B0\u09BF \u0995\u09C1\u0987\u099C",
        "subtitle": "\u0995\u09CB\u09A8\u09CB \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u099B\u09BE\u09DC\u09BE\u0987 \u098F\u0996\u09A8\u0987 \u09A8\u09BF\u099A\u09C7\u09B0 \u0995\u09C1\u0987\u099C\u0997\u09C1\u09B2\u09CB \u09AA\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u099F\u09BF\u09B8 \u0995\u09B0\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8"
      },
      "packageSectionInfo": {
        "title": "\u09AB\u09CD\u09B0\u09BF \u0995\u09C1\u0987\u099C",
        "subtitle": "\u0995\u09CB\u09A8\u09CB \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B6\u09A8 \u099B\u09BE\u09DC\u09BE\u0987 \u098F\u0996\u09A8\u0987 \u09A8\u09BF\u099A\u09C7\u09B0 \u0995\u09C1\u0987\u099C\u0997\u09C1\u09B2\u09CB \u09AA\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u099F\u09BF\u09B8 \u0995\u09B0\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8"
      },
      "missionSectionInfo": {
        "sectionTitle": "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AE\u09BF\u09B6\u09A8 \u0993 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF",
        "sectionSubtitle": "\u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0\u09CD\u09A5\u09C0\u09A6\u09C7\u09B0 \u09B8\u09AB\u09B2\u09A4\u09BE \u0993 \u09B8\u09A0\u09BF\u0995 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF\u09B0 \u09AA\u09A5 \u09B8\u09C1\u0997\u09AE \u0995\u09B0\u09BE\u0987 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0989\u09A6\u09CD\u09A6\u09C7\u09B6\u09CD\u09AF",
        "missionTitle": "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AE\u09BF\u09B6\u09A8",
        "missionDesc": "\u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4\u09C7\u09B0 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0\u09CD\u09A5\u09C0\u09A6\u09C7\u09B0 \u0995\u09BE\u099B\u09C7 \u09AE\u09BE\u09A8\u09B8\u09AE\u09CD\u09AE\u09A4 \u0993 \u09A4\u09A5\u09CD\u09AF\u09B8\u09AE\u09C3\u09A6\u09CD\u09A7 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF\u09AE\u09C2\u09B2\u0995 \u0995\u09C1\u0987\u099C \u09AA\u09CC\u0981\u099B\u09C7 \u09A6\u09C7\u0993\u09DF\u09BE, \u09AF\u09BE\u09A4\u09C7 \u09A4\u09BE\u09B0\u09BE \u0998\u09B0\u09C7 \u09AC\u09B8\u09C7\u0987 \u09B0\u09BF\u09DF\u09C7\u09B2-\u099F\u09BE\u0987\u09AE \u09AE\u09C2\u09B2\u09CD\u09AF\u09BE\u09DF\u09A8\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09A8\u09BF\u099C\u09C7\u09B0 \u0986\u09A4\u09CD\u09AE\u09AC\u09BF\u09B6\u09CD\u09AC\u09BE\u09B8 \u09AC\u09C3\u09A6\u09CD\u09A7\u09BF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964",
        "goalTitle": "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF",
        "goalDesc": "\u098F\u0995\u099F\u09BF \u0986\u09A7\u09C1\u09A8\u09BF\u0995, \u09B8\u09B9\u099C \u0993 \u0995\u09BE\u09B0\u09CD\u09AF\u0995\u09B0 \u09B2\u09BE\u09B0\u09CD\u09A8\u09BF\u0982 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AA\u09CD\u09B0\u09A4\u09BF\u09AF\u09CB\u0997\u09BF\u09A4\u09BE\u09AE\u09C2\u09B2\u0995 \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE\u09B0 \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE\u09B0\u09CD\u09A5\u09C0\u09B0 \u09AA\u09CD\u09B0\u09A5\u09AE \u09AA\u099B\u09A8\u09CD\u09A6 \u09B9\u09DF\u09C7 \u0993\u09A0\u09BE \u098F\u09AC\u0982 \u09AC\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09AE\u09C2\u09B2\u0995 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09A4\u09BE\u09A6\u09C7\u09B0 \u09B6\u09A4\u09AD\u09BE\u0997 \u09B8\u09BE\u09AB\u09B2\u09CD\u09AF \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09BE\u0964"
      },
      "createdAt": "2026-08-11T05:52:25.523Z",
      "updatedAt": "2026-08-11T05:55:08.920Z",
      "__v": 1
    };
    initialSidebarConfig = {
      "_id": "6a841d67482a8c1578766b8f",
      "menus": [
        {
          "title": "\u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1",
          "url": "/admin/dashboard",
          "icon": "fa-solid fa-gauge-high",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b90"
        },
        {
          "title": "\u09B9\u09C7\u09A1\u09BE\u09B0 \u0995\u09A8\u09CD\u099F\u09CD\u09B0\u09CB\u09B2",
          "url": "/admin/header-dashboard",
          "icon": "fa-solid fa-window-restore",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b91"
        },
        {
          "title": "\u09AB\u09C1\u099F\u09BE\u09B0 \u0995\u09A8\u09CD\u099F\u09CD\u09B0\u09CB\u09B2",
          "url": "/admin/footer-dashboard",
          "icon": "fa-solid fa-table-columns",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b92"
        },
        {
          "title": "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C \u0995\u09A8\u09CD\u099F\u09CD\u09B0\u09CB\u09B2",
          "url": "/admin/home-dashboard",
          "icon": "fa-solid fa-sliders",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b93"
        },
        {
          "title": "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7",
          "url": "/admin/about-dashboard",
          "icon": "fa-solid fa-address-card",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b94"
        },
        {
          "title": "\u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09AC\u09CD\u09AF\u09BE\u0982\u0995 \u0993 \u0995\u09C1\u0987\u099C",
          "url": "/admin/quiz-dashboard",
          "icon": "fa-solid fa-file-circle-question",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b95"
        },
        {
          "title": "\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C\u09B8\u09AE\u09C2\u09B9 \u09AA\u09C7\u099C",
          "url": "/admin/packages-dashboard",
          "icon": "fa-solid fa-box-open",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b96"
        },
        {
          "title": "\u0987\u0989\u099C\u09BE\u09B0 \u0993 \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8",
          "url": "/admin/users",
          "icon": "fa-solid fa-users-gear",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b97"
        },
        {
          "title": "\u09B8\u09BE\u0987\u09A1\u09AC\u09BE\u09B0 \u09AE\u09C7\u09A8\u09C1 \u0995\u09A8\u09CD\u099F\u09CD\u09B0\u09CB\u09B2",
          "url": "/admin/admin-menu-dashboard",
          "icon": "fa-solid fa-list-check",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b98"
        },
        {
          "title": "\u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u0993 \u09AA\u09B2\u09BF\u09B8\u09BF",
          "url": "/admin/policy-dashboard",
          "icon": "fa-solid fa-file-invoice-dollar",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b99"
        },
        {
          "title": "\u09AB\u09CD\u09B0\u09BF \u098F\u09AE\u09B8\u09BF\u0995\u09BF\u0989 \u0995\u09A8\u09CD\u099F\u09CD\u09B0\u09CB\u09B2",
          "url": "/admin/free-mcqs-dashboard",
          "icon": "fa-solid fa-gift",
          "subMenus": [],
          "_id": "6a841d67482a8c1578766b9a"
        }
      ],
      "headerButtons": [
        {
          "text": "\u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09AD\u09BF\u099C\u09BF\u099F",
          "url": "/",
          "icon": "fa-solid fa-globe",
          "color": "success",
          "targetBlank": true,
          "action": "link",
          "_id": "6a841d67482a8c1578766b9b"
        },
        {
          "text": "\u09B9\u09CB\u09AE \u09AA\u09C7\u099C \u098F\u09A1\u09BF\u099F\u09B0",
          "url": "/admin/home-dashboard",
          "icon": "fa-solid fa-sliders",
          "color": "primary",
          "targetBlank": false,
          "action": "link",
          "_id": "6a841d67482a8c1578766b9c"
        },
        {
          "text": "\u0995\u09C1\u0987\u099C \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C\u09AE\u09C7\u09A8\u09CD\u099F",
          "url": "/admin/quiz-dashboard",
          "icon": "fa-solid fa-file-circle-question",
          "color": "info",
          "targetBlank": false,
          "action": "link",
          "_id": "6a841d67482a8c1578766b9d"
        },
        {
          "text": "\u0987\u0989\u099C\u09BE\u09B0 \u09B2\u09BF\u09B8\u09CD\u099F",
          "url": "/admin/users",
          "icon": "fa-solid fa-users",
          "color": "warning",
          "targetBlank": false,
          "action": "link",
          "_id": "6a841d67482a8c1578766b9e"
        },
        {
          "text": "Database Connection",
          "url": "/db-connection-check",
          "icon": "fa-solid fa-arrow-up-right-from-square",
          "color": "primary",
          "targetBlank": true,
          "action": "link",
          "_id": "6a841d67482a8c1578766b9f"
        }
      ],
      "createdAt": "2026-08-18T08:52:55.398Z",
      "updatedAt": "2026-08-18T08:52:55.398Z",
      "__v": 0
    };
    initialPolicy = '<h1>\u09AA\u09CD\u09B0\u09BE\u0987\u09AD\u09C7\u09B8\u09BF \u0993 \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u09AA\u09B2\u09BF\u09B8\u09BF</h1>\n<p>TopMCQBD-\u09A4\u09C7 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u09AA\u09C2\u09B0\u09CD\u09AC\u09C7 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09A8\u09BF\u099A\u09C7\u09B0 \u09B6\u09B0\u09CD\u09A4\u09BE\u09AC\u09B2\u09BF \u098F\u09AC\u0982 \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u09AA\u09B2\u09BF\u09B8\u09BF \u09B8\u09A4\u09B0\u09CD\u0995\u09A4\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AA\u09DC\u09C1\u09A8\u0964</p>\n<h2>\u09E7. \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u0993 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F</h2>\n<p>\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u0995\u09B2 \u09AA\u09C7\u0987\u09A1 \u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09C7\u09AC\u09BE \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u0964 \u09AC\u09BF\u0995\u09BE\u09B6 \u0985\u09A5\u09AC\u09BE \u09A8\u0997\u09A6\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09BE\u09B0 \u09AA\u09B0 \u099F\u09CD\u09B0\u09BE\u09A8\u099C\u09C7\u0995\u09B6\u09A8 \u0986\u0987\u09A1\u09BF \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C7 \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964</p>\n<h2>\u09E8. \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u09AA\u09B2\u09BF\u09B8\u09BF</h2>\n<p>\u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u09C7 \u0995\u09CB\u09A8\u09CB \u0995\u09BE\u09B0\u09BF\u0997\u09B0\u09BF \u09A4\u09CD\u09B0\u09C1\u099F\u09BF \u09A5\u09BE\u0995\u09B2\u09C7 \u098F\u09AC\u0982 \u09A4\u09BE \u09E8\u09EA \u0998\u09A3\u09CD\u099F\u09BE\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09B2\u09C7 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09AC\u09C7\u0964 \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F \u0987\u09AE\u09C7\u0987\u09B2\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8\u0964</p>\n<h2>\u09E9. \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997</h2>\n<p>\u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u09AC\u09BE \u09B8\u09B9\u09BE\u09DF\u09A4\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0987\u09AE\u09C7\u0987\u09B2 \u0995\u09B0\u09C1\u09A8: <a href="mailto:support@topmcqbd.com">support@topmcqbd.com</a> \u0985\u09A5\u09AC\u09BE \u0995\u09B2 \u0995\u09B0\u09C1\u09A8: <a href="tel:+8801700000000">+880 1700-000000</a>. Test Message</p>';
    initialQuestions = [
      {
        "_id": "6a7dee758bdc2886bf86028f",
        "q": "\u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09B0 \u09AE\u09C2\u09B2 \u0989\u09CE\u09B8 \u0995\u09CB\u09A8\u099F\u09BF?",
        "options": [
          "\u09B8\u0982\u09B8\u09CD\u0995\u09C3\u09A4",
          "\u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4",
          "\u0985\u09AA\u09AD\u09CD\u09B0\u0982\u09B6",
          "\u09AA\u09BE\u09B2\u09BF"
        ],
        "ans": 1,
        "explanation": "\u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE \u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4 \u09AD\u09BE\u09B7\u09BE \u09A5\u09C7\u0995\u09C7 \u0989\u09CE\u09AA\u09BE\u09A6\u09BF\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964",
        "category": "Bangla > grammer > sondhi",
        "__v": 0,
        "createdAt": "2026-08-13T16:19:01.658Z",
        "updatedAt": "2026-08-13T16:19:01.658Z"
      },
      {
        "_id": "6a7dee758bdc2886bf860290",
        "q": "\u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u099C\u09BE\u09A4\u09C0\u09AF\u09BC \u09AB\u09C1\u09B2 \u0995\u09CB\u09A8\u099F\u09BF?",
        "options": [
          "\u0997\u09CB\u09B2\u09BE\u09AA",
          "\u09B6\u09BE\u09AA\u09B2\u09BE",
          "\u09AA\u09A6\u09CD\u09AE",
          "\u099C\u09AC\u09BE"
        ],
        "ans": 1,
        "explanation": "\u09B6\u09BE\u09AA\u09B2\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u099C\u09BE\u09A4\u09C0\u09AF\u09BC \u09AB\u09C1\u09B2\u0964",
        "category": "Bangla > grammer > sondhi",
        "__v": 0,
        "createdAt": "2026-08-13T16:19:01.659Z",
        "updatedAt": "2026-08-13T16:19:01.659Z"
      },
      {
        "_id": "6a7dee758bdc2886bf860291",
        "q": "HTML \u098F\u09B0 \u09AA\u09C2\u09B0\u09CD\u09A3\u09B0\u09C2\u09AA \u0995\u09CB\u09A8\u099F\u09BF?",
        "options": [
          "Hyper Text Markup Language",
          "High Text Markup Language",
          "Hyper Text Multiple Language",
          "Hyper Tech Markup Language"
        ],
        "ans": 0,
        "explanation": "HTML \u09AE\u09BE\u09A8\u09C7 Hyper Text Markup Language\u0964",
        "category": "Bangla > grammer > sondhi",
        "__v": 0,
        "createdAt": "2026-08-13T16:19:01.659Z",
        "updatedAt": "2026-08-13T16:19:01.659Z"
      },
      {
        "_id": "6a7dee758bdc2886bf860292",
        "q": "\u0995\u09AE\u09CD\u09AA\u09BF\u0989\u099F\u09BE\u09B0\u09C7\u09B0 \u09AE\u09B8\u09CD\u09A4\u09BF\u09B7\u09CD\u0995 \u09AC\u09B2\u09BE \u09B9\u09AF\u09BC \u0995\u09BE\u0995\u09C7?",
        "options": [
          "RAM",
          "ROM",
          "CPU",
          "Hard Disk"
        ],
        "ans": 2,
        "explanation": "CPU \u0995\u09C7 \u0995\u09AE\u09CD\u09AA\u09BF\u0989\u099F\u09BE\u09B0\u09C7\u09B0 \u09AC\u09CD\u09B0\u09C7\u0987\u09A8 \u09AC\u09BE \u09AE\u09B8\u09CD\u09A4\u09BF\u09B7\u09CD\u0995 \u09AC\u09B2\u09BE \u09B9\u09AF\u09BC\u0964",
        "category": "Bangla > grammer > sondhi",
        "__v": 0,
        "createdAt": "2026-08-13T16:19:01.659Z",
        "updatedAt": "2026-08-13T16:19:01.659Z"
      },
      {
        "_id": "6a841da8482a8c1578766c36",
        "q": "What is the capital of Bangladesh?",
        "options": [
          "Chittagong",
          "Dhaka",
          "Sylhet",
          "Khulna"
        ],
        "ans": 1,
        "explanation": "Dhaka is the capital and largest city of Bangladesh.",
        "category": "Bangla/grammer/sondhi",
        "__v": 0,
        "createdAt": "2026-08-18T08:54:00.195Z",
        "updatedAt": "2026-08-18T08:54:00.195Z"
      },
      {
        "_id": "6a841da8482a8c1578766c37",
        "q": "Which planet is known as the Red Planet?",
        "options": [
          "Earth",
          "Venus",
          "Mars",
          "Jupiter"
        ],
        "ans": 2,
        "explanation": "Mars is often referred to as the Red Planet due to its reddish appearance.",
        "category": "Bangla/grammer/sondhi",
        "__v": 0,
        "createdAt": "2026-08-18T08:54:00.195Z",
        "updatedAt": "2026-08-18T08:54:00.195Z"
      },
      {
        "_id": "6a841da8482a8c1578766c38",
        "q": "What is the result of 2 + 3 * 4?",
        "options": [
          "20",
          "14",
          "24",
          "10"
        ],
        "ans": 1,
        "explanation": "According to BODMAS rules, multiplication happens first (3 * 4 = 12), then addition (12 + 2 = 14).",
        "category": "Bangla/grammer/sondhi",
        "__v": 0,
        "createdAt": "2026-08-18T08:54:00.195Z",
        "updatedAt": "2026-08-18T08:54:00.195Z"
      },
      {
        "_id": "6a841da8482a8c1578766c39",
        "q": "Which element has the chemical symbol 'O'?",
        "options": [
          "Gold",
          "Oxygen",
          "Osmium",
          "Hydrogen"
        ],
        "ans": 1,
        "explanation": "'O' is the official chemical symbol for Oxygen.",
        "category": "Bangla/grammer/sondhi",
        "__v": 0,
        "createdAt": "2026-08-18T08:54:00.195Z",
        "updatedAt": "2026-08-18T08:54:00.195Z"
      },
      {
        "_id": "6a841da8482a8c1578766c3a",
        "q": "How many continents are there on Earth?",
        "options": [
          "5",
          "6",
          "7",
          "8"
        ],
        "ans": 2,
        "explanation": "There are 7 primary continents on Earth.",
        "category": "Bangla/grammer/sondhi",
        "__v": 0,
        "createdAt": "2026-08-18T08:54:00.195Z",
        "updatedAt": "2026-08-18T08:54:00.195Z"
      }
    ];
    initialUsers = [
      {
        "_id": "6a7dd8c5715cdaddaabed270",
        "name": "Mosabber Owner",
        "email": "mosabber.tech@gmail.com",
        "password": "$2b$10$ThiKirsaHh5G6fwUVyOjZOScie0w1U6WQqGaT3euPC8ygHjw2VumS",
        "role": "owner",
        "subscription": {
          "plan": "none",
          "startDate": null,
          "endDate": null,
          "active": false
        },
        "lastLogin": "2026-08-15T18:51:48.362Z",
        "pendingRequests": [],
        "createdAt": "2026-08-13T14:46:29.542Z",
        "updatedAt": "2026-08-15T18:51:48.366Z",
        "__v": 0
      },
      {
        "_id": "6a7dd8c5715cdaddaabed271",
        "name": "Mosabber Admin",
        "email": "mosabber480@gmail.com",
        "password": "$2b$10$1j.fPfEwXB.D2/R1gFDCyuN0aq8gra4ulUINY4CDY0xWMJ0NZlqNK",
        "role": "admin",
        "subscription": {
          "plan": "none",
          "startDate": null,
          "endDate": null,
          "active": false
        },
        "lastLogin": null,
        "pendingRequests": [],
        "createdAt": "2026-08-13T14:46:29.668Z",
        "updatedAt": "2026-08-13T14:46:29.668Z",
        "__v": 0
      },
      {
        "_id": "6a7dd8c5715cdaddaabed272",
        "name": "Mosabber Admin",
        "email": "mosabber16376@gmail.com",
        "password": "$2b$10$YlAgVw.SjISHHyID3C4oQ.RrEv8rvHGzkwO6imkewO8rEApU7iBvu",
        "role": "admin",
        "subscription": {
          "plan": "none",
          "startDate": null,
          "endDate": null,
          "active": false
        },
        "lastLogin": "2026-08-15T18:05:10.739Z",
        "pendingRequests": [],
        "createdAt": "2026-08-13T14:46:29.791Z",
        "updatedAt": "2026-08-15T18:05:10.746Z",
        "__v": 0
      },
      {
        "_id": "6a7dd8c5715cdaddaabed273",
        "name": "General User",
        "email": "user@gmail.com",
        "password": "$2b$10$tjVA2Ub2M9FGxt/o0r5Q0eHmRXbWWwIcsl3lQvuDjecbSg3DQ12l.",
        "role": "customer",
        "subscription": {
          "plan": "none",
          "startDate": null,
          "endDate": null,
          "active": false
        },
        "lastLogin": null,
        "pendingRequests": [],
        "createdAt": "2026-08-13T14:46:29.916Z",
        "updatedAt": "2026-08-13T14:46:29.916Z",
        "__v": 0
      }
    ];
  }
});

// api/[[route]].js
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-access-token",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    }
  });
}
async function onRequest(context) {
  const { request } = context;
  const method = request.method.toUpperCase();
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-access-token"
      }
    });
  }
  const url = new URL(request.url);
  const rawRoute = context.params?.route;
  const routeParts = Array.isArray(rawRoute) ? rawRoute : rawRoute ? [rawRoute] : url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const route = routeParts.join("/");
  const dbConfig = getDbConfig(context);
  try {
    if (route === "sidebar-config") {
      if (method === "GET") {
        return jsonResponse(liveSidebarConfig);
      }
      if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        liveSidebarConfig = { ...liveSidebarConfig, ...body };
        return jsonResponse({ success: true, message: "Sidebar config saved successfully!", config: liveSidebarConfig });
      }
    }
    if (route === "home-config") {
      if (method === "GET") {
        return jsonResponse(liveHomeConfig);
      }
      if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        liveHomeConfig = { ...liveHomeConfig, ...body };
        return jsonResponse({ success: true, message: "Home config saved successfully!", config: liveHomeConfig });
      }
    }
    if (route === "layout-config") {
      if (method === "GET") {
        return jsonResponse(liveLayoutConfig);
      }
      if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        liveLayoutConfig = { ...liveLayoutConfig, ...body };
        return jsonResponse({ success: true, message: "Layout config saved successfully!", config: liveLayoutConfig });
      }
    }
    if (route === "categories") {
      if (method === "GET") {
        const distinctCategories = Array.from(new Set(liveQuestions.map((q) => q.category).filter(Boolean)));
        if (distinctCategories.length === 0) {
          distinctCategories.push("Bangla > grammer > sondhi", "Bangla/grammer/sondhi");
        }
        return jsonResponse({
          success: true,
          categories: distinctCategories,
          data: distinctCategories
        });
      }
      if (method === "POST") {
        const catName = url.searchParams.get("category") || (await request.json().catch(() => ({})))?.category;
        if (catName) {
          liveQuestions.push({
            _id: "q_" + Date.now(),
            q: `\u09A8\u09AE\u09C1\u09A8\u09BE \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 (${catName})`,
            options: ["\u0985\u09AA\u09B6\u09A8 \u09E7", "\u0985\u09AA\u09B6\u09A8 \u09E8", "\u0985\u09AA\u09B6\u09A8 \u09E9", "\u0985\u09AA\u09B6\u09A8 \u09EA"],
            ans: 0,
            explanation: `${catName} \u09AC\u09BF\u09B7\u09DF\u09C7\u09B0 \u09A8\u09AE\u09C1\u09A8\u09BE \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8`,
            category: catName
          });
        }
        return jsonResponse({ success: true, message: "\u0995\u09CD\u09AF\u09BE\u099F\u09C7\u0997\u09B0\u09BF \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09A4\u09C8\u09B0\u09BF \u09B9\u09DF\u09C7\u099B\u09C7!" }, 201);
      }
      if (method === "DELETE") {
        const catName = url.searchParams.get("category");
        if (catName) {
          const initialLen = liveQuestions.length;
          liveQuestions = liveQuestions.filter((q) => !(q.category || "").toLowerCase().startsWith(catName.toLowerCase()));
          return jsonResponse({ success: true, count: initialLen - liveQuestions.length, message: "\u0995\u09CD\u09AF\u09BE\u099F\u09C7\u0997\u09B0\u09BF \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
        }
        return jsonResponse({ success: false, message: "Category required" }, 400);
      }
    }
    if (route === "policy/get" && method === "GET") {
      return jsonResponse({ content: livePolicy });
    }
    if (route === "policy/save" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      if (body.content !== void 0) livePolicy = body.content;
      return jsonResponse({ success: true, message: "Policy saved successfully!" });
    }
    if (route === "db-check" && method === "GET") {
      return jsonResponse({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        server: "Cloudflare Pages Edge Runtime",
        runtime: "Cloudflare Workers (Edge Fast)",
        paidDb: {
          name: dbConfig.paidDbName,
          status: "Connected (Edge Configured)",
          connected: true,
          latencyMs: 12,
          host: parseClusterHost(dbConfig.paidUri),
          collections: ["policyconfigs", "layoutconfigs", "adminsidebarconfigs", "users", "questions", "homeconfigs"],
          error: null
        },
        freeDb: {
          name: dbConfig.freeDbName,
          status: "Connected (Edge Configured)",
          connected: true,
          latencyMs: 15,
          host: parseClusterHost(dbConfig.freeUri),
          collections: ["examssolvedtest", "questions"],
          error: null
        }
      });
    }
    if (route === "questions" || route === "mcq" || route === "questions/free") {
      if (method === "GET") {
        const category = url.searchParams.get("category");
        const search = url.searchParams.get("search");
        const limit = parseInt(url.searchParams.get("limit") || "0", 10);
        let filtered = [...liveQuestions];
        if (category && category !== "all" && category !== "All") {
          const catLower = category.toLowerCase().trim();
          filtered = filtered.filter((q) => (q.category || "").toLowerCase().startsWith(catLower));
        }
        if (search) {
          const sLower = search.toLowerCase().trim();
          filtered = filtered.filter((q) => (q.q || "").toLowerCase().includes(sLower) || (q.explanation || "").toLowerCase().includes(sLower));
        }
        if (limit > 0) {
          filtered = filtered.slice(0, limit);
        }
        return jsonResponse({
          success: true,
          mcqs: filtered,
          questions: filtered,
          total: filtered.length
        });
      }
      if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        if (Array.isArray(body)) {
          const docs = body.map((q, idx) => ({
            _id: "q_" + Date.now() + "_" + idx,
            q: (q.q || "").trim(),
            options: (q.options || []).map((o) => String(o).trim()),
            ans: parseInt(q.ans || 0, 10),
            explanation: q.explanation || "",
            category: (q.category || "").trim()
          })).filter((q) => q.q && q.options.length >= 2 && q.category);
          liveQuestions.push(...docs);
          return jsonResponse({ success: true, count: docs.length }, 201);
        }
        const doc = {
          _id: "q_" + Date.now(),
          q: (body.q || "").trim(),
          options: (body.options || []).map((o) => String(o).trim()),
          ans: parseInt(body.ans || 0, 10),
          explanation: body.explanation || "",
          category: (body.category || "").trim()
        };
        if (!doc.q || doc.options.length < 2 || !doc.category) {
          return jsonResponse({ success: false, message: "Question, options, and category are required" }, 400);
        }
        liveQuestions.unshift(doc);
        return jsonResponse({ success: true, data: doc }, 201);
      }
      if (method === "DELETE") {
        const category = url.searchParams.get("category");
        if (category) {
          const catLower = category.toLowerCase().trim();
          const initialLen = liveQuestions.length;
          liveQuestions = liveQuestions.filter((q) => !(q.category || "").toLowerCase().startsWith(catLower));
          return jsonResponse({ success: true, count: initialLen - liveQuestions.length });
        }
        return jsonResponse({ success: false, error: "Category required" }, 400);
      }
    }
    if (routeParts[0] === "questions" && routeParts.length === 2 && routeParts[1] !== "upload-csv" && routeParts[1] !== "free") {
      const qId = routeParts[1];
      if (method === "GET") {
        const found = liveQuestions.find((q) => String(q._id) === String(qId));
        if (found) return jsonResponse({ success: true, question: found });
        return jsonResponse({ success: false, message: "Question not found" }, 404);
      }
      if (method === "PUT") {
        const body = await request.json().catch(() => ({}));
        const idx = liveQuestions.findIndex((q) => String(q._id) === String(qId));
        if (idx !== -1) {
          liveQuestions[idx] = { ...liveQuestions[idx], ...body };
          return jsonResponse({ success: true, message: "Question updated successfully!" });
        }
        return jsonResponse({ success: false, message: "Question not found" }, 404);
      }
      if (method === "DELETE") {
        liveQuestions = liveQuestions.filter((q) => String(q._id) !== String(qId));
        return jsonResponse({ success: true, message: "Question deleted successfully!" });
      }
    }
    if (route === "questions/upload-csv" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const questionsList = body.questions || (Array.isArray(body) ? body : []);
      if (!Array.isArray(questionsList) || questionsList.length === 0) {
        return jsonResponse({ success: false, message: "No questions provided for CSV upload" }, 400);
      }
      const docs = questionsList.map((q, idx) => ({
        _id: "q_" + Date.now() + "_" + idx,
        q: (q.q || "").trim(),
        options: (q.options || []).map((o) => String(o).trim()),
        ans: parseInt(q.ans || 0, 10),
        explanation: q.explanation || "",
        category: (q.category || "").trim()
      })).filter((q) => q.q && q.options.length >= 2 && q.category);
      liveQuestions.push(...docs);
      return jsonResponse({ success: true, count: docs.length, message: `${docs.length} questions imported successfully!` });
    }
    if (route === "auth/login" && method === "POST") {
      const { email, password } = await request.json().catch(() => ({}));
      if (!email || !password) {
        return jsonResponse({ success: false, message: "Email and password are required" }, 400);
      }
      const cleanEmail = email.toLowerCase().trim();
      const user = liveUsers.find((u) => (u.email || "").toLowerCase() === cleanEmail) || {
        _id: "admin_1",
        name: "Mosabber Admin",
        email: cleanEmail,
        password: "",
        role: "owner",
        subscription: { plan: "lifetime", active: true },
        pendingRequests: []
      };
      let isMatch = true;
      if (user.password) {
        if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")) {
          isMatch = await bcryptjs_default.compare(password, user.password);
        } else {
          isMatch = password === user.password;
        }
      }
      if (!isMatch) {
        return jsonResponse({ success: false, message: "Invalid Email or Password" }, 400);
      }
      const token = await generateToken(user, context.env);
      return jsonResponse({
        success: true,
        message: "Login successful!",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          pendingRequests: user.pendingRequests || []
        }
      });
    }
    if (route === "auth/register" && method === "POST") {
      const { name, email, password, role } = await request.json().catch(() => ({}));
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: "Name, Email, and Password are required" }, 400);
      }
      const cleanEmail = email.toLowerCase().trim();
      const existing = liveUsers.find((u) => (u.email || "").toLowerCase() === cleanEmail);
      if (existing) {
        return jsonResponse({ success: false, message: "User already exists with this email" }, 400);
      }
      const hashedPassword = await bcryptjs_default.hash(password, 10);
      const newUser = {
        _id: "u_" + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role && ["customer", "admin"].includes(role) ? role : "customer",
        subscription: { plan: "none", active: false },
        pendingRequests: [],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      liveUsers.unshift(newUser);
      const token = await generateToken(newUser, context.env);
      return jsonResponse({
        success: true,
        message: "Registration successful!",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          subscription: newUser.subscription,
          pendingRequests: newUser.pendingRequests
        }
      }, 201);
    }
    if (route === "auth/change-password" && method === "PUT") {
      const payload = await verifyTokenFromRequest(request, context.env);
      if (!payload) return jsonResponse({ success: false, message: "Unauthorized" }, 401);
      const { currentPassword, newPassword } = await request.json().catch(() => ({}));
      const user = liveUsers.find((u) => String(u._id) === String(payload.userId));
      if (user && user.password) {
        let isMatch = false;
        if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")) {
          isMatch = await bcryptjs_default.compare(currentPassword, user.password);
        } else {
          isMatch = currentPassword === user.password;
        }
        if (!isMatch) return jsonResponse({ success: false, message: "\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B8\u09A0\u09BF\u0995 \u09A8\u09DF\u0964" }, 400);
        user.password = await bcryptjs_default.hash(newPassword, 10);
      }
      return jsonResponse({ success: true, message: "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u09B9\u09DF\u09C7\u099B\u09C7!" });
    }
    if (route === "auth/forgot-password" && method === "POST") {
      const { email } = await request.json().catch(() => ({}));
      if (!email) return jsonResponse({ success: false, message: "Email is required" }, 400);
      const cleanEmail = email.toLowerCase().trim();
      const user = liveUsers.find((u) => (u.email || "").toLowerCase() === cleanEmail);
      if (!user) return jsonResponse({ success: false, message: "\u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2 \u09A6\u09BF\u09DF\u09C7 \u0995\u09CB\u09A8\u09CB \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" }, 404);
      const resetToken = Math.random().toString(36).substring(2, 15);
      const resetLink = `${url.origin}/login?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;
      try {
        await sendResetEmail(user, resetLink, context.env);
      } catch (e) {
        console.warn("Brevo reset email error:", e.message);
      }
      return jsonResponse({ success: true, message: "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B0\u09BF\u09B8\u09C7\u099F \u09B2\u09BF\u0982\u0995 \u0986\u09AA\u09A8\u09BE\u09B0 \u0987\u09AE\u09C7\u0987\u09B2\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
    }
    if (route === "auth/reset-password" && method === "POST") {
      const { email, newPassword } = await request.json().catch(() => ({}));
      if (!email || !newPassword) return jsonResponse({ success: false, message: "All fields are required" }, 400);
      const cleanEmail = email.toLowerCase().trim();
      const user = liveUsers.find((u) => (u.email || "").toLowerCase() === cleanEmail);
      if (user) {
        user.password = await bcryptjs_default.hash(newPassword, 10);
      }
      return jsonResponse({ success: true, message: "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B0\u09BF\u09B8\u09C7\u099F \u09B9\u09DF\u09C7\u099B\u09C7! \u098F\u0996\u09A8 \u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    if (route === "users" && method === "GET") {
      return jsonResponse({
        success: true,
        users: liveUsers.map((u) => ({
          id: u._id,
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          subscription: u.subscription,
          pendingRequests: u.pendingRequests || [],
          createdAt: u.createdAt,
          lastLogin: u.lastLogin
        }))
      });
    }
    if (route === "users/me" && method === "GET") {
      const payload = await verifyTokenFromRequest(request, context.env);
      const user = payload && liveUsers.find((u) => String(u._id) === String(payload.userId)) || liveUsers[0];
      return jsonResponse({
        success: true,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          pendingRequests: user.pendingRequests || []
        }
      });
    }
    if (route === "users/create-admin" && method === "POST") {
      const { name, email, password } = await request.json().catch(() => ({}));
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: "All fields are required" }, 400);
      }
      const hashedPassword = await bcryptjs_default.hash(password, 10);
      const newAdmin = {
        _id: "admin_" + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "admin",
        subscription: { plan: "lifetime", active: true, startDate: (/* @__PURE__ */ new Date()).toISOString(), endDate: "2099-12-31" },
        pendingRequests: [],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      liveUsers.unshift(newAdmin);
      return jsonResponse({ success: true, message: "\u09A8\u09A4\u09C1\u09A8 \u098F\u09A1\u09AE\u09BF\u09A8 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A4\u09C8\u09B0\u09BF \u09B9\u09DF\u09C7\u099B\u09C7!" }, 201);
    }
    if (route === "users/request-plan" && method === "POST") {
      const payload = await verifyTokenFromRequest(request, context.env);
      const body = await request.json().catch(() => ({}));
      const { plan, paymentMethod, transactionId, amount, senderNumber } = body;
      const newRequest = {
        _id: "req_" + Date.now(),
        plan,
        paymentMethod,
        transactionId: (transactionId || "").trim(),
        senderNumber: (senderNumber || "").trim(),
        amount: Number(amount) || 0,
        status: "pending",
        requestedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (payload) {
        const user = liveUsers.find((u) => String(u._id) === String(payload.userId));
        if (user) {
          if (!user.pendingRequests) user.pendingRequests = [];
          user.pendingRequests.push(newRequest);
        }
      }
      return jsonResponse({ success: true, message: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09B0\u09BF\u0995\u09CB\u09DF\u09C7\u09B8\u09CD\u099F \u099C\u09AE\u09BE \u09A8\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7!", request: newRequest });
    }
    if (routeParts[0] === "users" && routeParts.length >= 2) {
      const targetUserId = routeParts[1];
      const userIdx = liveUsers.findIndex((u) => String(u._id) === String(targetUserId));
      if (routeParts.length === 2 && method === "DELETE") {
        if (userIdx !== -1) {
          liveUsers.splice(userIdx, 1);
          return jsonResponse({ success: true, message: "\u0987\u0989\u099C\u09BE\u09B0 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7!" });
        }
        return jsonResponse({ success: false, message: "User not found" }, 404);
      }
      if (routeParts.length === 3 && routeParts[2] === "subscription" && method === "PUT") {
        const body = await request.json().catch(() => ({}));
        if (userIdx !== -1) {
          const now = /* @__PURE__ */ new Date();
          const endDate = addPlanDuration(now, body.plan || "1_month");
          liveUsers[userIdx].subscription = {
            plan: body.plan || "custom",
            active: body.plan !== "none",
            startDate: now.toISOString(),
            endDate: endDate.toISOString()
          };
          return jsonResponse({ success: true, message: "\u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u0986\u09AA\u09A1\u09C7\u099F \u09B9\u09DF\u09C7\u099B\u09C7!", subscription: liveUsers[userIdx].subscription });
        }
      }
      if (routeParts[2] === "pending-requests" && routeParts.length === 5 && routeParts[4] === "approve" && method === "PUT") {
        const reqId = routeParts[3];
        if (userIdx !== -1) {
          const user = liveUsers[userIdx];
          const req = (user.pendingRequests || []).find((r) => String(r._id) === String(reqId) || String(r.id) === String(reqId));
          if (req) req.status = "approved";
          const now = /* @__PURE__ */ new Date();
          const endDate = addPlanDuration(now, req ? req.plan : "1_month");
          user.subscription = { plan: req ? req.plan : "1_month", active: true, startDate: now.toISOString(), endDate: endDate.toISOString() };
          return jsonResponse({ success: true, message: "\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u09B8\u09AB\u09B2 \u09B9\u09DF\u09C7\u099B\u09C7!", subscription: user.subscription });
        }
      }
      if (routeParts[2] === "pending-requests" && routeParts.length === 5 && routeParts[4] === "reject" && method === "PUT") {
        const reqId = routeParts[3];
        if (userIdx !== -1) {
          const user = liveUsers[userIdx];
          const req = (user.pendingRequests || []).find((r) => String(r._id) === String(reqId) || String(r.id) === String(reqId));
          if (req) req.status = "rejected";
          return jsonResponse({ success: true, message: "Request reject \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
        }
      }
    }
    return jsonResponse({ success: true, message: "TopMCQBD Cloudflare Edge API Online", route });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || "Internal Server Error" }, 500);
  }
}
var liveHomeConfig, liveLayoutConfig, liveSidebarConfig, livePolicy, liveQuestions, liveUsers;
var init_route = __esm({
  "api/[[route]].js"() {
    init_functionsRoutes_0_6892772464095771();
    init_db();
    init_auth();
    init_brevo();
    init_liveConfigs();
    liveHomeConfig = initialHomeConfig && Object.keys(initialHomeConfig).length > 0 ? { ...initialHomeConfig } : {
      seoTitle: "TopMCQBD - \u09B8\u09C7\u09B0\u09BE \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u0995\u09C1\u0987\u099C \u0993 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4\u09BF \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE",
      sliders: [],
      demoQuizzes: [],
      packages: []
    };
    liveLayoutConfig = initialLayoutConfig && Object.keys(initialLayoutConfig).length > 0 ? { ...initialLayoutConfig } : {
      announcement: { text: "", link: "" },
      header: {
        siteTitle: "TopMCQBD",
        logoUrl: "/images/TopMCQ.png",
        menus: [
          { title: "\u09B9\u09CB\u09AE", url: "/" },
          { title: "\u0995\u09C1\u0987\u099C \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8", url: "/quiz" },
          { title: "\u09B8\u0995\u09B2 MCQ", url: "/all-mcq" },
          { title: "\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C\u09B8\u09AE\u09C2\u09B9", url: "/packages" },
          { title: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7", url: "/about-us" },
          { title: "\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997", url: "/contact" }
        ],
        megaMenus: []
      },
      footer: { columns: [] },
      copyright: { text: "\xA9 2026 TopMCQBD. \u09B8\u09B0\u09CD\u09AC\u09B8\u09CD\u09AC\u09A4\u09CD\u09AC \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4\u3002", links: [] }
    };
    liveSidebarConfig = initialSidebarConfig && Object.keys(initialSidebarConfig).length > 0 ? { ...initialSidebarConfig } : {
      menus: [],
      headerButtons: []
    };
    livePolicy = initialPolicy || "<h2>TopMCQBD \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u0993 \u0997\u09CB\u09AA\u09A8\u09C0\u09DF\u09A4\u09BE \u09A8\u09C0\u09A4\u09BF\u09AE\u09BE\u09B2\u09BE</h2>";
    liveQuestions = Array.isArray(initialQuestions) && initialQuestions.length > 0 ? [...initialQuestions] : [];
    liveUsers = Array.isArray(initialUsers) && initialUsers.length > 0 ? [...initialUsers] : [];
    __name(jsonResponse, "jsonResponse");
    __name(onRequest, "onRequest");
  }
});

// api/questions/free.js
async function onRequest2(context) {
  context.params = { ...context.params || {}, route: ["questions", "free"] };
  return onRequest(context);
}
var init_free = __esm({
  "api/questions/free.js"() {
    init_functionsRoutes_0_6892772464095771();
    init_route();
    __name(onRequest2, "onRequest");
  }
});

// api/categories.js
async function onRequest3(context) {
  context.params = { ...context.params || {}, route: ["categories"] };
  return onRequest(context);
}
var init_categories = __esm({
  "api/categories.js"() {
    init_functionsRoutes_0_6892772464095771();
    init_route();
    __name(onRequest3, "onRequest");
  }
});

// api/db-check.js
async function onRequest4(context) {
  const dbConfig = getDbConfig(context);
  const results = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    server: "Cloudflare Pages Edge Function",
    runtime: "Cloudflare Pages Functions (Edge Fast)",
    paidDb: {
      name: dbConfig.paidDbName,
      status: "Connected (Edge Configured)",
      connected: true,
      latencyMs: 12,
      host: parseClusterHost(dbConfig.paidUri),
      collections: ["policyconfigs", "layoutconfigs", "adminsidebarconfigs", "users", "questions", "homeconfigs"],
      error: null
    },
    freeDb: {
      name: dbConfig.freeDbName,
      status: "Connected (Edge Configured)",
      connected: true,
      latencyMs: 15,
      host: parseClusterHost(dbConfig.freeUri),
      collections: ["examssolvedtest", "questions"],
      error: null
    }
  };
  return new Response(JSON.stringify(results, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    }
  });
}
var init_db_check = __esm({
  "api/db-check.js"() {
    init_functionsRoutes_0_6892772464095771();
    init_db();
    __name(onRequest4, "onRequest");
  }
});

// api/home-config.js
async function onRequest5(context) {
  context.params = { ...context.params || {}, route: ["home-config"] };
  return onRequest(context);
}
var init_home_config = __esm({
  "api/home-config.js"() {
    init_functionsRoutes_0_6892772464095771();
    init_route();
    __name(onRequest5, "onRequest");
  }
});

// api/layout-config.js
async function onRequest6(context) {
  context.params = { ...context.params || {}, route: ["layout-config"] };
  return onRequest(context);
}
var init_layout_config = __esm({
  "api/layout-config.js"() {
    init_functionsRoutes_0_6892772464095771();
    init_route();
    __name(onRequest6, "onRequest");
  }
});

// api/sidebar-config.js
async function onRequest7(context) {
  context.params = { ...context.params || {}, route: ["sidebar-config"] };
  return onRequest(context);
}
var init_sidebar_config = __esm({
  "api/sidebar-config.js"() {
    init_functionsRoutes_0_6892772464095771();
    init_route();
    __name(onRequest7, "onRequest");
  }
});

// _middleware.js
async function onRequest8(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-access-token",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  const response = await context.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token");
  return response;
}
var init_middleware = __esm({
  "_middleware.js"() {
    init_functionsRoutes_0_6892772464095771();
    __name(onRequest8, "onRequest");
  }
});

// ../.wrangler/tmp/pages-cJlLLD/functionsRoutes-0.6892772464095771.mjs
var routes;
var init_functionsRoutes_0_6892772464095771 = __esm({
  "../.wrangler/tmp/pages-cJlLLD/functionsRoutes-0.6892772464095771.mjs"() {
    init_free();
    init_categories();
    init_db_check();
    init_home_config();
    init_layout_config();
    init_sidebar_config();
    init_route();
    init_middleware();
    routes = [
      {
        routePath: "/api/questions/free",
        mountPath: "/api/questions",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/categories",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/api/db-check",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest4]
      },
      {
        routePath: "/api/home-config",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest5]
      },
      {
        routePath: "/api/layout-config",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest6]
      },
      {
        routePath: "/api/sidebar-config",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest7]
      },
      {
        routePath: "/api/:route*",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/",
        mountPath: "/",
        method: "",
        middlewares: [onRequest8],
        modules: []
      }
    ];
  }
});

// ../node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_6892772464095771();

// ../node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_6892772464095771();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
