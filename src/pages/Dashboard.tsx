import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/analysis/report` : '/api/analysis/report', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.code === 200) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, [token]);

  if (!stats) return <div className="p-8 text-center text-gray-500">加载中...</div>;

  const pieData = [
    { name: '已批准', value: stats.approvedPlans },
    { name: '已驳回', value: stats.rejectedPlans },
    { name: '待处理', value: stats.totalPlans - stats.approvedPlans - stats.rejectedPlans },
  ];

  const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">数据分析大屏</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FileText size={24} /></div>
          <div>
            <div className="text-sm text-gray-500">总计划数</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPlans}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
          <div>
            <div className="text-sm text-gray-500">已批准</div>
            <div className="text-2xl font-bold text-gray-900">{stats.approvedPlans}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg"><XCircle size={24} /></div>
          <div>
            <div className="text-sm text-gray-500">已驳回</div>
            <div className="text-2xl font-bold text-gray-900">{stats.rejectedPlans}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Activity size={24} /></div>
          <div>
            <div className="text-sm text-gray-500">审批通过率</div>
            <div className="text-2xl font-bold text-gray-900">{stats.approvalRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">计划状态分布</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">近期计划趋势</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="提交" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="批准" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
