import React, { useState } from 'react';
import { db } from '../services/db';
import { Vehicle } from '../types';
import { Save, X, AlertOctagon } from 'lucide-react';

interface RefuelFormProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSuccess: () => void;
}

export const RefuelForm: React.FC<RefuelFormProps> = ({ vehicle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    liters: '',
    totalAmount: '',
    odometer: '',
    station: '',
    notes: '',
    fuelType: vehicle.defaultFuel
  });
  
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const liters = parseFloat(formData.liters);
    const totalAmount = parseFloat(formData.totalAmount);
    const odometer = parseInt(formData.odometer);

    if (liters <= 0 || totalAmount <= 0) {
      setError('Valores inválidos para litros ou valor total.');
      return;
    }
    
    // Strict Validation: Cannot enter odometer lower than current
    // This assumes chronological entry (standard for fuel logs)
    if (odometer <= vehicle.currentOdometer) {
       setError(`O hodômetro deve ser maior que o atual (${vehicle.currentOdometer} km).`);
       return;
    }

    const pricePerLiter = totalAmount / liters;

    db.addRefuel({
        id: crypto.randomUUID(),
        vehicleId: vehicle.id,
        date: new Date(formData.date).toISOString(),
        fuelType: formData.fuelType as any,
        liters,
        totalAmount,
        odometer,
        station: formData.station,
        notes: formData.notes,
        pricePerLiter
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-racing-panel border border-racing-red/40 rounded-2xl w-full max-w-lg shadow-[0_0_30px_rgba(255,0,0,0.1)] overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-racing-redDark to-racing-panel p-4 flex justify-between items-center">
            <h2 className="font-bold text-white italic text-lg flex items-center gap-2">
                <span className="bg-white text-racing-red px-2 rounded text-xs not-italic">NOVO</span> ABASTECIMENTO
            </h2>
            <button onClick={onClose} className="text-white/70 hover:text-white"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
              <div className="bg-red-900/80 text-white p-3 rounded-lg text-sm border border-red-500 flex items-center gap-2 animate-pulse">
                  <AlertOctagon size={16} /> {error}
              </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs text-gray-500 mb-1">DATA/HORA</label>
                <input 
                    type="datetime-local" 
                    required
                    className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white focus:border-racing-red outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1">COMBUSTÍVEL</label>
                <select 
                    className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white focus:border-racing-red outline-none"
                    value={formData.fuelType}
                    onChange={e => setFormData({...formData, fuelType: e.target.value as any})}
                >
                    <option value="gasoline">Gasolina</option>
                    <option value="ethanol">Etanol</option>
                </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
                <label className="block text-xs text-gray-500 mb-1">VALOR TOTAL (R$)</label>
                <input 
                    type="number" step="0.01" required placeholder="0.00"
                    className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-racing-red outline-none"
                    value={formData.totalAmount}
                    onChange={e => setFormData({...formData, totalAmount: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1">LITROS</label>
                <input 
                    type="number" step="0.01" required placeholder="0.00"
                    className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-racing-red outline-none"
                    value={formData.liters}
                    onChange={e => setFormData({...formData, liters: e.target.value})}
                />
            </div>
             <div>
                <label className="block text-xs text-gray-500 mb-1 text-racing-red">PREÇO/L</label>
                <div className="bg-gray-800/50 rounded-lg p-2 text-racing-red font-mono font-bold text-center border border-gray-700">
                    {formData.liters && formData.totalAmount 
                        ? (parseFloat(formData.totalAmount) / parseFloat(formData.liters)).toFixed(2) 
                        : '-.--'}
                </div>
            </div>
          </div>

          <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
             <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Novo Hodômetro (KM)</label>
             <div className="relative">
                 <input 
                    type="number" required placeholder={`Min: ${vehicle.currentOdometer + 1}`}
                    className="w-full bg-racing-black border border-gray-600 rounded-lg p-3 text-white font-mono text-xl focus:border-racing-red outline-none tracking-widest"
                    value={formData.odometer}
                    onChange={e => setFormData({...formData, odometer: e.target.value})}
                 />
                 <div className="absolute right-3 top-4 text-xs text-gray-500">KM</div>
             </div>
             <div className="text-[10px] text-gray-500 mt-2 flex justify-between">
                <span>Anterior: <strong className="text-gray-300">{vehicle.currentOdometer} km</strong></span>
                {formData.odometer && parseInt(formData.odometer) > vehicle.currentOdometer && (
                    <span className="text-racing-red">
                        (+{parseInt(formData.odometer) - vehicle.currentOdometer} km)
                    </span>
                )}
             </div>
          </div>

          <div>
             <label className="block text-xs text-gray-500 mb-1">POSTO / LOCAL</label>
             <input 
                type="text" placeholder="Ex: Posto Shell da Esquina"
                className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white focus:border-racing-red outline-none"
                value={formData.station}
                onChange={e => setFormData({...formData, station: e.target.value})}
             />
          </div>

          <div className="pt-2 flex justify-end">
            <button 
                type="submit" 
                className="w-full bg-racing-red hover:bg-red-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-[0_4px_14px_0_rgba(255,43,43,0.39)]"
            >
                <Save size={20} /> CONFIRMAR ABASTECIMENTO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};