async function testFeedWithSearch() {
  try {
    const url = 'http://localhost:5000/api/properties?city=Govindpuram&bedrooms=3&limit=10';
    console.log('Testing feed with search (city=Govindpuram, bedrooms=3):', url);
    const res = await fetch(url);
    const json = await res.json();
    const props = json.data.properties;
    console.log(`Fetched ${props.length} properties.`);
    props.forEach((p, idx) => {
      console.log(`[${idx + 1}] ${p.isBoosted ? '🚀 [BOOSTED]' : '   [NORMAL] '} ${p.title} | City: ${p.address?.city} | BHK: ${p.bedrooms} | Price: ${p.priceText || p.priceValue} | Views: ${p.views || 0}`);
    });
  } catch (err) {
    console.error('Error during test:', err.message);
  }
}

testFeedWithSearch();
