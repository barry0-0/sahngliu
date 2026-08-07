const fs = require('fs');
let html = fs.readFileSync('platform/merchant.html', 'utf8');

const addProductModal = `
<div class="modal-overlay" id="modal-add-product" style="display:none; align-items:center; justify-content:center; background: rgba(0,0,0,0.3); backdrop-filter: blur(8px); position: fixed; inset: 0; z-index: 1500;" onclick="if(event.target===this) UI.closeModal('modal-add-product')">
  <div class="modal" style="width: 500px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px rgba(0,0,0,0.15);">
    <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
      <div class="modal-title font-bold text-main" style="font-size:16px;">发布新商品</div>
      <button class="modal-close text-secondary" style="background:none; border:none; font-size:24px; cursor:pointer;" onclick="UI.closeModal('modal-add-product')">&times;</button>
    </div>
    <div class="modal-body" style="padding: 24px; font-size: 14px; display:flex; flex-direction:column; gap:16px;">
      <div class="form-group mb-4">
        <label class="form-label font-bold mb-1 block">商品图片 (URL) <span class="text-danger">*</span></label>
        <input type="text" id="add-prod-image" class="form-control" style="width:100%; padding:8px;" placeholder="请输入图片网络链接">
      </div>
      <div class="form-group mb-4">
        <label class="form-label font-bold mb-1 block">商品名称 <span class="text-danger">*</span></label>
        <input type="text" id="add-prod-name" class="form-control" style="width:100%; padding:8px;" placeholder="请输入商品名称">
      </div>
      <div class="form-group mb-4">
        <label class="form-label font-bold mb-1 block">商品类型 <span class="text-danger">*</span></label>
        <select id="add-prod-type" class="form-control" style="width:100%; padding:8px;">
          <option value="现货">现货</option>
          <option value="预售">预售</option>
        </select>
      </div>
      <div class="form-group mb-4">
        <label class="form-label font-bold mb-1 block">商品分类 <span class="text-danger">*</span></label>
        <select id="add-prod-cat" class="form-control" style="width:100%; padding:8px;">
          <option value="大米">粮油-谷物-大米</option>
          <option value="面粉">粮油-谷物-面粉</option>
          <option value="食用油">粮油-油类-食用油</option>
          <option value="钢材">建材-金属-钢材</option>
          <option value="木材">建材-板材-木材</option>
          <option value="水泥">建材-粉材-水泥</option>
        </select>
      </div>
    </div>
    <div class="modal-footer" style="padding: 16px 20px; border-top: 1px solid var(--border-light); background: #f9fafb; display: flex; justify-content: flex-end; gap: 12px;">
      <button class="btn btn-outline" style="border-radius: 6px;" onclick="UI.closeModal('modal-add-product')">取消</button>
      <button class="btn btn-primary" style="background:#9a66e4; border-color:#9a66e4; border-radius: 6px;" onclick="window.submitNewProduct()">确认发布</button>
    </div>
  </div>
</div>
`;

// Replace the onclick for 发布新商品
html = html.replace(
  /\<button class="btn btn-primary" style="margin-left:auto;" onclick="UI\.toast\('商品发布功能仅面向合规商家开放。', 'info'\)"\>发布新商品\<\/button\>/,
  '<button class="btn btn-primary" style="margin-left:auto;" onclick="window.openAddProductModal()">发布新商品</button>'
);

if (!html.includes('modal-add-product')) {
  html = html.replace('</body>', addProductModal + '\n</body>');
}

fs.writeFileSync('platform/merchant.html', html);
console.log('Added modal-add-product to merchant.html');
