const fs = require('fs');
let html = fs.readFileSync('platform/admin.html', 'utf8');

const editProductFields = `
      <div class="flex gap-4 mb-4">
        <div class="flex-1">
          <label class="form-label font-bold mb-1 block">单价 (¥)</label>
          <input type="number" id="edit-prod-price" class="form-control" style="width:100%; padding:8px;">
        </div>
        <div class="flex-1">
          <label class="form-label font-bold mb-1 block">预售/现货</label>
          <select id="edit-prod-type" class="form-control" style="width:100%; padding:8px;">
            <option value="现货">现货</option>
            <option value="预售">预售</option>
          </select>
        </div>
      </div>
      <div class="flex gap-4 mb-4">
        <div class="flex-1">
          <label class="form-label font-bold mb-1 block">起售数量</label>
          <input type="number" id="edit-prod-min-qty" class="form-control" style="width:100%; padding:8px;">
        </div>
        <div class="flex-1">
          <label class="form-label font-bold mb-1 block">库存量</label>
          <input type="number" id="edit-prod-stock" class="form-control" style="width:100%; padding:8px;">
        </div>
      </div>
`;

// Replace the existing flex div for price and type
html = html.replace(
  /\<div class="flex gap-4 mb-4"\>\s*\<div class="flex-1"\>\s*\<label class="form-label font-bold mb-1 block"\>单价 \(¥\)\<\/label\>[\s\S]*?\<\/select\>\s*\<\/div\>\s*\<\/div\>/,
  editProductFields
);

fs.writeFileSync('platform/admin.html', html);
console.log('Patched admin.html with minQty and stock in edit modal');
