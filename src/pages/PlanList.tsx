import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Plus, Search, Edit, Trash2, Send, Eye, X } from 'lucide-react';
import { format } from 'date-fns';

export default function PlanList() {
  const { user, token } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [viewPlanData, setViewPlanData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPlans = async () => {

    try {
      const url = new URL(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/plan/query` : '/api/plan/query', window.location.origin);
      if (user?.role === '普通用户') url.searchParams.append('user_id', user.id.toString());
      if (statusFilter) url.searchParams.append('plan_status', statusFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setPlans(data.data.plan_list);
      }
    } catch (error) {
      console.error('Failed to fetch plans', error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [user, statusFilter]);

  const handleSave = async (submit: boolean) => {
    try {
      const payload = {
        ...formData,
        user_id: user?.id,
        status: submit ? '待审批' : '草稿',
      };
      const endpoint = formData.id ? '/api/plan/update' : '/api/plan/add';
      const res = await fetch(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}${endpoint}` : endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.code === 200) {
        setShowModal(false);
        fetchPlans();
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '草稿': return 'bg-gray-100 text-gray-800';
      case '待审批': return 'bg-yellow-100 text-yellow-800';
      case '复审中':
      case '终审中':
      case '审批中': return 'bg-blue-100 text-blue-800';
      case '已批准': return 'bg-green-100 text-green-800';
      case '已驳回': return 'bg-red-100 text-red-800';
      case '已执行': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">飞行计划管理</h1>
        {user?.role === '普通用户' && (
          <button
            onClick={() => { setFormData({}); setShowModal(true); }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>创建计划</span>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="搜索计划名称..."
            className="bg-transparent border-none focus:outline-none text-sm w-64"
          />
        </div>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">全部状态</option>
          <option value="草稿">草稿</option>
          <option value="待审批">待审批</option>
          <option value="已批准">已批准</option>
          <option value="已驳回">已驳回</option>
          <option value="已执行">已执行</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
              <th className="p-4 font-medium">计划编号</th>
              <th className="p-4 font-medium">计划名称</th>
              <th className="p-4 font-medium">任务类型</th>
              <th className="p-4 font-medium">飞行时间</th>
              <th className="p-4 font-medium">状态</th>
              <th className="p-4 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map(plan => (
              <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-mono text-gray-600">{plan.plan_no}</td>
                <td className="p-4 text-sm font-medium text-gray-900">{plan.plan_name}</td>
                <td className="p-4 text-sm text-gray-600">{plan.task_type}</td>
                <td className="p-4 text-sm text-gray-600">
                  {format(new Date(plan.flight_start), 'MM-dd HH:mm')} 至 {format(new Date(plan.flight_end), 'MM-dd HH:mm')}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2 flex justify-end items-center">
                  <button 
                    onClick={() => setViewPlanData(plan)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" 
                    title="查看详情"
                  >
                    <Eye size={18} />
                  </button>
                  {user?.role === '普通用户' && (plan.status === '草稿' || plan.status === '已驳回') && (
                    <>
                      <button
                        onClick={() => { setFormData(plan); setShowModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        title="编辑"
                      >
                        <Edit size={18} />
                      </button>
                      {plan.status === '草稿' && (
                        <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="删除">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{formData.id ? '编辑飞行计划' : '创建飞行计划'}</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">计划名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.plan_name || ''}
                  onChange={e => setFormData({...formData, plan_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">任务类型 <span className="text-red-500">*</span></label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.task_type || ''}
                  onChange={e => setFormData({...formData, task_type: e.target.value})}
                >
                  <option value="">请选择</option>
                  <option value="巡检">巡检</option>
                  <option value="植保">植保</option>
                  <option value="测绘">测绘</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">飞行开始时间 <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.flight_start ? formData.flight_start.slice(0, 16) : ''}
                  onChange={e => setFormData({...formData, flight_start: new Date(e.target.value).toISOString()})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">飞行结束时间 <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.flight_end ? formData.flight_end.slice(0, 16) : ''}
                  onChange={e => setFormData({...formData, flight_end: new Date(e.target.value).toISOString()})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">飞行区域 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.flight_area || ''}
                  onChange={e => setFormData({...formData, flight_area: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">飞行高度 (米) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.flight_height || ''}
                  onChange={e => setFormData({...formData, flight_height: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">无人机型号 <span className="text-red-500">*</span></label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.uav_model || ''}
                  onChange={e => setFormData({...formData, uav_model: e.target.value})}
                >
                  <option value="">请选择</option>
                  <option value="DJI M300">DJI M300</option>
                  <option value="DJI Mavic 3">DJI Mavic 3</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">操作人员 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.operator || ''}
                  onChange={e => setFormData({...formData, operator: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-gray-700">计划描述</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none"
                  value={formData.plan_desc || ''}
                  onChange={e => setFormData({...formData, plan_desc: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleSave(false)}
                className="px-4 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                保存草稿
              </button>
              <button
                onClick={() => handleSave(true)}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Send size={16} />
                <span>提交审批</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {viewPlanData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">飞行计划详情</h2>
              <button 
                onClick={() => setViewPlanData(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div><span className="text-gray-500 block mb-1">计划编号</span> <span className="font-medium">{viewPlanData.plan_no}</span></div>
                <div><span className="text-gray-500 block mb-1">计划名称</span> <span className="font-medium">{viewPlanData.plan_name}</span></div>
                <div><span className="text-gray-500 block mb-1">状态</span> 
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewPlanData.status)} mt-1`}>
                    {viewPlanData.status}
                  </span>
                </div>
                <div><span className="text-gray-500 block mb-1">任务类型</span> <span className="font-medium">{viewPlanData.task_type}</span></div>
                <div><span className="text-gray-500 block mb-1">开始时间</span> <span className="font-medium">{viewPlanData.flight_start ? format(new Date(viewPlanData.flight_start), 'yyyy-MM-dd HH:mm') : '-'}</span></div>
                <div><span className="text-gray-500 block mb-1">结束时间</span> <span className="font-medium">{viewPlanData.flight_end ? format(new Date(viewPlanData.flight_end), 'yyyy-MM-dd HH:mm') : '-'}</span></div>
                <div><span className="text-gray-500 block mb-1">飞行区域</span> <span className="font-medium">{viewPlanData.flight_area}</span></div>
                <div><span className="text-gray-500 block mb-1">飞行高度</span> <span className="font-medium">{viewPlanData.flight_height} 米</span></div>
                <div><span className="text-gray-500 block mb-1">无人机型号</span> <span className="font-medium">{viewPlanData.uav_model}</span></div>
                <div><span className="text-gray-500 block mb-1">操作人员</span> <span className="font-medium">{viewPlanData.operator}</span></div>
                <div className="col-span-2"><span className="text-gray-500 block mb-1">计划描述</span> <span className="font-medium whitespace-pre-wrap">{viewPlanData.plan_desc || '无'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
