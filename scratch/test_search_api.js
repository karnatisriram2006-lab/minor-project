const http = require('http');

const testSearch = (path) => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', (err) => reject(err));
  });
};

(async () => {
  try {
    console.log('Testing Trip Search (Jaipur)...');
    const trips = await testSearch('/api/trips/search?q=Jaipur');
    console.log('Trips Result:', JSON.stringify(trips, null, 2));

    console.log('\nTesting User Search (Sriram)...');
    const users = await testSearch('/api/profile/search?q=Sriram');
    console.log('Users Result:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Test failed:', err.message);
  }
})();
