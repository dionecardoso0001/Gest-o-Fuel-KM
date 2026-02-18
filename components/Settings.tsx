import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Vehicle, Budget } from '../types';
import { Save, Plus, Trash2, Car, AlertTriangle } from 'lucide-react';
import { getMonthOptions } from '../utils';

interface SettingsProps {
    vehicleId: string;
    onUpdate: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ vehicleId, onUpdate }) => {
    const vehicles = db.getVehicles();
    const vehicle = vehicles.find(v => v.id === vehicleId);
    
    // Budget State
    const [budgetAmount, setBudgetAmount] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [strategy, setStrategy] = useState<'RESET' | 'CARRY'>('RESET');
    const [budgetMsg, setBudgetMsg] = useState('');

    // Vehicle Edit State
    const [editForm, setEditForm] = useState<Partial<Vehicle>>({});
    const [vehicleMsg, setVehicleMsg] = useState('');

    // New Vehicle State
    const [showNewVehicle, setShowNewVehicle] = useState(false);
    const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
        name: '', plate: '', tankCapacity: 50, defaultFuel: 'gasoline', currentOdometer: 0
    });

    useEffect(() => {
        if (vehicle) {
            setEditForm(vehicle);
            const savedBudget = db.getBudgetForMonth(vehicle.id, selectedMonth);
            if (savedBudget) {
                setBudgetAmount(savedBudget.amount.toString());
                setStrategy(savedBudget.strategy);
            } else {
                setBudgetAmount('');
                setStrategy('RESET');
            }
        }
    }, [vehicle, selectedMonth]);

    if (!vehicle) return null;

    // --- Handlers ---

    const handleSaveBudget = (e: React.FormEvent) => {
        e.preventDefault();
        const budget: Budget = {
            id: `b-${vehicleId}-${selectedMonth}`,
            vehicleId,
            month: selectedMonth,
            amount: parseFloat(budgetAmount),
            strategy
        };
        db.saveBudget(budget);
        setBudgetMsg('Orçamento atualizado!');
        setTimeout(() => setBudgetMsg(''), 3000);
        onUpdate();
    };

    const handleUpdateVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.name || !editForm.tankCapacity) return;
        
        db.saveVehicle({
            ...vehicle,
            ...editForm as Vehicle
        });
        setVehicleMsg('Dados do veículo atualizados!');
        setTimeout(() => setVehicleMsg(''), 3000);
        onUpdate();
    };

    const handleDeleteVehicle = () => {
        if (vehicles.length <= 1) {
            alert("Você precisa ter pelo menos um veículo ativo.");
            return;
        }
        if (confirm(`Tem certeza que deseja excluir o ${vehicle.name}? Todo o histórico será perdido.`)) {
            db.deleteVehicle(vehicle.id);
            onUpdate();
        }
    };

    const handleCreateVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVehicle.name) return;

        const created: Vehicle = {
            id: crypto.randomUUID(),
            name: newVehicle.name!,
            plate: newVehicle.plate || 'SEM-PLACA',
            tankCapacity: Number(newVehicle.tankCapacity) || 50,
            defaultFuel: newVehicle.defaultFuel as any || 'gasoline',
            currentOdometer: Number(newVehicle.currentOdometer) || 0
        };

        db.saveVehicle(created);
        setShowNewVehicle(false);
        setNewVehicle({ name: '', plate: '', tankCapacity: 50, defaultFuel: 'gasoline', currentOdometer: 0 });
        onUpdate();
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Grid Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Card 1: Editar Veículo Atual */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                        <h2 className="text-xl font-bold text-white italic flex items-center gap-2">
                            <Car className="text-racing-red" /> EDITAR MÁQUINA
                        </h2>
                        {vehicles.length > 1 && (
                            <button 
                                onClick={handleDeleteVehicle}
                                className="text-gray-500 hover:text-red-500 text-xs flex items-center gap-1 transition-colors"
                            >
                                <Trash2 size={14} /> EXCLUIR
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleUpdateVehicle} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">NOME / MODELO</label>
                            <input 
                                type="text" value={editForm.name || ''}
                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white focus:border-racing-red outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">PLACA</label>
                                <input 
                                    type="text" value={editForm.plate || ''}
                                    onChange={e => setEditForm({...editForm, plate: e.target.value})}
                                    className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white font-mono uppercase focus:border-racing-red outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">TANQUE (L)</label>
                                <input 
                                    type="number" value={editForm.tankCapacity || ''}
                                    onChange={e => setEditForm({...editForm, tankCapacity: parseFloat(e.target.value)})}
                                    className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-racing-red outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">COMBUSTÍVEL PADRÃO</label>
                            <select 
                                value={editForm.defaultFuel}
                                onChange={e => setEditForm({...editForm, defaultFuel: e.target.value as any})}
                                className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white focus:border-racing-red outline-none"
                            >
                                <option value="gasoline">Gasolina</option>
                                <option value="ethanol">Etanol (Álcool)</option>
                            </select>
                        </div>
                        
                        <div className="pt-2">
                             <div className="text-xs text-gray-600 mb-2 font-mono">
                                KM Atual: <span className="text-white">{vehicle.currentOdometer}</span> (Editável apenas via Abastecimentos)
                             </div>
                             <button type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition-colors border border-gray-600">
                                SALVAR ALTERAÇÕES
                             </button>
                             {vehicleMsg && <div className="text-green-500 text-xs text-center mt-2 animate-fade-in">{vehicleMsg}</div>}
                        </div>
                    </form>
                </div>

                {/* Card 2: Configurar Orçamento */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-6 italic border-b border-gray-700 pb-2">
                        CONFIGURAR ORÇAMENTO
                    </h2>
                    <form onSubmit={handleSaveBudget} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">MÊS DE REFERÊNCIA</label>
                            <select 
                                className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-racing-red"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                {getMonthOptions().map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">VALOR MENSAL (R$)</label>
                            <input 
                                type="number" 
                                required 
                                placeholder="Ex: 800.00"
                                className="w-full bg-racing-black border border-gray-700 rounded-lg p-2 text-white font-mono outline-none focus:border-racing-red"
                                value={budgetAmount}
                                onChange={(e) => setBudgetAmount(e.target.value)}
                            />
                        </div>

                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                            <label className="block text-xs text-gray-400 mb-2 uppercase font-bold">Estratégia de Saldo</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="radio" 
                                        name="strategy" 
                                        value="RESET" 
                                        checked={strategy === 'RESET'} 
                                        onChange={() => setStrategy('RESET')}
                                        className="accent-racing-red w-4 h-4"
                                    />
                                    <div>
                                        <span className="text-sm text-gray-200 block group-hover:text-white">Zerar a cada mês</span>
                                        <span className="text-[10px] text-gray-500">O saldo não utilizado é perdido.</span>
                                    </div>
                                </label>
                                <hr className="border-gray-700/50" />
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="radio" 
                                        name="strategy" 
                                        value="CARRY" 
                                        checked={strategy === 'CARRY'} 
                                        onChange={() => setStrategy('CARRY')}
                                        className="accent-racing-red w-4 h-4"
                                    />
                                    <div>
                                        <span className="text-sm text-gray-200 block group-hover:text-white">Carregar Saldo (Carryover)</span>
                                        <span className="text-[10px] text-gray-500">Saldo positivo soma ao mês seguinte.</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-racing-red hover:bg-red-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 mt-4 transition-colors shadow-lg shadow-red-900/20">
                            <Save size={18} /> ATUALIZAR ORÇAMENTO
                        </button>
                        {budgetMsg && <div className="text-green-500 text-sm text-center animate-pulse">{budgetMsg}</div>}
                    </form>
                </div>
            </div>

            {/* Section: Add New Vehicle */}
            {vehicles.length < 3 ? (
                <div className="border-t border-gray-800 pt-8">
                    {!showNewVehicle ? (
                        <button 
                            onClick={() => setShowNewVehicle(true)}
                            className="w-full py-4 border-2 border-dashed border-gray-700 text-gray-500 rounded-xl hover:border-racing-red hover:text-racing-red hover:bg-racing-red/5 transition-all flex items-center justify-center gap-2 font-bold tracking-wide"
                        >
                            <Plus size={20} /> ADICIONAR NOVO VEÍCULO À GARAGEM ({vehicles.length}/3)
                        </button>
                    ) : (
                        <div className="glass-panel p-6 rounded-2xl animate-fade-in border border-racing-red">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Plus className="text-racing-red" /> NOVO CARRO
                            </h3>
                            <form onSubmit={handleCreateVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input 
                                    type="text" placeholder="Nome / Modelo (Ex: Fiat Uno)" required
                                    value={newVehicle.name} onChange={e => setNewVehicle({...newVehicle, name: e.target.value})}
                                    className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-racing-red outline-none"
                                />
                                <input 
                                    type="text" placeholder="Placa (Opcional)"
                                    value={newVehicle.plate} onChange={e => setNewVehicle({...newVehicle, plate: e.target.value})}
                                    className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-racing-red outline-none font-mono uppercase"
                                />
                                <div className="flex gap-4">
                                    <input 
                                        type="number" placeholder="Tanque (L)" required
                                        value={newVehicle.tankCapacity} onChange={e => setNewVehicle({...newVehicle, tankCapacity: parseFloat(e.target.value)})}
                                        className="w-1/2 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-racing-red outline-none"
                                    />
                                    <input 
                                        type="number" placeholder="KM Atual"
                                        value={newVehicle.currentOdometer} onChange={e => setNewVehicle({...newVehicle, currentOdometer: parseInt(e.target.value)})}
                                        className="w-1/2 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-racing-red outline-none"
                                    />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <button type="button" onClick={() => setShowNewVehicle(false)} className="px-4 py-3 rounded-lg text-gray-400 hover:text-white">Cancelar</button>
                                    <button type="submit" className="flex-1 bg-racing-red text-white font-bold py-3 rounded-lg hover:bg-red-600">CADASTRAR</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-gray-500 text-sm">
                    Garagem lotada (Máx 3 veículos). Exclua um veículo para adicionar outro.
                </div>
            )}
        </div>
    );
};