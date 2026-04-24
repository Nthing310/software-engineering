import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory Database
const db = {
  users: [
    { id: 1, user_account: 'admin', user_pwd: '123', user_name: 'Admin User', user_phone: '13800138000', role: '管理员', status: '正常', create_time: new Date().toISOString() },
    { id: 2, user_account: 'approver1', user_pwd: '123', user_name: 'Approver One', user_phone: '13800138001', role: '审批人员', status: '正常', create_time: new Date().toISOString() },
    { id: 3, user_account: 'user1', user_pwd: '123', user_name: 'Normal User', user_phone: '13800138002', role: '普通用户', status: '正常', create_time: new Date().toISOString() },
  ],
  plans: [] as any[],
  approvals: [] as any[],
  flight_data: [] as any[],
  warnings: [] as any[],
  logs: [] as any[]
};

let nextPlanId = 1;
let nextApprovalId = 1;
let nextLogId = 1;

// Helper to add log
const addLog = (log_type: string, operate_user: number, log_content: string, log_level: string = '信息') => {
  db.logs.push({
    id: nextLogId++,
    log_type,
    operate_user,
    log_content,
    log_level,
    create_time: new Date().toISOString()
  });
};

// API Routes

// User Login
app.post('/api/user/login', (req, res) => {
  const { user_account, user_pwd } = req.body;
  const user = db.users.find(u => u.user_account === user_account && u.user_pwd === user_pwd);
  
  if (user) {
    if (user.status === '禁用') {
      addLog('登录', user.id, '登录失败：账号被禁用', '警告');
      return res.status(403).json({ code: 403, msg: '账号已被禁用' });
    }
    const token = `fake-token-${user.id}`;
    addLog('登录', user.id, '登录成功');
    res.json({ code: 200, msg: '登录成功', data: { token, user_info: { id: user.id, user_name: user.user_name, role: user.role } } });
  } else {
    addLog('登录', 0, `登录失败：账号或密码错误 (${user_account})`, '警告');
    res.status(401).json({ code: 401, msg: '账号或密码错误' });
  }
});

// Create Plan
app.post('/api/plan/add', (req, res) => {
  const plan = req.body;
  const newPlan = {
    ...plan,
    id: nextPlanId++,
    plan_no: `P${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}`,
    create_time: new Date().toISOString(),
    status: plan.status || '草稿'
  };
  db.plans.push(newPlan);
  addLog('操作', plan.user_id, `创建飞行计划: ${newPlan.plan_name}`);
  res.json({ code: 200, msg: '创建成功', data: { plan_id: newPlan.id, plan_no: newPlan.plan_no } });
});

// Update Plan
app.post('/api/plan/update', (req, res) => {
  const { id, ...updates } = req.body;
  const index = db.plans.findIndex(p => p.id === id);
  if (index !== -1) {
    db.plans[index] = { ...db.plans[index], ...updates };
    addLog('操作', updates.user_id || 0, `更新飞行计划: ${db.plans[index].plan_name}`);
    res.json({ code: 200, msg: '更新成功' });
  } else {
    res.status(404).json({ code: 404, msg: '计划不存在' });
  }
});

// Query Plans
app.get('/api/plan/query', (req, res) => {
  const { user_id, plan_status } = req.query;
  let filtered = [...db.plans];
  if (user_id) filtered = filtered.filter(p => p.user_id === Number(user_id));
  if (plan_status) filtered = filtered.filter(p => p.status === plan_status);
  
  // Sort by create_time desc
  filtered.sort((a, b) => new Date(b.create_time).getTime() - new Date(a.create_time).getTime());
  
  res.json({ code: 200, msg: '查询成功', data: { plan_list: filtered, total: filtered.length } });
});

// Handle Approval
app.post('/api/approval/handle', (req, res) => {
  const { plan_id, approver_id, approve_result, approve_opinion, approve_node } = req.body;
  
  const approval = {
    id: nextApprovalId++,
    plan_id,
    approver_id,
    approve_node,
    approve_result,
    approve_opinion,
    approve_time: new Date().toISOString()
  };
  db.approvals.push(approval);
  
  const planIndex = db.plans.findIndex(p => p.id === plan_id);
  if (planIndex !== -1) {
    if (approve_result === '驳回') {
      db.plans[planIndex].status = '已驳回';
    } else {
      if (approve_node === '初审') db.plans[planIndex].status = '复审中';
      else if (approve_node === '复审') db.plans[planIndex].status = '终审中';
      else if (approve_node === '终审') db.plans[planIndex].status = '已批准';
      else db.plans[planIndex].status = '已批准';
    }
  }
  
  addLog('操作', approver_id, `审批飞行计划 (ID: ${plan_id}, 节点: ${approve_node}): ${approve_result}`);
  res.json({ code: 200, msg: '审批成功' });
});

// Get Approvals for a plan
app.get('/api/approval/query', (req, res) => {
  const { plan_id } = req.query;
  const filtered = db.approvals.filter(a => a.plan_id === Number(plan_id));
  res.json({ code: 200, msg: '查询成功', data: filtered });
});

// Get all users
app.get('/api/sys/user/query', (req, res) => {
  res.json({ code: 200, msg: '查询成功', data: db.users.map(({user_pwd, ...u}) => u) });
});

// Get logs
app.get('/api/sys/log/query', (req, res) => {
  res.json({ code: 200, msg: '查询成功', data: db.logs.sort((a, b) => new Date(b.create_time).getTime() - new Date(a.create_time).getTime()) });
});

// Analysis Report
app.get('/api/analysis/report', (req, res) => {
  const totalPlans = db.plans.length;
  const approvedPlans = db.plans.filter(p => ['已批准', '已执行', '已归档'].includes(p.status)).length;
  const rejectedPlans = db.plans.filter(p => p.status === '已驳回').length;
  
  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    let submitted = 0;
    let approved = 0;
    
    db.plans.forEach(p => {
      if (p.create_time.startsWith(dateStr)) submitted++;
    });
    
    db.approvals.forEach(a => {
      // 假设终审通过代表批准
      if (a.approve_time.startsWith(dateStr) && a.approve_node === '终审' && a.approve_result === '通过') approved++;
    });

    trendData.push({
      name: `${d.getMonth() + 1}/${d.getDate()}`,
      提交: submitted,
      批准: approved
    });
  }
  
  res.json({
    code: 200,
    msg: '成功',
    data: {
      totalPlans,
      approvedPlans,
      rejectedPlans,
      approvalRate: totalPlans > 0 ? (approvedPlans / totalPlans) * 100 : 0,
      trendData
    }
  });
});

// Start Flight (Mock)
app.post('/api/flight/start', (req, res) => {
  const { plan_id } = req.body;
  const planIndex = db.plans.findIndex(p => p.id === plan_id);
  if (planIndex !== -1) {
    db.plans[planIndex].status = '已执行';
    res.json({ code: 200, msg: '飞行已启动' });
  } else {
    res.status(404).json({ code: 404, msg: '计划不存在' });
  }
});

// Realtime Flight Data (Mock)
app.get('/api/flight/realTime', (req, res) => {
  const { plan_id } = req.query;
  // Generate random mock data around a center point
  const baseLng = 116.404;
  const baseLat = 39.915;
  const data = {
    id: Date.now(),
    plan_id: Number(plan_id),
    gps_lng: baseLng + (Math.random() - 0.5) * 0.01,
    gps_lat: baseLat + (Math.random() - 0.5) * 0.01,
    speed: Math.floor(Math.random() * 15) + 5,
    height: Math.floor(Math.random() * 50) + 50,
    battery: Math.floor(Math.random() * 40) + 60,
    signal: '强',
    flight_mode: '巡航',
    collect_time: new Date().toISOString()
  };
  res.json({ code: 200, msg: '成功', data });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
