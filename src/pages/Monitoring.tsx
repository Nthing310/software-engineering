import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Play, Square, AlertTriangle, Battery, Signal, Navigation } from 'lucide-react';

export default function Monitoring() {
  const { token } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [flightData, setFlightData] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const url = new URL(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/plan/query` : '/api/plan/query', window.location.origin);
        url.searchParams.append('plan_status', '已批准');
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
    fetchPlans();
  }, [token]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring && activePlan) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/flight/realTime?plan_id=${activePlan.id}` : `/api/flight/realTime?plan_id=${activePlan.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.code === 200) {
            setFlightData(data.data);
          }
        } catch (error) {
          console.error('Failed to fetch flight data', error);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, activePlan, token]);

  const startFlight = async (plan: any) => {
    try {
      const res = await fetch(import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/api/flight/start` : '/api/flight/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_id: plan.id }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setActivePlan(plan);
        setIsMonitoring(true);
      }
    } catch (error) {
      console.error('Failed to start flight', error);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">实时飞行监控</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Left Panel: Map & Data */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
          {/* Mock Map Area */}
          <div className="flex-1 bg-slate-100 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {isMonitoring && flightData ? (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping absolute"></div>
                <Navigation size={32} className="text-blue-600 relative z-10" />
                <div className="mt-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm text-xs font-mono text-gray-700 border border-gray-200">
                  {flightData.gps_lng.toFixed(4)}, {flightData.gps_lat.toFixed(4)}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                请在右侧选择计划并启动飞行
              </div>
            )}
          </div>

          {/* Telemetry Overlay */}
          {isMonitoring && flightData && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-gray-200 grid grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Navigation size={20} /></div>
                <div>
                  <div className="text-xs text-gray-500">高度 / 速度</div>
                  <div className="font-mono font-medium">{flightData.height}m / {flightData.speed}m/s</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Battery size={20} /></div>
                <div>
                  <div className="text-xs text-gray-500">剩余电量</div>
                  <div className="font-mono font-medium">{flightData.battery}%</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Signal size={20} /></div>
                <div>
                  <div className="text-xs text-gray-500">信号强度</div>
                  <div className="font-mono font-medium">{flightData.signal}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><AlertTriangle size={20} /></div>
                <div>
                  <div className="text-xs text-gray-500">系统状态</div>
                  <div className="font-mono font-medium text-green-600">正常</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">待执行计划</h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {plans.map(plan => (
              <div key={plan.id} className={`p-4 rounded-lg border transition-colors ${activePlan?.id === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <div className="font-medium text-gray-900 mb-1">{plan.plan_name}</div>
                <div className="text-xs text-gray-500 mb-3 font-mono">{plan.plan_no}</div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                  <div>区域: {plan.flight_area}</div>
                  <div>高度: {plan.flight_height}m</div>
                  <div className="col-span-2">机型: {plan.uav_model}</div>
                </div>

                {activePlan?.id === plan.id && isMonitoring ? (
                  <button
                    onClick={() => setIsMonitoring(false)}
                    className="w-full flex items-center justify-center space-x-2 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    <Square size={16} />
                    <span>终止飞行</span>
                  </button>
                ) : (
                  <button
                    onClick={() => startFlight(plan)}
                    disabled={isMonitoring}
                    className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    <Play size={16} />
                    <span>启动飞行</span>
                  </button>
                )}
              </div>
            ))}
            {plans.length === 0 && (
              <div className="text-center text-gray-500 py-8 text-sm">
                暂无已批准的待执行计划
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
