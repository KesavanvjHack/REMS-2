import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import axiosInstance from "../api/axiosInstance";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // 1. Current Stats
      const statsRes = await axiosInstance.get("monitoring/productivity/me/");
      setStats(statsRes.data);

      // 2. History
      const historyRes = await axiosInstance.get("monitoring/productivity/");
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Analyzing enterprise performance...</div>;

  const pieData = stats ? [
    { name: "Attendance", value: stats.breakdown.attendance },
    { name: "Tasks", value: stats.breakdown.tasks },
    { name: "Focus/Usage", value: stats.breakdown.usage },
  ] : [];

  const radarData = stats ? [
    { subject: 'Attendance', A: stats.breakdown.attendance, fullMark: 100 },
    { subject: 'Tasks', A: stats.breakdown.tasks, fullMark: 100 },
    { subject: 'Usage', A: stats.breakdown.usage, fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Intelligence & Analytics</h1>
          <p className="text-sm text-gray-400">Deep dive into performance metrics and productivity trends</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Efficiency Index</span>
            <span className="text-xl font-black text-accent">{stats?.overall_score}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-dark-800 border border-dark-600 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-accent rounded-full"></span>
            Productivity Over Time
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "12px" }} 
                    itemStyle={{ color: "#3b82f6" }}
                />
                <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#1f2937" }} 
                    activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Comparison */}
        <div className="bg-dark-800 border border-dark-600 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Performance Matrix</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Radar
                  name="Efficiency"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Breakdown Pie */}
          <div className="bg-dark-800 border border-dark-600 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Metric Weight Distribution</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "12px" }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-dark-800 border border-dark-600 rounded-3xl p-8 shadow-2xl flex flex-col justify-center">
              <div className="space-y-8">
                  <div className="flex justify-between items-center">
                      <div>
                          <p className="text-gray-400 text-sm font-medium">Attendance Score</p>
                          <p className="text-2xl font-bold text-white">{stats?.breakdown.attendance}%</p>
                      </div>
                      <div className="w-1/2 h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${stats?.breakdown.attendance}%` }}></div>
                      </div>
                  </div>
                  <div className="flex justify-between items-center">
                      <div>
                          <p className="text-gray-400 text-sm font-medium">Task Velocity</p>
                          <p className="text-2xl font-bold text-white">{stats?.breakdown.tasks}%</p>
                      </div>
                      <div className="w-1/2 h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${stats?.breakdown.tasks}%` }}></div>
                      </div>
                  </div>
                  <div className="flex justify-between items-center">
                      <div>
                          <p className="text-gray-400 text-sm font-medium">Digital Focus</p>
                          <p className="text-2xl font-bold text-white">{stats?.breakdown.usage}%</p>
                      </div>
                      <div className="w-1/2 h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: `${stats?.breakdown.usage}%` }}></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {stats?.remarks && (
          <div className="bg-accent/10 border border-accent/20 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">💬</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Managerial Feedback</h3>
                  {stats.correction_requested && <Badge variant="warning">Refining</Badge>}
              </div>
              <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-600">
                  <p className="text-sm text-gray-300 font-medium leading-relaxed italic">"{stats.remarks}"</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
