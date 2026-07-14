/**
 * 全局假数据池 (Mock Data V2 - 扩充版)
 * 供 5 个端共享读取和模拟展示，包含大量测试数据
 */

window.MockData = {
  // 当前登录用户 (供前端鉴权拦截展示)
  currentUser: {
    personalAuthStatus: 0, // 0: 未认证, 1: 已认证
    merchantAuthStatus: 0, // 0: 未认证, 1: 待审核, 2: 已认证
  },

  // --- 购物车数据 (Mock) ---
  cart: [
    { id: 1, productId: 101, name: 'HRB400E 螺纹钢 12mm 9m', price: 3850, quantity: 10, shopId: 10001, shopName: '万通建材', checked: true, status: 1 },
    { id: 2, productId: 102, name: '中联 PO42.5 水泥 (袋装)', price: 320, quantity: 50, shopId: 10002, shopName: '星辉建筑五金专营', checked: true, status: 1 },
    { id: 3, productId: 103, name: '樟子松 辐射松 建筑木方', price: 1450, quantity: 5, shopId: 10001, shopName: '万通建材', checked: false, status: 0 } // status: 0 表示失效
  ],

  // --- 店铺详情 Mock ---
  shopDetails: {
    '10001': {
      id: 10001,
      name: '万通建材',
      avatar: '万',
      banner: 'https://images.unsplash.com/photo-1541888081-30d890632a7e?w=1200&h=300&fit=crop',
      mainBusiness: '主营业务：钢材、木材、建筑材料',
      regTime: '2026-01-01',
      isFollowed: false
    },
    'S001': {
      id: 'S001',
      name: '远大钢铁官方直营店',
      avatar: '钢',
      banner: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=300&fit=crop',
      mainBusiness: '主营业务：特种钢材、建筑钢材、板材、废钢回收',
      regTime: '2026-02-15',
      isFollowed: false
    },
    'S002': {
      id: 'S002',
      name: '华东木材集散中心',
      avatar: '木',
      banner: 'https://images.unsplash.com/photo-1416879573087-210fe7e5b155?w=1200&h=300&fit=crop',
      mainBusiness: '主营业务：进口原木、防腐木、建筑模板、建筑木方',
      regTime: '2026-03-01',
      isFollowed: false
    },
    'S004': {
      id: 'S004',
      name: '海螺水泥华东总代',
      avatar: '泥',
      banner: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=300&fit=crop',
      mainBusiness: '主营业务：海螺牌硅酸盐水泥、袋装水泥、散装水泥',
      regTime: '2026-01-20',
      isFollowed: false
    }
  },
  // --- 1. BI 数据报表 (Admin) ---
  biStats: {
    overview: {
      totalOrders: 8542,
      totalGMV: 145500000,
      merchantsCount: 345,
      productsCount: 12500,
      buyersCount: 9860
    },
    gmvTrend: [
      { month: '2026-01', amount: 350 }, { month: '2026-02', amount: 420 },
      { month: '2026-03', amount: 510 }, { month: '2026-04', amount: 480 },
      { month: '2026-05', amount: 620 }, { month: '2026-06', amount: 750 },
      { month: '2026-07', amount: 890 }
    ],
    categoryPie: [
      { name: '钢材', value: 45 }, { name: '木材', value: 25 },
      { name: '水泥', value: 20 }, { name: '五金', value: 10 }
    ],
    orderTrend: [
      { month: '2026-01', orders: 1200, buyers: 800 },
      { month: '2026-02', orders: 1500, buyers: 950 },
      { month: '2026-03', orders: 1800, buyers: 1200 },
      { month: '2026-04', orders: 1600, buyers: 1100 },
      { month: '2026-05', orders: 2100, buyers: 1500 },
      { month: '2026-06', orders: 2500, buyers: 1800 },
      { month: '2026-07', orders: 3100, buyers: 2200 }
    ],
    topMerchants: [
      { name: '远大钢铁官方直营店', gmv: 45000000 },
      { name: '海螺水泥华东总代', gmv: 32000000 },
      { name: '华东木材集散中心', gmv: 28000000 },
      { name: '万通建材特供', gmv: 15000000 },
      { name: '星辉建筑五金专营', gmv: 9500000 }
    ]
  },

  // --- 1.5 平台抽佣配置规则 ---
  commissionRules: [
    { id: 'CR-001', type: 'global', name: '全局默认抽佣规则', target: '所有交易', rate: '1.00%', amount: '-', status: 1 },
    { id: 'CR-002', type: 'merchant', name: '远大钢铁KA客户专享', target: '远大钢铁官方直营店', rate: '0.50%', amount: '-', status: 1 },
    { id: 'CR-003', type: 'category', name: '五金类目特殊抽点', target: '五金分类', rate: '2.00%', amount: '-', status: 1 },
    { id: 'CR-004', type: 'fixed', name: '特价大宗按单收取', target: '订单额>100万', rate: '-', amount: '¥5,000.00/单', status: 0 }
  ],

  // --- 2. 统一用户库 (sys_user) ---
  users: [
    { id: '10001', mobile: '13800138000', name: '张三 (普通买家)', type: 1, certStatus: 0, merchantStatus: 0, regTime: '2026-06-15 10:23' },
    { id: '10002', mobile: '13911112222', name: '万通建材采购部', type: 1, certStatus: 2, merchantStatus: 0, regTime: '2026-06-18 14:00' }, 
    { id: '10003', mobile: '13566668888', name: '远大钢铁集团', type: 2, certStatus: 2, merchantStatus: 2, regTime: '2026-05-01 09:30' }, 
    { id: '10004', mobile: '18600009999', name: '李四 (新注册)', type: 1, certStatus: 0, merchantStatus: 1, regTime: '2026-07-08 08:15' },
    { id: '10005', mobile: '13700005555', name: '华东木业发展', type: 2, certStatus: 2, merchantStatus: 2, regTime: '2026-03-12 11:15' },
    { id: '10006', mobile: '18888888888', name: '星辉建筑公司', type: 1, certStatus: 2, merchantStatus: 0, regTime: '2026-04-20 16:45' },
    { id: '10007', mobile: '15900001111', name: '海螺水泥直销', type: 2, certStatus: 2, merchantStatus: 2, regTime: '2026-01-10 09:00' }
  ],

  // --- 3. 商家店铺库 (merchant_shop) ---
  shops: [
    { id: '10001', userId: '10001', shopName: '万通建材', companyName: '万通建材有限公司', creditCode: '91330100MA2B3C4D5E', status: '正常', avatar: '', banner: 'https://images.unsplash.com/photo-1541888081-30d890632a7e?w=1200&h=300&fit=crop' },
    { id: '10002', userId: '10002', shopName: '星辉建筑五金专营', companyName: '星辉建筑五金材料有限公司', creditCode: '91330100MA2B3C4FGH', status: '正常', avatar: '', banner: '' },
    { id: 'S001', userId: '10003', shopName: '远大钢铁官方直营店', companyName: '远大钢铁集团有限公司', creditCode: '91330100MA2B3C4D5E', status: '正常', avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&q=80', banner: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80' },
    { id: 'S002', userId: '10005', shopName: '华东木材集散中心', companyName: '华东木业发展有限公司', creditCode: '91330200MA11223344', status: '正常', avatar: 'https://images.unsplash.com/photo-1598214156687-f823f6eb78c8?auto=format&fit=crop&w=100&q=80', banner: 'https://images.unsplash.com/photo-1416879573087-210fe7e5b155?auto=format&fit=crop&w=1200&q=80' },
    { id: 'S003', userId: '10004', shopName: '某某贸易商行', companyName: '某某贸易商行', creditCode: '91330300123456789X', status: '待审核', avatar: '', banner: '' },
    { id: 'S004', userId: '10007', shopName: '海螺水泥华东总代', companyName: '海螺水泥直销', creditCode: '91330400MA99887766', status: '正常', avatar: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=100&q=80', banner: '' }
  ],

  // --- 4. 货品分类字典 ---
  categories: [
    { id: '1', name: '钢材', code: 'C01', status: 1, children: [
      { id: '11', name: '建筑钢材', code: 'C0101', status: 1, children: [
        { id: '111', name: '螺纹钢', code: 'C010101', status: 1, children: [] },
        { id: '112', name: '盘螺', code: 'C010102', status: 1, children: [] }
      ]}
    ]},
    { id: '2', name: '木材', code: 'C02', status: 1, children: [
      { id: '21', name: '原木', code: 'C0201', status: 1, children: [] }
    ]},
    { id: '3', name: '水泥', code: 'C03', status: 1, children: [] },
    { id: '4', name: '五金', code: 'C04', status: 0, children: [] }
  ],

  // --- 5. 商品库 (product & sku) ---
  products: [
    { id: 'P1001', shopId: 'S001', shopName: '丰收粮油直营店', name: '东北一级大米 50kg装', category: '大米', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80', priceStr: '¥280.00 / 袋', sales: 12500, stock: 500, status: 1 },
    { id: 'P1002', shopId: 'S002', shopName: '华东农副集散中心', name: '特级富士苹果 礼盒装', category: '苹果', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80', priceStr: '¥120.00 / 箱', sales: 800, stock: 3000, status: 1 },
    { id: 'P1003', shopId: 'S001', shopName: '丰收粮油直营店', name: '高筋面粉 25kg装 (烘焙专用)', category: '面粉', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', priceStr: '¥145.00 / 袋', sales: 3200, stock: 1000, status: 1 },
    { id: 'P1004', shopId: 'S004', shopName: '绿源鲜蔬总代', name: '有机大白菜 散装批发', category: '白菜', image: 'https://images.unsplash.com/photo-1550158464-672d98e24172?auto=format&fit=crop&w=400&q=80', priceStr: '¥1.80 / 斤', sales: 45000, stock: 10000, status: 1 },
    { id: 'P1005', shopId: 'S001', shopName: '丰收粮油直营店', name: '非转基因大豆油 5L*4桶装', category: '豆油', image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=400&q=80', priceStr: '¥210.00 / 箱', sales: 1120, stock: 450, status: 1 },
    { id: 'P1006', shopId: 'S002', shopName: '华东农副集散中心', name: '山东红富士 原箱直发', category: '苹果', image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=400&q=80', priceStr: '¥56.00 / 箱', sales: 50, stock: 200, status: 1 },
    { id: 'P1007', shopId: 'S004', shopName: '绿源鲜蔬总代', name: '新鲜土豆 产地直供', category: '土豆', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80', priceStr: '¥1.20 / 斤', sales: 89000, stock: 20000, status: 1 },
    { id: 'P1008', shopId: 'S001', shopName: '丰收粮油直营店', name: '优质玉米 特级品', category: '玉米', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80', priceStr: '¥1,450.00 / 吨', sales: 150, stock: 60, status: 0 } // 待审核
  ],

  // --- 6. 订单台账库 (orders) ---
  // status: 0待签约, 1待发货, 2待签收, 3已完成, -1已关闭
  orders: [
    { id: 'ORD202607080001', buyerName: '万通建材采购部', shopName: '远大钢铁官方直营店', shopId: 'S001', productName: 'HRB400E 抗震螺纹钢 12mm', amount: '¥385,000.00', type: '现货交易', status: 0, time: '2026-07-08 09:12' },
    { id: 'ORD202607070088', buyerName: '万通建材采购部', shopName: '华东木材集散中心', shopId: 'S002', productName: '俄罗斯进口 樟子松原木 (竞标中标)', amount: '¥240,000.00', type: '竞价交易', status: 1, time: '2026-07-07 15:30' },
    { id: 'ORD202607050032', buyerName: '张三 (普通买家)', shopName: '远大钢铁官方直营店', shopId: 'S001', productName: '测试小批量钢管', amount: '¥8,500.00', type: '现货交易', status: 2, time: '2026-07-05 10:00' },
    { id: 'ORD202606280011', buyerName: '星辉建筑公司', shopName: '华东木材集散中心', shopId: 'S002', productName: '定制加工木方批次', amount: '¥150,000.00', type: '求购转单', status: -1, time: '2026-06-28 14:20', closeReason: '买卖双方线下协商退款取消' },
    { id: 'ORD202607090001', buyerName: '万通建材采购部', shopName: '海螺水泥华东总代', shopId: 'S004', productName: '海螺牌 P.O 42.5 散装硅酸盐水泥', amount: '¥155,000.00', type: '现货交易', status: 3, time: '2026-07-09 08:30' },
    { id: 'ORD202607090002', buyerName: '星辉建筑公司', shopName: '远大钢铁官方直营店', shopId: 'S001', productName: 'Q345B 低合金高强度槽钢', amount: '¥40,500.00', type: '现货交易', status: 1, time: '2026-07-09 11:20' },
    { id: 'ORD202607090003', buyerName: '星辉建筑公司', shopName: '海螺水泥华东总代', shopId: 'S004', productName: '海螺牌 P.C 32.5 袋装水泥', amount: '¥18,000.00', type: '现货交易', status: 2, time: '2026-07-09 14:00' },
    { id: 'ORD202607010045', buyerName: '万通建材采购部', shopName: '华东木材集散中心', shopId: 'S002', productName: '北美白橡木 实木大板', amount: '¥56,000.00', type: '现货交易', status: 3, time: '2026-07-01 09:15' }
  ],

  // --- 7. 求购大厅与咨询监控库 (supply_demand & chats) ---
  demands: [
    { id: 'REQ001', buyerName: '万通建材采购部', title: '急求 50吨 Q345B 槽钢，交期7天内', category: '钢材', expectedPrice: '¥4,200/吨', publishTime: '2026-07-07 09:00', status: 1, quotesCount: 3 },
    { id: 'REQ002', buyerName: '星辉建筑公司', title: '寻优质防腐木供应商，年框采购量约5000立方', category: '木材', expectedPrice: '面议', publishTime: '2026-07-08 10:15', status: 1, quotesCount: 1 },
    { id: 'REQ003', buyerName: '张三 (普通买家)', title: '买几包水泥', category: '水泥', expectedPrice: '¥20/包', publishTime: '2026-07-08 14:00', status: 0, quotesCount: 0 },
    { id: 'REQ004', buyerName: '万通建材采购部', title: '采购 P.O 42.5 散装水泥 500吨 需送达杭州工地', category: '水泥', expectedPrice: '¥300/吨', publishTime: '2026-07-09 08:00', status: 1, quotesCount: 5 },
    { id: 'REQ005', buyerName: '万通建材采购部', title: '【已结束】上个月的废钢管处理', category: '钢材', expectedPrice: '面议', publishTime: '2026-06-15 08:00', status: 2, quotesCount: 12 }
  ],
  chats: [ 
    { demandId: 'REQ001', buyer: '万通建材采购部', seller: '远大钢铁官方直营店', time: '2026-07-07 10:15', history: [{ role: 'buyer', msg: '老板，50吨能做4100吗？' }, { role: 'seller', msg: '做不了，最底4150，发您正式报价了。' }] },
    { demandId: 'REQ004', buyer: '万通建材采购部', seller: '海螺水泥华东总代', time: '2026-07-09 09:20', history: [{ role: 'seller', msg: '305一吨包运费，可以的话马上转订单。' }, { role: 'buyer', msg: '好的，按这个价发起合同吧。' }] }
  ],

  // --- 8. 竞价项目库 (biddingResources & biddingAnnouncements) ---
  biddingResources: [
    { id: 'RES001', shopName: '远大钢铁官方直营店', name: '报废钢材处理竞标一批', specs: '约500吨 混杂废钢', image: 'https://images.unsplash.com/photo-1590509653066-51f7bb54c2a4?auto=format&fit=crop&w=400&q=80', status: '已通过' },
    { id: 'RES002', shopName: '海螺水泥华东总代', name: '库存临期袋装水泥清仓', specs: '10000包 P.C 32.5', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80', status: '待审核' },
    { id: 'RES003', shopName: '华东木材集散中心', name: '南美白橡木 20个柜原木', specs: '特级 F4星', image: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80', status: '已通过' }
  ],
  
  biddingAnnouncements: [
    { id: 'BID20260801', resId: 'RES001', image: 'https://images.unsplash.com/photo-1590509653066-51f7bb54c2a4?auto=format&fit=crop&w=400&q=80', shopName: '远大钢铁官方直营店', title: '报废钢材处理竞标一批 约500吨', startPrice: '¥800,000.00', bidEndTime: '2026-07-16 12:00', status: 1, currentMaxOffer: '¥850,000.00', winner: '-' },
    { id: 'BID20260802', resId: 'RES002', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80', shopName: '海螺水泥华东总代', title: '库存临期袋装水泥清仓 10000包', startPrice: '¥120,000.00', bidEndTime: '2026-07-20 18:00', status: 0, currentMaxOffer: '-', winner: '-' },
    { id: 'BID20260705', resId: 'RES003', image: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80', shopName: '华东木材集散中心', title: '南美白橡木 20个柜原木 竞标', startPrice: '¥2,000,000.00', bidEndTime: '2026-07-06 12:00', status: 3, currentMaxOffer: '¥2,450,000.00', winner: '万通建材采购部' },
    { id: 'BID20260706', resId: 'RES003', image: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80', shopName: '万达木业集团', title: '特级辐射松板材 200立方米 竞标', startPrice: '¥360,000.00', bidEndTime: '2026-07-22 10:00', status: 1, currentMaxOffer: '¥380,000.00', winner: '-' }
  ],

  biddingOffers: [
    { id: 'OFR001', bidId: 'BID20260705', buyerName: '万通建材采购部', offerPrice: '¥2,450,000.00', time: '2026-07-06 10:30', status: 1 },
    { id: 'OFR002', bidId: 'BID20260705', buyerName: '星辉建筑公司', offerPrice: '¥2,300,000.00', time: '2026-07-06 09:15', status: 0 },
    { id: 'OFR003', bidId: 'BID20260801', buyerName: '张三 (普通买家)', offerPrice: '¥850,000.00', time: '2026-07-10 14:00', status: 0 },
  ],

  // --- 10. 商品类别字典 ---
  productCategories: [
    { id: 'C01', name: '粮油米面类', level: 1, children: [
      { id: 'C01-1', name: '谷物与杂粮', level: 2, children: [{id:'C01-1-1', name:'玉米', level:3}, {id:'C01-1-2', name:'小麦', level:3}, {id:'C01-1-3', name:'稻谷', level:3}, {id:'C01-1-4', name:'燕麦', level:3}, {id:'C01-1-5', name:'高粱', level:3}, {id:'C01-1-6', name:'小米', level:3}] },
      { id: 'C01-2', name: '米面制品', level: 2, children: [{id:'C01-2-1', name:'面粉', level:3}, {id:'C01-2-2', name:'大米', level:3}, {id:'C01-2-3', name:'面条', level:3}, {id:'C01-2-4', name:'淀粉', level:3}] },
      { id: 'C01-3', name: '食用油类', level: 2, children: [{id:'C01-3-1', name:'豆油', level:3}, {id:'C01-3-2', name:'菜籽油', level:3}, {id:'C01-3-3', name:'花生油', level:3}, {id:'C01-3-4', name:'棕榈油', level:3}] },
      { id: 'C01-4', name: '薯类', level: 2, children: [{id:'C01-4-1', name:'鲜山芋', level:3}, {id:'C01-4-2', name:'山芋干', level:3}, {id:'C01-4-3', name:'马铃薯', level:3}] }
    ]},
    { id: 'C02', name: '水果类', level: 1, children: [
      { id: 'C02-1', name: '大宗水果', level: 2, children: [{id:'C02-1-1', name:'苹果', level:3}, {id:'C02-1-2', name:'柑橘', level:3}, {id:'C02-1-3', name:'香蕉', level:3}, {id:'C02-1-4', name:'梨', level:3}, {id:'C02-1-5', name:'葡萄', level:3}] },
      { id: 'C02-2', name: '瓜果类', level: 2, children: [{id:'C02-2-1', name:'西瓜', level:3}, {id:'C02-2-2', name:'哈密瓜', level:3}, {id:'C02-2-3', name:'甜瓜', level:3}] },
      { id: 'C02-3', name: '热带/浆果类', level: 2, children: [{id:'C02-3-1', name:'芒果', level:3}, {id:'C02-3-2', name:'菠萝', level:3}, {id:'C02-3-3', name:'草莓', level:3}, {id:'C02-3-4', name:'蓝莓', level:3}] }
    ]},
    { id: 'C03', name: '蔬菜类', level: 1, children: [
      { id: 'C03-1', name: '叶菜与茎菜', level: 2, children: [{id:'C03-1-1', name:'白菜', level:3}, {id:'C03-1-2', name:'菠菜', level:3}, {id:'C03-1-3', name:'生菜', level:3}, {id:'C03-1-4', name:'芦笋', level:3}] },
      { id: 'C03-2', name: '根茎与果菜', level: 2, children: [{id:'C03-2-1', name:'萝卜', level:3}, {id:'C03-2-2', name:'土豆', level:3}, {id:'C03-2-3', name:'番茄', level:3}, {id:'C03-2-4', name:'黄瓜', level:3}, {id:'C03-2-5', name:'茄子', level:3}] },
      { id: 'C03-3', name: '葱蒜与食用菌', level: 2, children: [{id:'C03-3-1', name:'大葱', level:3}, {id:'C03-3-2', name:'大蒜', level:3}, {id:'C03-3-3', name:'生姜', level:3}, {id:'C03-3-4', name:'鲜香菇', level:3}, {id:'C03-3-5', name:'金针菇', level:3}] }
    ]},
    { id: 'C04', name: '禽畜肉蛋类', level: 1, children: [
      { id: 'C04-1', name: '活体畜禽', level: 2, children: [{id:'C04-1-1', name:'生猪', level:3}, {id:'C04-1-2', name:'活牛', level:3}, {id:'C04-1-3', name:'活羊', level:3}, {id:'C04-1-4', name:'活禽', level:3}] },
      { id: 'C04-2', name: '肉类产品', level: 2, children: [{id:'C04-2-1', name:'猪肉', level:3}, {id:'C04-2-2', name:'牛肉', level:3}, {id:'C04-2-3', name:'羊肉', level:3}, {id:'C04-2-4', name:'禽肉', level:3}, {id:'C04-2-5', name:'猪腩', level:3}] },
      { id: 'C04-3', name: '蛋奶产品', level: 2, children: [{id:'C04-3-1', name:'鲜鸡蛋', level:3}, {id:'C04-3-2', name:'鸭蛋', level:3}, {id:'C04-3-3', name:'生鲜乳', level:3}] }
    ]},
    { id: 'C05', name: '水产类', level: 1, children: [
      { id: 'C05-1', name: '鲜活水产', level: 2, children: [{id:'C05-1-1', name:'淡水鱼类', level:3}, {id:'C05-1-2', name:'海水鱼类', level:3}, {id:'C05-1-3', name:'虾蟹类', level:3}, {id:'C05-1-4', name:'贝类', level:3}] },
      { id: 'C05-2', name: '冰鲜/冻品', level: 2, children: [{id:'C05-2-1', name:'冰鲜鱼类', level:3}, {id:'C05-2-2', name:'冷冻水产', level:3}] },
      { id: 'C05-3', name: '藻类与软体', level: 2, children: [{id:'C05-3-1', name:'海带', level:3}, {id:'C05-3-2', name:'紫菜', level:3}, {id:'C05-3-3', name:'鱿鱼', level:3}, {id:'C05-3-4', name:'章鱼', level:3}] }
    ]},
    { id: 'C06', name: '农副加工类', level: 1, children: [
      { id: 'C06-1', name: '油粕与饲料', level: 2, children: [{id:'C06-1-1', name:'豆粕', level:3}, {id:'C06-1-2', name:'菜籽粕', level:3}, {id:'C06-1-3', name:'农作物秸秆', level:3}, {id:'C06-1-4', name:'大宗饲料', level:3}] },
      { id: 'C06-2', name: '初加工食品', level: 2, children: [{id:'C06-2-1', name:'果干', level:3}, {id:'C06-2-2', name:'腌渍品', level:3}, {id:'C06-2-3', name:'干菜', level:3}, {id:'C06-2-4', name:'腊肉', level:3}] },
      { id: 'C06-3', name: '调味品与饮品', level: 2, children: [{id:'C06-3-1', name:'蜂蜜', level:3}, {id:'C06-3-2', name:'茶叶', level:3}, {id:'C06-3-3', name:'咖啡', level:3}, {id:'C06-3-4', name:'可可', level:3}] }
    ]},
    { id: 'C07', name: '种子种苗类', level: 1, children: [
      { id: 'C07-1', name: '农作物种子', level: 2, children: [{id:'C07-1-1', name:'花卉种子', level:3}, {id:'C07-1-2', name:'蔬菜种子', level:3}, {id:'C07-1-3', name:'水果种子', level:3}, {id:'C07-1-4', name:'油料种子', level:3}] },
      { id: 'C07-2', name: '种苗与种蛋', level: 2, children: [{id:'C07-2-1', name:'树苗', level:3}, {id:'C07-2-2', name:'竹秧', level:3}, {id:'C07-2-3', name:'种畜', level:3}, {id:'C07-2-4', name:'种禽', level:3}, {id:'C07-2-5', name:'种蛋', level:3}] }
    ]},
    { id: 'C08', name: '苗木花草类', level: 1, children: [
      { id: 'C08-1', name: '园林苗木', level: 2, children: [{id:'C08-1-1', name:'水果苗', level:3}, {id:'C08-1-2', name:'蔬菜苗', level:3}, {id:'C08-1-3', name:'花卉苗', level:3}, {id:'C08-1-4', name:'造型景观树', level:3}] },
      { id: 'C08-2', name: '花草与草坪', level: 2, children: [{id:'C08-2-1', name:'鲜切花', level:3}, {id:'C08-2-2', name:'盆栽植物', level:3}, {id:'C08-2-3', name:'地被草坪', level:3}, {id:'C08-2-4', name:'水生植物', level:3}] }
    ]},
    { id: 'C09', name: '农资农机类', level: 1, children: [
      { id: 'C09-1', name: '农资产品', level: 2, children: [{id:'C09-1-1', name:'化肥', level:3}, {id:'C09-1-2', name:'农药', level:3}, {id:'C09-1-3', name:'兽药', level:3}] },
      { id: 'C09-2', name: '农业机械', level: 2, children: [{id:'C09-2-1', name:'耕整机械', level:3}, {id:'C09-2-2', name:'种植施肥机械', level:3}, {id:'C09-2-3', name:'收获机械', level:3}, {id:'C09-2-4', name:'植保机械', level:3}] }
    ]},
    { id: 'C10', name: '中药材类', level: 1, children: [
      { id: 'C10-1', name: '植物类药材', level: 2, children: [{id:'C10-1-1', name:'根茎类', level:3}, {id:'C10-1-2', name:'果实籽仁类', level:3}, {id:'C10-1-3', name:'叶类', level:3}, {id:'C10-1-4', name:'全草类', level:3}, {id:'C10-1-5', name:'花类', level:3}] },
      { id: 'C10-2', name: '动物与矿物类', level: 2, children: [{id:'C10-2-1', name:'动物类药材', level:3}, {id:'C10-2-2', name:'中药矿物类', level:3}] }
    ]},
    { id: 'C11', name: '日用百货类', level: 1, children: [
      { id: 'C11-1', name: '厨房与清洁', level: 2, children: [{id:'C11-1-1', name:'厨房用具', level:3}, {id:'C11-1-2', name:'清洁用品', level:3}, {id:'C11-1-3', name:'洗涤用品', level:3}] },
      { id: 'C11-2', name: '包装与杂货', level: 2, children: [{id:'C11-2-1', name:'塑料包装', level:3}, {id:'C11-2-2', name:'纸制品', level:3}, {id:'C11-2-3', name:'其他日杂百货', level:3}] }
    ]}
  ],

  // --- 11. 消息与发票库 ---
  messages: [
    { id: 1, title: '资质审核通知', content: '您的企业资质【万通建材采购部】已通过运营审核，认证生效。', time: '2026-07-01 10:00' },
    { id: 2, title: '订单提醒', content: '您有一笔新订单 ORD202607080001 等待盖章签署合同。', time: '2026-07-08 09:12' },
    { id: 3, title: '竞价中标通知', content: '恭喜您在【南美白橡木 20个柜原木】竞价中成功中标！系统已自动生成订单。', time: '2026-07-06 12:05' },
    { id: 4, title: '发票开具提醒', content: '您申请的增值税专用发票 INV-202607-001 已开具并寄出，请注意查收。', time: '2026-07-03 14:30' }
  ],
  invoices: [
    { id: 'INV-202607-001', buyerName: '万通建材采购部', type: '增值税专用发票', amount: '¥56,000.00', applyTime: '2026-07-01 14:00', status: '已开具' },
    { id: 'INV-202607-015', buyerName: '万通建材采购部', type: '增值税普通发票', amount: '¥240,000.00', applyTime: '2026-07-08 10:00', status: '审核中' }
  ],

  // --- 12. 装饰与协议配置 ---
  decorationConfig: {
    displayCategories: ['C01', 'C02', 'C03', 'C04', 'C05'], // 最多5个
    pcBanners: [
      { id: 'BPC1', url: 'https://images.unsplash.com/photo-1541888081-309605bd9f96?auto=format&fit=crop&w=1200&q=80', active: true }
    ],
    h5Banners: [
      { id: 'BH51', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80', active: true }
    ]
  },
  
  agreementList: [
    { id: 'AGR001', name: '商家入驻协议', version: 'V1.0', time: '2025-01-01 00:00', status: 0 }, // 0失效, 1生效
    { id: 'AGR002', name: '隐私政策', version: 'V1.0', time: '2025-01-01 00:00', status: 0 },
    { id: 'AGR003', name: '商家入驻协议', version: 'V2.0', time: '2026-06-01 12:00', status: 1 },
    { id: 'AGR004', name: '隐私政策', version: 'V1.1', time: '2026-06-05 10:00', status: 1 }
  ]
};
