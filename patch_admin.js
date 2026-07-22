const fs = require('fs');
let html = fs.readFileSync('platform/admin.html', 'utf8');

const auditProductModal = `
<div class="modal-overlay" id="modal-audit-product" style="display:none; align-items:center; justify-content:center; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); position: fixed; inset: 0; z-index: 1600;" onclick="if(event.target===this) UI.closeModal('modal-audit-product')">
  <div class="modal" style="width: 500px; background:#fff; border-radius: 16px; overflow:hidden; box-shadow: 0 20px 25px rgba(0,0,0,0.15);">
    <div class="modal-header" style="border-bottom: 1px solid var(--border-light); padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
      <div class="modal-title font-bold" id="audit-modal-product-title" style="font-size:16px; margin:0;">上架商品审核</div>
      <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; line-height:1;" onclick="UI.closeModal('modal-audit-product')">&times;</button>
    </div>
    <div class="modal-body" style="padding:20px; font-size:13px;">
      <input type="hidden" id="audit-product-target-id">
      <div class="form-group mb-4">
        <label class="form-label font-bold mb-2 block" style="font-size:14px; color:#475569;">审核结果选择 <span class="text-danger">*</span></label>
        <div style="display:flex; gap:24px; padding:10px 14px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:bold; color:#16a34a;">
            <input type="radio" name="audit-product-radio" value="pass" checked onclick="document.getElementById('audit-product-reject-box').style.display='none'"> 审核通过 (允许上架)
          </label>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:bold; color:#dc2626;">
            <input type="radio" name="audit-product-radio" value="reject" onclick="document.getElementById('audit-product-reject-box').style.display='block'"> 审核拒绝 (转审核未通过)
          </label>
        </div>
      </div>
      <div id="audit-product-reject-box" style="display:none;" class="form-group mb-2">
        <label class="form-label font-bold mb-1 block" style="font-size:13px; color:#475569;">拒绝原因说明 (上限50字) <span class="text-danger">*</span></label>
        <div>
          <textarea class="form-control limit-50" id="audit-product-reject-input" maxlength="50" rows="3" style="width:100%; border-radius: 8px; padding:10px; border: 1px solid #e2e8f0; font-size:13px;" placeholder="请输入审核未通过的具体原因（最多50字）..."></textarea>
          <div class="char-counter" style="font-size:11px; color:#94a3b8; text-align:right; margin-top:4px; font-family:monospace;">0/50</div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="background:#f9fafb; padding:16px 20px; border-top: 1px solid var(--border-light); display:flex; justify-content:end; gap:12px;">
      <button class="btn btn-outline" style="border-radius:8px;" onclick="UI.closeModal('modal-audit-product')">取消</button>
      <button class="btn btn-primary" style="border-radius:8px;" onclick="window.confirmSubmitAuditProduct()">提交审核结果</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="modal-audit-demand" style="display:none; align-items:center; justify-content:center; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); position: fixed; inset: 0; z-index: 1600;" onclick="if(event.target===this) UI.closeModal('modal-audit-demand')">
  <div class="modal" style="width: 500px; background:#fff; border-radius: 16px; overflow:hidden; box-shadow: 0 20px 25px rgba(0,0,0,0.15);">
    <div class="modal-header" style="border-bottom: 1px solid var(--border-light); padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
      <div class="modal-title font-bold" id="audit-modal-demand-title" style="font-size:16px; margin:0;">供求信息审核</div>
      <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; line-height:1;" onclick="UI.closeModal('modal-audit-demand')">&times;</button>
    </div>
    <div class="modal-body" style="padding:20px; font-size:13px;">
      <input type="hidden" id="audit-demand-target-id">
      <div class="form-group mb-4">
        <label class="form-label font-bold mb-2 block" style="font-size:14px; color:#475569;">审核结果选择 <span class="text-danger">*</span></label>
        <div style="display:flex; gap:24px; padding:10px 14px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:bold; color:#16a34a;">
            <input type="radio" name="audit-demand-radio" value="pass" checked onclick="document.getElementById('audit-demand-reject-box').style.display='none'"> 审核通过 (大厅展示)
          </label>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:bold; color:#dc2626;">
            <input type="radio" name="audit-demand-radio" value="reject" onclick="document.getElementById('audit-demand-reject-box').style.display='block'"> 审核拒绝 (审核未通过)
          </label>
        </div>
      </div>
      <div id="audit-demand-reject-box" style="display:none;" class="form-group mb-2">
        <label class="form-label font-bold mb-1 block" style="font-size:13px; color:#475569;">拒绝原因说明 (上限50字) <span class="text-danger">*</span></label>
        <div>
          <textarea class="form-control limit-50" id="audit-demand-reject-input" maxlength="50" rows="3" style="width:100%; border-radius: 8px; padding:10px; border: 1px solid #e2e8f0; font-size:13px;" placeholder="请输入审核未通过的具体原因（最多50字）..."></textarea>
          <div class="char-counter" style="font-size:11px; color:#94a3b8; text-align:right; margin-top:4px; font-family:monospace;">0/50</div>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="background:#f9fafb; padding:16px 20px; border-top: 1px solid var(--border-light); display:flex; justify-content:end; gap:12px;">
      <button class="btn btn-outline" style="border-radius:8px;" onclick="UI.closeModal('modal-audit-demand')">取消</button>
      <button class="btn btn-primary" style="border-radius:8px;" onclick="window.confirmSubmitAuditDemand()">提交审核结果</button>
    </div>
  </div>
</div>
`;

if (!html.includes('modal-audit-product')) {
  html = html.replace('</body>', auditProductModal + '\n</body>');
  fs.writeFileSync('platform/admin.html', html);
  console.log('Added modals to admin.html');
}
