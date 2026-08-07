const fs = require('fs');
let js = fs.readFileSync('platform/assets/js/admin.js', 'utf8');

// Replace category rendering in renderMerchantProducts
js = js.replace(
  "<td>${p.category}</td>",
  "<td>${catMap[p.category] || p.category}</td>"
);

// We need to inject catMap if it's not there
if (!js.includes("const catMap = {")) {
  js = js.replace("renderMerchantProducts() {", "renderMerchantProducts() {\n    const catMap = {\n      '大米': '粮油-谷物-大米',\n      '面粉': '粮油-谷物-面粉',\n      '食用油': '粮油-油类-食用油',\n      '钢材': '建材-金属-钢材',\n      '木材': '建材-板材-木材',\n      '水泥': '建材-粉材-水泥'\n    };");
}

fs.writeFileSync('platform/assets/js/admin.js', js);
console.log('Patched admin.js with catMap');
