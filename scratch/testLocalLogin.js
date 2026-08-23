async function testLoginApi() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mosabber.tech@gmail.com', password: 'ownerpassword1234' })
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', data);
  } catch (e) {
    console.error('FETCH ERROR:', e);
  }
}

testLoginApi();
