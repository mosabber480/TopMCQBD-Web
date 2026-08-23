async function testCloudflareLogin() {
  console.log('\n--- Testing /api/auth/login raw error text ---');
  try {
    const res = await fetch('http://localhost:8788/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mosabber480@gmail.com', password: 'admin123456' })
    });
    const status = res.status;
    const text = await res.text();
    console.log(`Status: ${status}`);
    console.log('Raw Response Text:\n', text);
  } catch (err) {
    console.error('Login fetch error:', err.message);
  }
}

testCloudflareLogin();
