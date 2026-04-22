import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Plane, LayoutDashboard, FileText, CheckSquare, Activity, Users, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: '数据分析', icon: LayoutDashboard, roles: ['普通用户', '审批人员', '管理员'] },
    { path: '/plans', label: '飞行计划', icon: FileText, roles: ['普通用户', '审批人员', '管理员'] },
    { path: '/approvals', label: '审批管理', icon: CheckSquare, roles: ['审批人员', '管理员'] },
    { path: '/users', label: '系统管理', icon: Users, roles: ['管理员'] },
  ];

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <Plane className="w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] text-slate-400 opacity-[0.03] -rotate-12" strokeWidth={0.5} />
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-[#0c2340] text-white flex flex-col z-10 shadow-2xl">
        <div className="p-6 flex flex-col items-center justify-center space-y-4 border-b border-white/10">
          <div className="h-16 w-16 bg-blue-500/20 rounded-full flex items-center justify-center p-3 shadow-inner border border-blue-400/20">
            <Plane className="w-full h-full text-blue-400" />
          </div>
          <div className="text-center">
            <h1 className="text-[17px] font-bold tracking-widest text-[#00a0e9]">南京航空航天大学</h1>
            <p className="text-xs text-blue-200 mt-1.5 opacity-80">无人机飞行计划管理系统</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.filter(item => item.roles.includes(user?.role || '')).map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600/90 text-white shadow-md shadow-blue-900/20' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-100' : 'text-slate-400'} />
                <span className="font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-[#08182b]/50">
          <div className="mb-4 px-4">
            <div className="text-xs text-slate-400 mb-1">当前登录</div>
            <div className="font-medium truncate text-blue-50">{user?.user_name}</div>
            <div className="text-xs text-blue-400/80 mt-0.5">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 w-full text-left text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={18} className="text-slate-400" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-8 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
