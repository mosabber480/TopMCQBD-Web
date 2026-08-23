import https from 'https';

console.log('Fetching https://topmcqbd.pages.dev/api/db-check ...');
const req = https.get('https://topmcqbd.pages.dev/api/db-check', (res) => {
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
