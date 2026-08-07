const fs = require('fs');
let html = fs.readFileSync('platform/merchant.html', 'utf8');

// 1. table-all-products (商品管理) removing ID, 单价, 库存 (if they exist). Let's see its header:
html = html.replace(
  /\<table class="table" id="table-all-products" style="width: 100%;"\>\s*\<thead\>\<tr\>\<th\>序号\<\/th\>.*?\<\/tr\>\<\/thead\>/,
  '<table class="table" id="table-all-products" style="width: 100%;">\n            <thead><tr><th>序号</th><th>主图</th><th>商品名称</th><th>类型</th><th>分类</th><th>状态</th><th>操作</th></tr></thead>'
);

// 2. table-listed-products (上架列表) removing ID, adding 库存量
html = html.replace(
  /\<table class="table" id="table-listed-products" style="width: 100%;"\>\s*\<thead\>\<tr\>\<th\>序号\<\/th\>\<th\>商品 ID\<\/th\>.*?\<\/tr\>\<\/thead\>/,
  '<table class="table" id="table-listed-products" style="width: 100%;">\n            <thead><tr><th>序号</th><th>主图</th><th>商品名称</th><th>类型</th><th>分类</th><th>单价</th><th>起售数量</th><th>库存量</th><th>累计销量</th><th>上架时间</th><th>展示状态</th><th>操作</th></tr></thead>'
);

// 3. modal-add-listed-product adding 起售数量 and 库存量
const addListedFields = `
        <div class="form-group mb-4">
          <label class="form-label font-bold mb-1 block">单价 <span class="text-danger">*</span></label>
          <input type="number" id="add-listed-prod-price" class="form-control" style="width:100%; padding:8px;" placeholder="请输入售卖单价">
        </div>
        <div class="form-group mb-4">
          <label class="form-label font-bold mb-1 block">起售数量 <span class="text-danger">*</span></label>
          <input type="number" id="add-listed-prod-min-qty" class="form-control" style="width:100%; padding:8px;" placeholder="请输入最低起售数量">
        </div>
        <div class="form-group mb-4">
          <label class="form-label font-bold mb-1 block">库存量 <span class="text-danger">*</span></label>
          <input type="number" id="add-listed-prod-stock" class="form-control" style="width:100%; padding:8px;" placeholder="请输入商品当前库存">
        </div>
`;
html = html.replace(
  /\<div class="form-group mb-4"\>\s*\<label class="form-label font-bold mb-1 block"\>单价 \<\span class="text-danger"\>\*\<\/span\>\<\/label\>\s*\<input type="number" id="add-listed-prod-price".*?\>\s*\<\/div\>/,
  addListedFields
);

// Also update modal-edit-listed-product (if it exists) to include stock & min qty
const editListedFields = `
        <div class="form-group mb-4">
          <label class="form-label font-bold mb-1 block">售卖单价</label>
          <input type="number" id="edit-listed-prod-price" class="form-control" style="width:100%; padding:8px;">
        </div>
        <div class="form-group mb-4">
          <label class="form-label font-bold mb-1 block">起售数量</label>
          <input type="number" id="edit-listed-prod-min-qty" class="form-control" style="width:100%; padding:8px;">
        </div>
        <div class="form-group mb-4">
          <label class="form-label font-bold mb-1 block">库存量</label>
          <input type="number" id="edit-listed-prod-stock" class="form-control" style="width:100%; padding:8px;">
        </div>
`;
html = html.replace(
  /\<div class="form-group mb-4"\>\s*\<label class="form-label font-bold mb-1 block"\>售卖单价\<\/label\>\s*\<input type="number" id="edit-listed-prod-price".*?\>\s*\<\/div\>/,
  editListedFields
);

// For modal-add-product (新增商品), ensure it supports image, name, type, category (no price, id, stock)
// First let's check what it has. I will print the form group before modifying it.
fs.writeFileSync('platform/merchant.html', html);
