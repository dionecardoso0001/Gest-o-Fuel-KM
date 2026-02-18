import React from 'react';
import { db } from '../services/db';
import { Trash2 } from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '../utils';

interface RefuelListProps {
  vehicleId: string;
  month: string;
  onRefresh: () => void;
}

export const RefuelList: React.FC<RefuelListProps> = ({ vehicleId, month, onRefresh }) => {
  const refuels = db.getRefuels(vehicleId).filter(r => r.date.startsWith(month));

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir? Isso recalculará as médias do período.')) {
      db.deleteRefuel(id);
      onRefresh();
    }
  };

  return (
    <div className="bg-racing-panel border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-racing-black text-gray-500 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Posto</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-right">Litros</th>
              <th className="px-6 py-4 text-right">KM</th>
              <th className="px-6 py-4 text-center">Consumo (N-1)</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {refuels.length === 0 ? (
               <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-600">Nenhum abastecimento neste mês.</td></tr>
            ) : (
                refuels.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-300">{formatDate(r.date)}</td>
                        <td className="px-6 py-4 text-gray-300">{r.station || '-'}</td>
                        <td className="px-6 py-4 text-right font-mono text-white">{formatCurrency(r.totalAmount)}</td>
                        <td className="px-6 py-4 text-right font-mono text-gray-400">{formatNumber(r.liters)} L</td>
                        <td className="px-6 py-4 text-right font-mono text-gray-400">{r.odometer}</td>
                        <td className="px-6 py-4 text-center font-mono">
                            {r.computedConsumption ? (
                                <span className="bg-gray-800 text-racing-red px-2 py-1 rounded border border-gray-700">
                                    {formatNumber(r.computedConsumption.kmPerLiter, 1)} km/L
                                </span>
                            ) : (
                                <span className="text-gray-600 text-xs">-</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button onClick={() => handleDelete(r.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};