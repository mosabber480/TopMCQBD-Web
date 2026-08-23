import bcrypt from 'bcryptjs';

async function testAuth() {
  try {
    const password = 'usertest22';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);

    // Test token generation logic
    const secret = 'topmcqbd_super_secret_jwt_key_2026';
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      userId: 'usr_123456',
      role: 'customer',
      subscription: { plan: 'none', active: false },
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    };

    function base64UrlEncode(str) {
      return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      enc.encode(dataToSign)
    );

    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const binaryStr = String.fromCharCode(...signatureArray);
    const signatureBase64 = base64UrlEncode(binaryStr);

    console.log('Generated Token:', `${dataToSign}.${signatureBase64}`);
  } catch (err) {
    console.error('Error in test:', err);
  }
}

testAuth();
