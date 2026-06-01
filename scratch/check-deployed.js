const https = require('https');

https.get('https://salledevente.sn/shops/ja8prZVY5HMcqHUeU9rSoznAQHD2', (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('HTML length:', data.length);
    const hasSlugRef = data.includes('shopSlug');
    console.log('Contains "shopSlug":', hasSlugRef);
    
    // Let's find script tags in the HTML
    const regex = /<script[^>]*src="([^"]+)"/g;
    let match;
    console.log('Script bundles:');
    while ((match = regex.exec(data)) !== null) {
      console.log(match[1]);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
