import bcrypt from 'bcryptjs';

async function testBcryptPerformance() {
  const password = 'myPassword123';
  
  console.log('Testing bcrypt.hash with round 10...');
  const start10 = performance.now();
  const hash10 = await bcrypt.hash(password, 10);
  console.log(`Hash 10 took ${(performance.now() - start10).toFixed(2)}ms`);

  console.log('Testing bcrypt.compare with round 10 hash...');
  const startComp10 = performance.now();
  const match10 = await bcrypt.compare(password, hash10);
  console.log(`Compare 10 took ${(performance.now() - startComp10).toFixed(2)}ms (Match: ${match10})`);

  console.log('\nTesting bcrypt.hash with round 6...');
  const start6 = performance.now();
  const hash6 = await bcrypt.hash(password, 6);
  console.log(`Hash 6 took ${(performance.now() - start6).toFixed(2)}ms`);

  console.log('Testing bcrypt.compare with round 6 hash...');
  const startComp6 = performance.now();
  const match6 = await bcrypt.compare(password, hash6);
  console.log(`Compare 6 took ${(performance.now() - startComp6).toFixed(2)}ms (Match: ${match6})`);
}

testBcryptPerformance();
