const fs = require('fs');

const fruitsToFix = [
  'Lemon', 'Blackberry', 'Date palm', 'Common fig', 'Grapefruit', 
  'Passion fruit', 'Peach', 'Rambutan', 'Raspberry', 'Carambola', 
  'Custard apple', 'Jackfruit', 'Lychee', 'Plum', 'Indian gooseberry', 
  'Apple', 'Banana', 'Mango', 'Orange (fruit)', 'Pomegranate', 
  'Watermelon', 'Grape', 'Papaya', 'Pineapple', 'Guava', 
  'Kiwifruit', 'Pitaya', 'Strawberry', 'Blueberry', 'Avocado', 
  'Sapodilla', 'Cherry', 'Pear'
];

const fruitNameMap = {
  'Lemon': 'Lemon',
  'Blackberry': 'Blackberry',
  'Date palm': 'Dates',
  'Common fig': 'Fig',
  'Grapefruit': 'Grapefruit',
  'Passion fruit': 'Passion Fruit',
  'Peach': 'Peach',
  'Rambutan': 'Rambutan',
  'Raspberry': 'Raspberry',
  'Carambola': 'Starfruit',
  'Custard apple': 'Custard Apple',
  'Jackfruit': 'Jackfruit',
  'Lychee': 'Lychee',
  'Plum': 'Plum',
  'Indian gooseberry': 'Gooseberry (Amla)',
  'Apple': 'Apple',
  'Banana': 'Banana',
  'Mango': 'Mango',
  'Orange (fruit)': 'Orange',
  'Pomegranate': 'Pomegranate',
  'Watermelon': 'Watermelon',
  'Grape': 'Grapes',
  'Papaya': 'Papaya',
  'Pineapple': 'Pineapple',
  'Guava': 'Guava',
  'Kiwifruit': 'Kiwi',
  'Pitaya': 'Dragon Fruit',
  'Strawberry': 'Strawberry',
  'Blueberry': 'Blueberry',
  'Avocado': 'Avocado',
  'Sapodilla': 'Sapota (Chikoo)',
  'Cherry': 'Cherry',
  'Pear': 'Pear'
};

async function fetchWikiImage(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`;
  const res = await fetch(url, { headers: { 'User-Agent': 'FruitShopApp/1.0 (test@example.com)' } });
  const data = await res.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  if (pageId === "-1" || !pages[pageId].thumbnail) {
    return null;
  }
  return pages[pageId].thumbnail.source;
}

async function run() {
  const mappings = {};
  for (const title of fruitsToFix) {
    const img = await fetchWikiImage(title);
    if (img) {
      mappings[fruitNameMap[title]] = img;
      console.log(`Found image for ${fruitNameMap[title]}`);
    } else {
      console.log(`NO IMAGE FOR ${title}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  // Add aliases
  mappings['Gooseberry'] = mappings['Gooseberry (Amla)'];
  mappings['Sapota'] = mappings['Sapota (Chikoo)'];
  mappings['Seasonal Mix'] = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Fruit_basket_2016-10.jpg/800px-Fruit_basket_2016-10.jpg';

  let content = fs.readFileSync('database/init.js', 'utf-8');
  
  const urlRegex = /name:\s*"([^"]+)"[\s\S]*?image_url:\s*"([^"]+)"/g;
  content = content.replace(urlRegex, (match, name, oldUrl) => {
    if (mappings[name]) {
      return match.replace(oldUrl, mappings[name]);
    }
    return match;
  });

  fs.writeFileSync('database/init.js', content);
  console.log('Updated database/init.js successfully');
  fs.writeFileSync('mappings.json', JSON.stringify(mappings, null, 2));
}

run();
