const fs = require('fs');

async function fixImages() {
  let content = fs.readFileSync('database/init.js', 'utf-8');

  const goodUrls = {
    'Apple': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg',
    'Banana': '/fruits/bananas_1775554021235.png',
    'Mango': '/fruits/mangoes_1775554060469.png',
    'Orange': '/fruits/oranges_fresh.png',
    'Pomegranate': '/fruits/pomegranate_1775554228161.png',
    'Watermelon': '/fruits/watermelon_1775554195708.png',
    'Grapes': 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=600',
    'Papaya': '/fruits/papaya_fresh.png',
    'Pineapple': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600',
    'Guava': '/fruits/guavas_1775554138369.png',
    'Kiwi': '/fruits/kiwi_fresh.png',
    'Dragon Fruit': '/fruits/dragon_fruit_fresh.png',
    'Strawberry': 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=600',
    'Blueberry': 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600',
    'Avocado': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600',
    'Jackfruit': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/The_jackfruit_is_holding_on_to_the_tree.jpg/960px-The_jackfruit_is_holding_on_to_the_tree.jpg',
    'Rambutan': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Rambutan_white_background_alt.jpg/960px-Rambutan_white_background_alt.jpg',
    'Custard Apple': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Berthe_Hoola_van_Nooten53.jpg/960px-Berthe_Hoola_van_Nooten53.jpg',
    'Peach': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Illustration_Prunus_persica_clean_no_descr.jpg/960px-Illustration_Prunus_persica_clean_no_descr.jpg',
    'Cherry': 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600',
    'Plum': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Plums_African_Rose_-_whole%2C_halved_and_slice.jpg/960px-Plums_African_Rose_-_whole%2C_halved_and_slice.jpg',
    'Pear': 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=600',
    'Lychee': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Litchi_chinensis_fruits.JPG/960px-Litchi_chinensis_fruits.JPG',
    'Blackberry': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Ripe%2C_ripening%2C_and_green_blackberries.jpg/960px-Ripe%2C_ripening%2C_and_green_blackberries.jpg',
    'Raspberry': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Raspberry_-_halved_%28Rubus_idaeus%29.jpg/960px-Raspberry_-_halved_%28Rubus_idaeus%29.jpg',
    'Lemon': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/P1030323.JPG/960px-P1030323.JPG',
    'Grapefruit': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Grapefruits_-_whole-halved-segments.jpg/960px-Grapefruits_-_whole-halved-segments.jpg',
    'Fig': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Ficus_carica_L%2C_1771.jpg',
    'Dates': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Dates005.jpg/960px-Dates005.jpg',
    'Passion Fruit': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Passiflora_edulis_forma_flavicarpa.jpg',
    'Starfruit': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Averrhoa_carambola_ARS_k5735-7.jpg/960px-Averrhoa_carambola_ARS_k5735-7.jpg',
    'Sapota (Chikoo)': '/fruits/sapota_fresh.png',
    'Gooseberry (Amla)': 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Phyllanthus_officinalis.jpg',
    'Seasonal Mix': '/fruits/seasonal_mix_1775554180768.png'
  };

  const urlRegex = /name:\s*"([^"]+)"[\s\S]*?image_url:\s*"([^"]+)"/g;
  content = content.replace(urlRegex, (match, name, oldUrl) => {
    if (goodUrls[name]) {
      return match.replace(oldUrl, goodUrls[name]);
    }
    return match;
  });

  fs.writeFileSync('database/init.js', content);
  console.log('Fixed database/init.js successfully');
}

fixImages();
