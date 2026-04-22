import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Users, Settings, Shield, Activity, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function UserManagement() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'users') {
          const res = await fetch(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/sys/user/query` : '/api/sys/user/query', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.code === 200) setUsers(data.data);
        } else {
          const res = await fetch(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/sys/log/query` : '/api/sys/log/query', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.code === 200) setLogs(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, [activeTab, token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">系统管理</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
              activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Users size={18} />
              <span>用户管理</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
              activeTab === 'logs' ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Activity size={18} />
              <span>系统日志</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'users' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索用户..."
                    className="bg-transparent border-none focus:outline-none text-sm w-64"
                  />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  添加用户
                </button>
              </div>
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                    <th className="p-4 font-medium">账号</th>
                    <th className="p-4 font-medium">姓名</th>
                    <th className="p-4 font-medium">角色</th>
                    <th className="p-4 font-medium">电话</th>
                    <th className="p-4 font-medium">状态</th>
                    <th className="p-4 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm font-mono text-gray-600">{u.user_account}</td>
                      <td className="p-4 text-sm font-medium text-gray-900">{u.user_name}</td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          u.role === '管理员' ? 'bg-purple-100 text-purple-800' : 
                          u.role === '审批人员' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{u.user_phone}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.status === '正常' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">编辑</button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">禁用</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索日志..."
                    className="bg-transparent border-none focus:outline-none text-sm w-64"
                  />
                </div>
              </div>
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                    <th className="p-4 font-medium">时间</th>
                    <th className="p-4 font-medium">类型</th>
                    <th className="p-4 font-medium">操作用户ID</th>
                    <th className="p-4 font-medium">内容</th>
                    <th className="p-4 font-medium">级别</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-600">{format(new Date(log.create_time), 'yyyy-MM-dd HH:mm:ss')}</td>
                      <td className="p-4 text-sm text-gray-600">{log.log_type}</td>
                      <td className="p-4 text-sm font-mono text-gray-600">{log.operate_user || '-'}</td>
                      <td className="p-4 text-sm text-gray-900">{log.log_content}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          log.log_level === '信息' ? 'bg-blue-100 text-blue-800' : 
                          log.log_level === '警告' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.log_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
