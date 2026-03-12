import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const OrganogramPage = () => {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      // Get the first company as the root for now
      const companiesRes = await axiosInstance.get("org/companies/");
      const companies = companiesRes.data.results || companiesRes.data;
      
      if (companies.length > 0) {
        const treeRes = await axiosInstance.get(`org/companies/${companies[0].id}/tree/`);
        setTree(treeRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch organization tree", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Mapping organizational structure...</div>;
  if (!tree) return <div className="p-8 text-center text-gray-400">No organizational data found. Start by adding a Company.</div>;

  return (
    <div className="space-y-8 pb-12 overflow-x-auto min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Organogram</h1>
          <p className="text-sm text-gray-400 mt-1">Hierarchical visualization of departments and team structures</p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Company Root */}
        <div className="relative mb-16">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-2xl border border-white/20 min-w-[240px] text-center z-10 relative">
            <span className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] mb-2 block">Headquarters</span>
            <h2 className="text-xl font-black text-white">{tree.name}</h2>
          </div>
          <div className="absolute left-1/2 -bottom-16 w-1 h-16 bg-gradient-to-b from-indigo-700 to-dark-600 -translate-x-1/2"></div>
        </div>

        {/* Departments Level */}
        <div className="flex gap-12 items-start">
          {tree.children.map((dept, idx) => (
            <div key={dept.id} className="relative flex flex-col items-center">
              {/* Connector lines for departments */}
              {tree.children.length > 1 && (
                <>
                  {idx === 0 && <div className="absolute top-0 right-0 w-1/2 h-1 bg-dark-600"></div>}
                  {idx === tree.children.length - 1 && <div className="absolute top-0 left-0 w-1/2 h-1 bg-dark-600"></div>}
                  {idx > 0 && idx < tree.children.length - 1 && <div className="absolute top-0 left-0 w-full h-1 bg-dark-600"></div>}
                </>
              )}
              <div className="w-1 h-8 bg-dark-600"></div>
              
              <div className="bg-dark-800 border-2 border-indigo-500/30 p-5 rounded-2xl shadow-xl min-w-[200px] text-center mb-12 hover:border-indigo-500 transition-colors cursor-pointer group">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Department</span>
                <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{dept.name}</h3>
              </div>

              {/* Teams Level */}
              {dept.children && dept.children.length > 0 && (
                <div className="flex flex-col gap-6 items-center">
                  <div className="w-1 h-6 bg-dark-600 -mt-12"></div>
                  <div className="grid gap-4">
                    {dept.children.map(team => (
                      <div key={team.id} className="flex flex-col items-center">
                        <div className="w-1 h-4 bg-dark-600"></div>
                        <div className="bg-dark-700/50 border border-dark-600 p-4 rounded-xl shadow-lg min-w-[180px] hover:bg-dark-700 transition-all border-l-4 border-l-emerald-500">
                           <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Active Team</span>
                                <span className="text-xs">👥</span>
                           </div>
                           <h4 className="text-sm font-bold text-white mb-1">{team.name}</h4>
                           <div className="flex items-center gap-2">
                             <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-[8px] text-emerald-400">👤</div>
                             <p className="text-[10px] text-gray-400 font-medium">Lead: <span className="text-gray-200">{team.manager}</span></p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganogramPage;
