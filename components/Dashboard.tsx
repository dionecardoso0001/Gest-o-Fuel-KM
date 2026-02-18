import React, { useMemo } from 'react';
import { db } from '../services/db';
import { Gauge } from './Gauge';
import { TrendingUp, TrendingDown, DollarSign, Droplets, MapPin, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  vehicleId: string;
  month: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ vehicleId, month }) => {
  const stats = useMemo(() => {
    try {
      if (!vehicleId) return null;
      return db.getDashboardStats(vehicleId, month);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [vehicleId, month]);

  const vehicle = useMemo(() => {
     if (!vehicleId) return null;
     return db.getVehicles().find(v => v.id === vehicleId);
  }, [vehicleId]);

  const refuels = useMemo(() => {
      if (!vehicleId) return [];
      return db.getRefuels(vehicleId).filter(r => r.date.startsWith(month)).reverse();
  }, [vehicleId, month]);

  if (!vehicle || !stats) {
    return (
        <div className="flex items-center justify-center h-64 text-gray-500 glass-panel rounded-2xl">
            Selecione um veículo para visualizar a telemetria.
        </div>
    );
  }

  const budgetColor = stats.balance < 0 ? "text-racing-red" : "text-green-500";
  const budgetPercent = (stats.spentTotal / (stats.budgetTotal || 1)) * 100;

  // Prepare chart data
  const chartData = refuels.map(r => ({
    day: new Date(r.date).getDate(),
    price: r.pricePerLiter,
    kmL: r.computedConsumption?.kmPerLiter || 0
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Gauges Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 text-racing-red" />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                ORÇAMENTO MENSAL
                {stats.balance < 0 && <AlertTriangle className="w-4 h-4 text-racing-red animate-pulse" />}
            </h2>
            <Gauge 
              value={stats.spentTotal} 
              max={stats.budgetTotal || 1000} 
              label="Gasto Realizado" 
              unit="BRL"
              color={stats.balance < 0 ? "text-racing-red" : "text-green-500"} 
            />
            <div className="mt-4 w-full flex justify-between border-t border-gray-700 pt-3">
               <div>
                  <div className="text-xs text-gray-500">LIMITE</div>
                  <div className="font-mono text-sm">{formatCurrency(stats.budgetTotal)}</div>
               </div>
               <div className="text-right">
                  <div className="text-xs text-gray-500">SALDO</div>
                  <div className={`font-mono text-xl font-bold ${budgetColor}`}>{formatCurrency(stats.balance)}</div>
               </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Droplets className="w-24 h-24 text-blue-500" />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold text-gray-300 mb-4">AUTONOMIA ESTIMADA</h2>
            <Gauge 
              value={stats.estimatedRange} 
              max={1000} // Arbitrary max for gauge visual
              label="Alcance (Tanque Cheio)" 
              unit="KM"
              color="text-blue-500"
              warningThreshold={50}
            />
            <div className="mt-4 w-full flex justify-between border-t border-gray-700 pt-3">
                <div>
                   <div className="text-xs text-gray-500">CONSUMO MÉDIO</div>
                   <div className="font-mono text-sm text-white">{formatNumber(stats.avgKmPerLiter, 1)} km/L</div>
                </div>
                <div className="text-right">
                   <div className="text-xs text-gray-500">CUSTO / KM</div>
                   <div className="font-mono text-xl font-bold text-white">{formatCurrency(stats.avgCostPerKm)}</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-racing-dark border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="text-xs text-gray-500 uppercase">Litros (Mês)</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">{formatNumber(stats.totalLiters)} L</div>
        </div>
        <div className="bg-racing-dark border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
            <div className="text-xs text-gray-500 uppercase">Preço Médio</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">{formatCurrency(stats.avgPricePerLiter)}</div>
        </div>
        <div className="bg-racing-dark border border-gray-800 p-4 rounded-xl flex flex-col justify-between col-span-2 md:col-span-2">
            <div className="text-xs text-gray-500 uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Posto Campeão (Preço)
            </div>
            <div className="text-xl font-bold text-white mt-1 truncate">{stats.stationRanking.cheapest}</div>
            <div className="text-xs text-gray-600">Mais barato do mês</div>
        </div>
      </div>

      {/* Charts */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Telemetria de Consumo (KM/L)
        </h3>
        <div className="h-64 w-full">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorKmL" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff2b2b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ff2b2b" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="#555" tick={{fontSize: 10}} tickFormatter={(val) => `Dia ${val}`} />
                        <YAxis stroke="#555" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff'}}
                            itemStyle={{color: '#ff2b2b'}}
                        />
                        <Area type="monotone" dataKey="kmL" stroke="#ff2b2b" strokeWidth={3} fillOpacity={1} fill="url(#colorKmL)" />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                    Sem dados suficientes para gráfico neste mês
                </div>
            )}
        </div>
      </div>
    </div>
  );
};