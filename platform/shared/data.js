/**
 * S2B2C 简易供应链交易系统 - 共享数据层 (localStorage DB)
 * 供 运营端、商家端、商城PC、买家H5端 跨页数据交互与状态同步使用
 */

const DB_KEY = 's2b2c_simplified_db';
const DB_VERSION = 4; // 升级版本，注入丰富假数据

// 初始化数据库
function initDatabase() {
  const existing = localStorage.getItem(DB_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed._version === DB_VERSION) return parsed;
    } catch (e) {
      console.error("DB Parse error, re-initializing", e);
    }
  }

  const db = {
    _version: DB_VERSION,
    
    // 1. 统一用户表 (丰富的用户数据)
    users: [
      { id: 'u_admin', username: 'admin', password: '123', nickname: '系统超级管理员', user_type: 'ADMIN', status: 'NORMAL', company_name: '平台运营中心', createTime: '2026-06-01' },
      { id: 'u_merchant1', username: 'merchant1', password: '123', nickname: '黑龙江北大荒粮油', user_type: 'MERCHANT', status: 'NORMAL', company_name: '黑龙江北大荒粮油发展有限公司', social_credit_code: '91230100MA1234567M', createTime: '2026-06-10' },
      { id: 'u_merchant2', username: 'merchant2', password: '123', nickname: '中粮（东莞）粮油', user_type: 'MERCHANT', status: 'NORMAL', company_name: '中粮（东莞）粮油工业有限公司', social_credit_code: '91441900MA1234567C', createTime: '2026-06-15' },
      { id: 'u_buyer1', username: 'buyer1', password: '123', nickname: '牧原股份采购部', user_type: 'BUYER', status: 'NORMAL', company_name: '牧原食品股份有限公司', social_credit_code: '91411300MA1234567P', createTime: '2026-06-20', points: 5000 },
      { id: 'u_buyer2', username: 'buyer2', password: '123', nickname: '双汇发展采购中心', user_type: 'BUYER', status: 'NORMAL', company_name: '河南双汇投资发展股份有限公司', social_credit_code: '91411100MA1234567D', createTime: '2026-06-22', points: 3200 },
      { id: 'u_buyer3', username: 'buyer3', password: '123', nickname: '新希望六和', user_type: 'BUYER', status: 'NORMAL', company_name: '新希望六和股份有限公司', social_credit_code: '91510100MA1234567X', createTime: '2026-07-01', points: 1500 },
      { id: 'u_buyer_pending', username: 'buyer_new', password: '123', nickname: '温氏股份申请中', user_type: 'BUYER', status: 'PENDING', company_name: '温氏食品集团股份有限公司', social_credit_code: '91445300MA1234567W', createTime: '2026-07-08', points: 0 }
    ],

    user_tags: [
      { id: 't_01', name: '大宗VIP采购商' },
      { id: 't_02', name: '金牌源头厂家' },
      { id: 't_03', name: '饲料专供' }
    ],

    brands: [
      { id: 'b_01', name: '北大荒' },
      { id: 'b_02', name: '中粮福临门' },
      { id: 'b_03', name: '九三集团' },
      { id: 'b_04', name: '鲁花' }
    ],

    categories: [
      { id: 'cat_01', name: '大豆及豆粕' },
      { id: 'cat_02', name: '玉米及原粮' },
      { id: 'cat_03', name: '食用植物油' },
      { id: 'cat_04', name: '杂粮杂豆' }
    ],

    // 丰富的商品库
    goods: [
      { id: 'g_01', merchant_id: 'u_merchant1', merchant_name: '黑龙江北大荒粮油', brand_id: 'b_01', category_id: 'cat_01', name: '东北非转基因黄大豆 (特级)', price: 4850, stock: 2000, spec_json: { '水分': '≤13.0%', '粗蛋白质': '≥40.0%', '杂质': '≤1.0%', '起订量': '30吨' }, commission_rate: 5.00, status: 'ON_SALE', createTime: '2026-06-12' },
      { id: 'g_02', merchant_id: 'u_merchant1', merchant_name: '黑龙江北大荒粮油', brand_id: 'b_01', category_id: 'cat_02', name: '黑龙江新季烘干玉米 (容重720)', price: 2750, stock: 5000, spec_json: { '容重': '≥720g/L', '水分': '≤14.0%', '霉变': '≤2.0%' }, commission_rate: 4.00, status: 'ON_SALE', createTime: '2026-06-13' },
      { id: 'g_03', merchant_id: 'u_merchant2', merchant_name: '中粮（东莞）粮油', brand_id: 'b_02', category_id: 'cat_01', name: '压榨一级豆粕 (蛋白43%)', price: 3850, stock: 1500, spec_json: { '粗蛋白质': '≥43.0%', '粗灰分': '≤6.5%', '起订量': '50吨' }, commission_rate: 4.50, status: 'ON_SALE', createTime: '2026-06-18' },
      { id: 'g_04', merchant_id: 'u_merchant2', merchant_name: '中粮（东莞）粮油', brand_id: 'b_02', category_id: 'cat_03', name: '餐饮专供大豆油 (散油)', price: 7800, stock: 600, spec_json: { '色泽': 'Y30 R3', '酸值': '≤0.2mg/g', '过氧化值': '≤5.0mmol/kg' }, commission_rate: 5.00, status: 'ON_SALE', createTime: '2026-06-25' },
      { id: 'g_05', merchant_id: 'u_merchant1', merchant_name: '黑龙江北大荒粮油', brand_id: 'b_01', category_id: 'cat_04', name: '东北红小豆 (优选级)', price: 9200, stock: 150, spec_json: { '不完善粒': '≤3.0%', '水分': '≤14.0%', '起订量': '5吨' }, commission_rate: 6.00, status: 'ON_SALE', createTime: '2026-07-02' }
    ],

    one_client_prices: [
      { id: 'ocp_01', buyer_id: 'u_buyer1', goods_id: 'g_03', special_price: 3750 },
      { id: 'ocp_02', buyer_id: 'u_buyer2', goods_id: 'g_01', special_price: 4750 }
    ],

    // 丰富的竞价专场
    bidding_projects: [
      { id: 'b_01', merchant_id: 'u_merchant1', merchant_name: '黑龙江北大荒粮油', title: '500吨国储玉米竞拍专场', base_price: 2600, step_price: 10, start_time: new Date(Date.now() - 86400000).toLocaleString(), end_time: new Date(Date.now() - 3600000).toLocaleString(), spec_json: { '容重': '≥700', '水分': '≤14%' }, bidding_status: 'FINISHED', winner_id: 'u_buyer3', win_price: 2710, bids: [{buyer_id: 'u_buyer1', price: 2680}, {buyer_id: 'u_buyer3', price: 2710}] },
      { id: 'b_02', merchant_id: 'u_merchant2', merchant_name: '中粮（东莞）粮油', title: '东莞库200吨豆粕现货急售竞拍', base_price: 3700, step_price: 20, start_time: new Date(Date.now() - 3600000).toLocaleString(), end_time: new Date(Date.now() + 86400000).toLocaleString(), spec_json: { '蛋白': '≥43%' }, bidding_status: 'ACTIVE', winner_id: null, win_price: 3760, bids: [{buyer_id: 'u_buyer2', price: 3740}, {buyer_id: 'u_buyer1', price: 3760}] },
      { id: 'b_03', merchant_id: 'u_merchant1', merchant_name: '黑龙江北大荒粮油', title: '东北优质红小豆专场', base_price: 8800, step_price: 50, start_time: new Date(Date.now() + 86400000).toLocaleString(), end_time: new Date(Date.now() + 172800000).toLocaleString(), spec_json: { '水份': '≤14%' }, bidding_status: 'NOT_STARTED', winner_id: null, win_price: null, bids: [] }
    ],

    rfqs: [
      { id: 'rfq_01', buyer_id: 'u_buyer1', buyer_name: '牧原股份采购部', title: '紧急求购玉米1000吨送达南阳', quantity: 1000, spec_required: '容重≥720，水分≤14.5%', expected_price: 2720, createTime: '2026-07-06 09:30' },
      { id: 'rfq_02', buyer_id: 'u_buyer2', buyer_name: '双汇发展采购中心', title: '求购豆粕200吨', quantity: 200, spec_required: '蛋白≥43%', expected_price: 3820, createTime: '2026-07-07 15:45' }
    ],

    // 丰富的多状态订单
    orders: [
      { id: 'o_01', code: 'XH20260701001', buyer_id: 'u_buyer1', buyer_name: '牧原股份采购部', merchant_id: 'u_merchant1', merchant_name: '黑龙江北大荒粮油', order_type: 'SPOT', goods_name: '东北非转基因黄大豆 (特级)', quantity: 50, unit_price: 4850, total_amount: 242500, commission_amount: 12125, order_status: 'COMPLETED', logistics_company: '顺丰大件运', logistics_no: 'SF1234567890', createTime: '2026-07-01 10:20' },
      { id: 'o_02', code: 'XH20260705002', buyer_id: 'u_buyer2', buyer_name: '双汇发展采购中心', merchant_id: 'u_merchant2', merchant_name: '中粮（东莞）粮油', order_type: 'SPOT', goods_name: '压榨一级豆粕 (蛋白43%)', quantity: 100, unit_price: 3850, total_amount: 385000, commission_amount: 17325, order_status: 'WAIT_RECEIVE', logistics_company: '跨越速运', logistics_no: 'KY0987654321', createTime: '2026-07-05 14:10' },
      { id: 'o_03', code: 'XH20260708003', buyer_id: 'u_buyer3', buyer_name: '新希望六和', merchant_id: 'u_merchant1', merchant_name: '黑龙江北大荒粮油', order_type: 'SPOT', goods_name: '黑龙江新季烘干玉米', quantity: 300, unit_price: 2750, total_amount: 825000, commission_amount: 33000, order_status: 'WAIT_SHIP', logistics_company: '', logistics_no: '', createTime: '2026-07-08 09:15' }
    ],

    // 丰富的结算账单
    settlement_statements: [
      { id: 's_01', merchant_id: 'u_merchant1', merchant_name: '黑龙江北大荒粮油', order_id: 'o_01', order_amount: 242500, commission_due: 12125, payment_proof_url: 'bank_receipt_01.jpg', status: 'PAID', createTime: '2026-07-02 11:30' },
      { id: 's_02', merchant_id: 'u_merchant2', merchant_name: '中粮（东莞）粮油', order_id: 'o_02', order_amount: 385000, commission_due: 17325, payment_proof_url: '', status: 'UNPAID', createTime: '2026-07-05 16:00' },
      { id: 's_03', merchant_id: 'u_merchant1', merchant_name: '黑龙江北大荒粮油', order_id: 'o_03', order_amount: 825000, commission_due: 33000, payment_proof_url: '', status: 'UNPAID', createTime: '2026-07-08 09:20' }
    ],

    invoices: [
      { id: 'inv_01', order_id: 'o_01', applicant_id: 'u_buyer1', target_company: '牧原食品股份有限公司', tax_code: '91411300MA1234567P', address_phone: '南阳市卧龙区 13800001111', bank_info: '工商银行 622202000000000001', amount: 242500, type: 'GOODS', invoice_status: 'PROCESSED', invoice_no: 'FP12345678', createTime: '2026-07-02 14:00' },
      { id: 'inv_02', order_id: 'o_02', applicant_id: 'u_buyer2', target_company: '河南双汇投资发展股份有限公司', tax_code: '91411100MA1234567D', address_phone: '漯河市召陵区 13800002222', bank_info: '农业银行 622848000000000002', amount: 385000, type: 'GOODS', invoice_status: 'PENDING', invoice_no: '', createTime: '2026-07-05 17:30' }
    ],

    chat_messages: [
      { id: 'c_01', buyer_id: 'u_buyer1', buyer_name: '牧原股份采购部', merchant_id: 'u_merchant1', sender: 'BUYER', text: '这批黄大豆的水分能保证在13%以下吗？我们做高标准饲料用的。', createTime: '2026-07-07 10:00' },
      { id: 'c_02', buyer_id: 'u_buyer1', buyer_name: '牧原股份采购部', merchant_id: 'u_merchant1', sender: 'MERCHANT', text: '您放心，入库实测水分基本在12.5%左右，绝对符合您的要求。', createTime: '2026-07-07 10:05' },
      { id: 'c_03', buyer_id: 'u_buyer2', buyer_name: '双汇发展采购中心', merchant_id: 'u_merchant2', sender: 'BUYER', text: '东莞库的豆粕今天能发货吗？', createTime: '2026-07-08 08:30' }
    ],

    // 12. 操作审计日志
    operation_logs: [
      { id: 'l_01', operator: '系统内置', action: '数据库初始化', target: '系统启动', time: '2026-07-07 12:00', ip: '127.0.0.1' }
    ]
  };

  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

function getDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return initDatabase();
  try {
    return JSON.parse(raw);
  } catch (e) {
    return initDatabase();
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

const DBService = {
  getCollection(name) {
    return getDB()[name] || [];
  },
  saveCollection(name, data) {
    const db = getDB();
    db[name] = data;
    saveDB(db);
  },
  addItem(name, item) {
    const db = getDB();
    if (!db[name]) db[name] = [];
    item.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    db[name].push(item);
    saveDB(db);
    this.addLog(item.buyer_id || item.merchant_id || 'system', '新增记录', `${name} - ID:${item.id}`);
    return item;
  },
  updateItem(name, id, updates) {
    const db = getDB();
    const arr = db[name];
    if (!arr) return null;
    const idx = arr.findIndex(item => item.id === id);
    if (idx === -1) return null;
    Object.assign(arr[idx], updates);
    saveDB(db);
    return arr[idx];
  },
  deleteItem(name, id) {
    const db = getDB();
    const arr = db[name];
    if (!arr) return false;
    db[name] = arr.filter(item => item.id !== id);
    saveDB(db);
    return true;
  },
  addLog(operator, action, target) {
    const db = getDB();
    const log = {
      id: 'log_' + Date.now(),
      operator: operator || '系统用户',
      action: action,
      target: target,
      time: new Date().toLocaleString(),
      ip: '127.0.0.1'
    };
    db.operation_logs.push(log);
    saveDB(db);
  }
};
