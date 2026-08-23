import https from 'https';

const postData = JSON.stringify({
  email: 'mosabber480@gmail.com',
  password: 'admin123456'
});

const options = {
  hostname: 'topmcqbd.pages.dev',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Sending request to https://topmcqbd.pages.dev/api/auth/login ...');
const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response Body:\n', data);
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e.message);
});

req.write(postData);
req.end();
