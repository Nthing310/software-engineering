import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Plane, Lock, User } from 'lucide-react';

export default function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/user/login` : '/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_account: account, user_pwd: password }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setAuth(data.data.token, data.data.user_info);
        navigate('/');
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Background layer: Use vector icon instead of external image for reliability */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <Plane className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] text-blue-600 opacity-[0.04] -rotate-12" strokeWidth={0.5} />
        <div className="absolute inset-0 bg-blue-900/5 backdrop-blur-[1px]"></div>
      </div>

      <div className="max-w-md w-full space-y-8 p-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl relative z-10 border border-white/40 mx-4">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 flex items-center justify-center rounded-2xl mb-4 shadow-lg">
            <Plane className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            南京航空航天大学
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            无人机飞行计划管理系统
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-1">账号</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-white/80"
                  placeholder="请输入账号 (如 admin)"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-1">密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-white/80"
                  placeholder="请输入密码 (默认 123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              登录系统
            </button>
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-6">
            如有账号问题，请联系系统管理员。
          </div>
        </form>
      </div>
    </div>
  );
}
