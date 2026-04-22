import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Check, X, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function ApprovalList() {
  const { user, token } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [opinion, setOpinion] = useState('');
  const [statusFilter, setStatusFilter] = useState('待审批');

  const fetchPlans = async () => {
    try {
      const url = new URL(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/plan/query` : '/api/plan/query', window.location.origin);
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

  const handleApprove = async (result: '通过' | '驳回') => {
    if (result === '驳回' && !opinion) {
      alert('驳回必须填写审批意见');
      return;
    }
    try {
      const payload = {
        plan_id: selectedPlan.id,
        approver_id: user?.id,
        approve_node: selectedPlan.status === '待审批' ? '初审' : selectedPlan.status === '复审中' ? '复审' : '终审',
        approve_result: result,
        approve_opinion: opinion,
      };
      const res = await fetch(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/approval/handle` : '/api/approval/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.code === 200) {
        setShowModal(false);
        setOpinion('');
        fetchPlans();
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error('Approval failed', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">审批管理</h1>
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
          <option value="待审批">待审批 (初审)</option>
          <option value="复审中">复审中</option>
          <option value="终审中">终审中</option>
          <option value="已批准">已批准</option>
          <option value="已驳回">已驳回</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
              <th className="p-4 font-medium">计划编号</th>
              <th className="p-4 font-medium">计划名称</th>
              <th className="p-4 font-medium">提交人</th>
              <th className="p-4 font-medium">提交时间</th>
              <th className="p-4 font-medium">当前状态</th>
              <th className="p-4 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map(plan => (
              <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-mono text-gray-600">{plan.plan_no}</td>
                <td className="p-4 text-sm font-medium text-gray-900">{plan.plan_name}</td>
                <td className="p-4 text-sm text-gray-600">{plan.operator}</td>
                <td className="p-4 text-sm text-gray-600">{format(new Date(plan.create_time), 'yyyy-MM-dd HH:mm')}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {plan.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => { setSelectedPlan(plan); setShowModal(true); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1 ml-auto"
                  >
                    <Check size={16} />
                    <span className="text-sm font-medium">去审批</span>
                  </button>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">暂无待办审批</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">审批飞行计划</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500">计划名称：</span> {selectedPlan.plan_name}</div>
                <div><span className="text-gray-500">任务类型：</span> {selectedPlan.task_type}</div>
                <div><span className="text-gray-500">飞行区域：</span> {selectedPlan.flight_area}</div>
                <div><span className="text-gray-500">飞行高度：</span> {selectedPlan.flight_height} 米</div>
                <div className="col-span-2"><span className="text-gray-500">飞行时间：</span> {format(new Date(selectedPlan.flight_start), 'yyyy-MM-dd HH:mm')} 至 {format(new Date(selectedPlan.flight_end), 'yyyy-MM-dd HH:mm')}</div>
                <div className="col-span-2"><span className="text-gray-500">计划描述：</span> {selectedPlan.plan_desc || '无'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">审批意见</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none"
                placeholder="请输入审批意见（驳回必填）"
                value={opinion}
                onChange={e => setOpinion(e.target.value)}
              />
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleApprove('驳回')}
                className="px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center space-x-2"
              >
                <X size={16} />
                <span>驳回</span>
              </button>
              <button
                onClick={() => handleApprove('通过')}
                className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Check size={16} />
                <span>通过</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
