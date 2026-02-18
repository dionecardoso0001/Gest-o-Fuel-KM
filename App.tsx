import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RefuelList } from './components/RefuelList';
import { RefuelForm } from './components/RefuelForm';
import { Settings } from './components/Settings';
import { db } from './services/db';
import { getMonthOptions } from './utils';
import { Plus } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Initialize with first vehicle found in DB to prevent "Vehicle not found" error on initial render
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    const vehicles = db.getVehicles();
    return vehicles.length > 0 ? vehicles[0].id : '';
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const vehicles = db.getVehicles();

  // If selectedVehicleId becomes invalid (e.g. deletion), reset to first available
  useEffect(() => {
    if (vehicles.length > 0 && !vehicles.find(v => v.id === selectedVehicleId)) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId, refreshTrigger]);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  if (vehicles.length === 0) return <div className="text-white p-10 flex justify-center items-center h-screen">Carregando Sistema...</div>;

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {/* Global Controls: Vehicle & Month Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex gap-4 w-full md:w-auto">
             <div className="relative group">
                <select 
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="appearance-none bg-racing-panel text-white border border-racing-red/50 py-2 px-4 pr-8 rounded-lg font-bold italic tracking-wide outline-none focus:shadow-[0_0_10px_rgba(255,43,43,0.3)] w-full md:w-64"
                >
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.name.toUpperCase()}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-racing-red text-xs">▼</div>
             </div>

             <div className="relative group">
                <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none bg-racing-black text-gray-300 border border-gray-700 py-2 px-4 pr-8 rounded-lg font-mono outline-none w-full md:w-48"
                >
                    {getMonthOptions().map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-gray-500 text-xs">▼</div>
             </div>
        </div>

        <button 
            onClick={() => setShowAddModal(true)}
            className="bg-racing-red hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-red-900/40 transition-all w-full md:w-auto justify-center"
        >
            <Plus size={20} /> <span className="italic">PIT STOP</span> (ADD)
        </button>
      </div>

      <div key={refreshTrigger}>
        {activeTab === 'dashboard' && selectedVehicleId && (
            <Dashboard vehicleId={selectedVehicleId} month={selectedMonth} />
        )}
        
        {activeTab === 'refuels' && selectedVehicleId && (
            <RefuelList vehicleId={selectedVehicleId} month={selectedMonth} onRefresh={refreshData} />
        )}

        {activeTab === 'vehicles' && selectedVehicleId && (
             <Settings vehicleId={selectedVehicleId} onUpdate={refreshData} />
        )}

        {activeTab === 'reports' && (
             <div className="glass-panel p-10 text-center text-gray-500">
                <h2 className="text-2xl font-bold mb-2">TELEMETRIA AVANÇADA</h2>
                <p>Módulo de relatórios detalhados em desenvolvimento pela equipe de engenharia.</p>
                <p className="mt-4 text-xs font-mono">Disponível na próxima atualização de firmware v1.1</p>
             </div>
        )}
      </div>

      {showAddModal && currentVehicle && (
        <RefuelForm 
            vehicle={currentVehicle} 
            onClose={() => setShowAddModal(false)} 
            onSuccess={() => {
                setShowAddModal(false);
                refreshData();
            }}
        />
      )}

    </Layout>
  );
};

export default App;