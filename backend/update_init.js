const fs = require('fs');

const fruitsToRemove = [
  'Coconut', 'Lime', 'Sweet Lime', 'Tamarind', 'Mangosteen',
  'Apricot', 'Cantaloupe', 'Honeydew Melon'
];

const newMappings = {
  'Lemon': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Lemon.jpg',
  'Blackberry': 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Blackberry_fruit_and_leaves.jpg',
  'Dates': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Dates-on-a-plate.jpg',
  'Fig': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Ficus_carica_007.JPG',
  'Grapefruit': 'https://upload.wikimedia.org/wikipedia/commons/7/79/Grapefruit.jpg',
  'Passion Fruit': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Passion_Fruit_Macro.jpg',
  'Peach': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Peach-Macro.jpg',
  'Rambutan': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Rambutan_fruit.jpg',
  'Raspberry': 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Raspberries_%281%29.jpg',
  'Starfruit': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Carambola_Starfruit.jpg',
  'Custard Apple': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Custard_apple.jpg',
  'Jackfruit': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Jackfruit_cut_and_whole.jpg',
  'Lychee': 'https://upload.wikimedia.org/wikipedia/commons/4/46/Litchi_chinensis_Luc_Viatour.jpg',
  'Plum': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Plums_in_a_basket.jpg',
  'Gooseberry (Amla)': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Indian_Gooseberry.jpg',
  'Gooseberry': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Indian_Gooseberry.jpg',
  'Apple': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg',
  'Banana': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg',
  'Mango': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Hapus_Mango.jpg',
  'Orange': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg',
  'Pomegranate': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Pomegranate.jpg',
  'Watermelon': 'https://upload.wikimedia.org/wikipedia/commons/4/40/Watermelon_whole.jpg',
  'Grapes': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Kyoho-grape.jpg',
  'Papaya': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Papaya_cross_section_BNC.jpg',
  'Pineapple': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Pineapple_and_cross_section.jpg',
  'Guava': 'https://upload.wikimedia.org/wikipedia/commons/0/02/Guava_ID.jpg',
  'Kiwi': 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Kiwi_aka.jpg',
  'Dragon Fruit': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Pitaya_cross_section_ed2.jpg',
  'Strawberry': 'https://upload.wikimedia.org/wikipedia/commons/2/29/PerfectStrawberry.jpg',
  'Blueberry': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Blueberries.jpg',
  'Avocado': 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Avocado_Hass_-_single_and_halved.jpg',
  'Sapota (Chikoo)': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Sapodilla_fruit.jpg',
  'Sapota': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Sapodilla_fruit.jpg',
  'Cherry': 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Cherry_Stella444.jpg',
  'Pear': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Pears.jpg',
  'Seasonal Mix': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Fruit_basket_2016-10.jpg'
};

let content = fs.readFileSync('database/init.js', 'utf-8');

for (const fruit of fruitsToRemove) {
  const regex = new RegExp(`\\{\\s*name:\\s*"${fruit}"[\\s\\S]*?\\},?`, 'g');
  content = content.replace(regex, '');
}

const urlRegex = /name:\s*"([^"]+)"[\s\S]*?image_url:\s*"([^"]+)"/g;
content = content.replace(urlRegex, (match, name, oldUrl) => {
  if (newMappings[name]) {
    return match.replace(oldUrl, newMappings[name]);
  }
  return match;
});

fs.writeFileSync('database/init.js', content);
console.log('Updated database/init.js successfully');
