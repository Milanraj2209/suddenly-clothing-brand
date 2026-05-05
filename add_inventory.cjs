const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server', 'data', 'products.json');
let products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

products = products.map(p => {
    if (p.inventory === undefined) {
        p.inventory = 5;
    }
    return p;
});

fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
console.log('Successfully updated products.json with default inventory.');
