const fs = require('fs');
let js = fs.readFileSync('platform/assets/js/admin.js', 'utf8');

js = js.replace(
  "document.getElementById('edit-prod-type').value = p.type;",
  "document.getElementById('edit-prod-type').value = p.type;\n    document.getElementById('edit-prod-min-qty').value = p.minQty || 1;\n    document.getElementById('edit-prod-stock').value = p.stock || 999;"
);

js = js.replace(
  "p.type = document.getElementById('edit-prod-type').value;",
  "p.type = document.getElementById('edit-prod-type').value;\n    p.minQty = document.getElementById('edit-prod-min-qty').value;\n    p.stock = document.getElementById('edit-prod-stock').value;"
);

fs.writeFileSync('platform/assets/js/admin.js', js);
console.log('Patched admin.js with minQty and stock in saveProductInfo');
