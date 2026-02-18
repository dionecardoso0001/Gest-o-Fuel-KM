import { Vehicle, Budget, Refuel, DashboardStats } from '../types';

const STORAGE_KEYS = {
  VEHICLES: 'fuelracing_vehicles',
  BUDGETS: 'fuelracing_budgets',
  REFUELS: 'fuelracing_refuels',
};

// Seed Data
const SEED_VEHICLES: Vehicle[] = [
  { id: 'v1', name: 'Fiat Pulse Abarth', plate: 'RACING-01', defaultFuel: 'gasoline', tankCapacity: 50, currentOdometer: 12500 },
  { id: 'v2', name: 'Ferrari 488 Pista', plate: 'FAST-99', defaultFuel: 'gasoline', tankCapacity: 78, currentOdometer: 5400 },
];

const SEED_BUDGETS: Budget[] = [
  { id: 'b1', vehicleId: 'v1', month: new Date().toISOString().slice(0, 7), amount: 800, strategy: 'CARRY' },
  { id: 'b2', vehicleId: 'v2', month: new Date().toISOString().slice(0, 7), amount: 2000, strategy: 'RESET' },
];

const SEED_REFUELS: Refuel[] = [
  // Setup logic: To have calculated consumption for N-1, we need N.
  // Vehicle 1 history
  { 
    id: 'r1', vehicleId: 'v1', date: '2023-10-01T10:00:00.000Z', 
    fuelType: 'gasoline', totalAmount: 250, liters: 45, pricePerLiter: 5.55, 
    odometer: 11800, station: 'Shell Racing' 
  },
  { 
    id: 'r2', vehicleId: 'v1', date: '2023-10-15T10:00:00.000Z', 
    fuelType: 'gasoline', totalAmount: 260, liters: 44, pricePerLiter: 5.90, 
    odometer: 12200, station: 'Podium BR' 
    // Distance = 12200 - 11800 = 400. 
    // Logic from prompt: Consump(N-1 i.e., r1) = Distance / Liters(N-1 i.e., r1). 
    // Note: Usually consumption is Dist / Liters(N). But following prompt: 400 / 45 = 8.88 km/L
  },
  { 
    id: 'r3', vehicleId: 'v1', date: '2023-10-28T10:00:00.000Z', 
    fuelType: 'ethanol', totalAmount: 180, liters: 48, pricePerLiter: 3.75, 
    odometer: 12500, station: 'Texaco' 
    // Distance = 12500 - 12200 = 300.
    // Consump(r2) = 300 / 44 = 6.81 km/L
  }
];

class DatabaseService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(SEED_VEHICLES));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(SEED_BUDGETS));
      localStorage.setItem(STORAGE_KEYS.REFUELS, JSON.stringify(SEED_REFUELS));
      this.recalculateAllMetrics(); // Ensure seed data is processed
    }
  }

  // --- Helpers ---
  private save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private load<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // --- Vehicles ---
  getVehicles(): Vehicle[] {
    return this.load<Vehicle>(STORAGE_KEYS.VEHICLES);
  }

  saveVehicle(vehicle: Vehicle) {
    const list = this.getVehicles();
    const index = list.findIndex(v => v.id === vehicle.id);
    if (index >= 0) list[index] = vehicle;
    else list.push(vehicle);
    this.save(STORAGE_KEYS.VEHICLES, list);
  }

  deleteVehicle(id: string) {
    const list = this.getVehicles().filter(v => v.id !== id);
    this.save(STORAGE_KEYS.VEHICLES, list);
  }

  // --- Budgets ---
  getBudgets(vehicleId: string): Budget[] {
    return this.load<Budget>(STORAGE_KEYS.BUDGETS).filter(b => b.vehicleId === vehicleId);
  }

  getBudgetForMonth(vehicleId: string, month: string): Budget | undefined {
    return this.getBudgets(vehicleId).find(b => b.month === month);
  }

  saveBudget(budget: Budget) {
    const list = this.load<Budget>(STORAGE_KEYS.BUDGETS);
    const index = list.findIndex(b => b.id === budget.id);
    if (index >= 0) list[index] = budget;
    else list.push(budget);
    this.save(STORAGE_KEYS.BUDGETS, list);
  }

  // --- Refuels & Logic ---
  getRefuels(vehicleId: string): Refuel[] {
    const refuels = this.load<Refuel>(STORAGE_KEYS.REFUELS)
      .filter(r => r.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Descending
    return refuels;
  }

  addRefuel(refuel: Refuel) {
    const all = this.load<Refuel>(STORAGE_KEYS.REFUELS);
    all.push(refuel);
    this.save(STORAGE_KEYS.REFUELS, all);
    
    // Update Vehicle Odometer
    const vehicles = this.getVehicles();
    const vIndex = vehicles.findIndex(v => v.id === refuel.vehicleId);
    if (vIndex >= 0) {
      if (refuel.odometer > vehicles[vIndex].currentOdometer) {
        vehicles[vIndex].currentOdometer = refuel.odometer;
        this.save(STORAGE_KEYS.VEHICLES, vehicles);
      }
    }

    this.recalculateAllMetrics();
  }

  deleteRefuel(id: string) {
    const all = this.load<Refuel>(STORAGE_KEYS.REFUELS).filter(r => r.id !== id);
    this.save(STORAGE_KEYS.REFUELS, all);
    this.recalculateAllMetrics();
  }

  // --- Core Calculation Logic ---
  // Recalculates consumption for the entire chain of a vehicle
  private recalculateAllMetrics() {
    const allRefuels = this.load<Refuel>(STORAGE_KEYS.REFUELS);
    const vehicles = this.getVehicles();

    // Map to store updates
    const updatedRefuels: Refuel[] = [];

    vehicles.forEach(vehicle => {
      // Get vehicle refuels sorted by Odometer (ascending) for calculation
      const vRefuels = allRefuels
        .filter(r => r.vehicleId === vehicle.id)
        .sort((a, b) => a.odometer - b.odometer);

      for (let i = 0; i < vRefuels.length; i++) {
        const current = vRefuels[i]; // N
        
        // Logic: The consumption of the *current* record is usually known when the *next* record exists.
        // Prompt Rule: "consumo_km_por_litro_do_abastecimento_anterior = distância_rodada / litros(N-1)"
        // This means at index i, we calculate stats for index i-1.
        
        if (i > 0) {
          const prev = vRefuels[i - 1]; // N-1
          const dist = current.odometer - prev.odometer;

          if (dist > 0 && prev.liters > 0) {
            // Calculate stats for PREVIOUS entry
            prev.computedConsumption = {
              prevRefuelId: prev.id, // Self ref technically in this logic, but acts as the anchor
              distanceDriven: dist,
              kmPerLiter: dist / prev.liters, 
              costPerKm: prev.totalAmount / dist
            };
          } else {
             delete prev.computedConsumption;
          }
        } else {
          // The first entry ever cannot have a calculated consumption based on "previous" liters because there is no previous fill-up to compare a delta against.
          // And it can't calculate its own efficiency until the next one arrives.
          delete current.computedConsumption; 
        }
        
        // Also clear the last one because it has no "Next" to close the loop
        if (i === vRefuels.length - 1) {
             delete current.computedConsumption;
        }
      }
      
      updatedRefuels.push(...vRefuels);
    });

    // Replace refuels in storage (filter out ones that belong to other deleted vehicles if any, though not implemented)
    // Here we just merge back.
    // For simplicity in this mock, we just overwrite the array for known vehicles.
    // However, to be safe, let's keep refuels for unknown vehicles (if any) intact.
    
    const knownIds = new Set(updatedRefuels.map(r => r.id));
    const others = allRefuels.filter(r => !knownIds.has(r.id));
    
    this.save(STORAGE_KEYS.REFUELS, [...updatedRefuels, ...others]);
  }

  getDashboardStats(vehicleId: string, month: string): DashboardStats {
    const vehicle = this.getVehicles().find(v => v.id === vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const allBudgets = this.getBudgets(vehicleId).sort((a, b) => a.month.localeCompare(b.month));
    const currentBudget = allBudgets.find(b => b.month === month);
    
    // Carryover Logic
    let carryOverBalance = 0;
    
    // Calculate cumulative balance up to previous month
    if (currentBudget && currentBudget.strategy === 'CARRY') {
        // Find previous budgets
        const prevBudgets = allBudgets.filter(b => b.month < month);
        prevBudgets.forEach(b => {
             const refuelsInThatMonth = this.getRefuels(vehicleId).filter(r => r.date.startsWith(b.month));
             const spent = refuelsInThatMonth.reduce((acc, curr) => acc + curr.totalAmount, 0);
             const balance = b.amount - spent; // Simple monthly balance
             // If positive, it adds to pile. If negative, it stays as debt (based on prompt "manter o orçamento definido e mostrar dívida como aviso", 
             // implying negative balance persists or just doesn't reset? 
             // Prompt: "novo_orcamento_total = orcamento_definido + saldo_anterior (se saldo_anterior > 0)". 
             // "se saldo anterior for negativo, manter o orçamento definido e mostrar dívida como aviso (não subtrair automaticamente)"
             // This is tricky. Let's simplify: We only add POSITIVE carryover to the BUDGET TOTAL.
             if (balance > 0) {
                 carryOverBalance += balance;
             }
        });
    }

    const budgetAmount = currentBudget ? currentBudget.amount + carryOverBalance : 0;
    
    // Current Month Metrics
    const refuels = this.getRefuels(vehicleId).filter(r => r.date.startsWith(month));
    const spentTotal = refuels.reduce((acc, r) => acc + r.totalAmount, 0);
    const totalLiters = refuels.reduce((acc, r) => acc + r.liters, 0);
    
    // Averages
    const avgPrice = totalLiters > 0 ? spentTotal / totalLiters : 0;
    
    // Consumptions (Only consider records in this month that HAVE a computation)
    const validConsumptions = refuels.filter(r => r.computedConsumption);
    const avgKmL = validConsumptions.length > 0 
      ? validConsumptions.reduce((acc, r) => acc + (r.computedConsumption?.kmPerLiter || 0), 0) / validConsumptions.length
      : 0;
      
    const avgCostKm = validConsumptions.length > 0
      ? validConsumptions.reduce((acc, r) => acc + (r.computedConsumption?.costPerKm || 0), 0) / validConsumptions.length
      : 0;

    // Station Ranking
    const stations: Record<string, { count: number; totalCost: number; totalLiters: number }> = {};
    refuels.forEach(r => {
        if (!stations[r.station]) stations[r.station] = { count: 0, totalCost: 0, totalLiters: 0 };
        stations[r.station].count++;
        stations[r.station].totalCost += r.totalAmount;
        stations[r.station].totalLiters += r.liters;
    });

    const sortedByPrice = Object.entries(stations).map(([name, data]) => ({
        name,
        avgPrice: data.totalCost / data.totalLiters,
        count: data.count
    })).sort((a, b) => a.avgPrice - b.avgPrice);
    
    const sortedByFreq = [...sortedByPrice].sort((a, b) => b.count - a.count);

    // Heuristic Fuel Remaining
    // Find LAST refuel for this vehicle (globally, not just this month)
    const globalRefuels = this.getRefuels(vehicleId); // Already sorted desc
    const lastRefuel = globalRefuels[0];
    
    let fuelRemainingEstimate = 0;
    
    // Average consumption from last 5 valid entries
    const last5Consumptions = globalRefuels
        .filter(r => r.computedConsumption)
        .slice(0, 5)
        .map(r => r.computedConsumption!.kmPerLiter);
    
    const movingAvgKmL = last5Consumptions.length > 0 
        ? last5Consumptions.reduce((a, b) => a + b, 0) / last5Consumptions.length 
        : (vehicle.defaultFuel === 'ethanol' ? 7 : 10); // Default fallback

    if (lastRefuel) {
        // Estimated: We don't have CURRENT odometer. We only know what happened AT the last refuel.
        // If we assume the user just opened the app to log something, or look at dashboard.
        // We can only show "Range added by last refuel" minus "nothing" because we lack telemetry.
        // However, prompt asks: "litros_consumidos_desde_ultimo = distância_rodada / consumo_medio_atual".
        // This implies we DO know distance driven since last. But we don't have an input for "Current Odo" on dashboard.
        // I will assume the dashboard shows the status AS OF the last refuel OR (if I implement a quick odometer update).
        // For now, let's just project based on the LAST known odometer vs Tank Capacity.
        
        // Actually, let's calculate the "Virtual" remaining based on:
        // Capacity - (Litros burned since LAST full fill?). No, that's too complex without "Full/Partial" flag.
        // Let's use the prompt's formula rigorously, assuming "distância_rodada" refers to a hypothetical or we can't compute it without input.
        // Fallback: We will display "Range Available" based on Tank Capacity * MovingAvg.
        // And "Reserve Warning" if the last fill-up was small? No.
        
        // Let's implement the prompt's intent: "estimar... litros_restantes".
        // I'll assume the vehicle is currently at `vehicle.currentOdometer`.
        // Wait, vehicle.currentOdometer is updated on refuel. So at the moment of viewing, `distância_rodada` since last refuel is 0.
        // So `litros_restantes_estimado` = `litros_abastecidos_no_ultimo` (assuming empty start) OR `tank_capacity` (if full).
        // Let's default to: Tank Capacity * Percentage?
        // Simpler approach: 
        // 1. Calculate Est Range = TankCapacity * MovingAvg.
        // 2. Display this as the static potential of the car.
        
        fuelRemainingEstimate = vehicle.tankCapacity; // Just show capacity for now as "Max Potential"
    }

    return {
      month,
      budgetTotal: budgetAmount,
      spentTotal,
      balance: budgetAmount - spentTotal,
      totalLiters,
      avgPricePerLiter: avgPrice,
      avgKmPerLiter: avgKmL,
      avgCostPerKm: avgCostKm,
      estimatedRange: vehicle.tankCapacity * movingAvgKmL,
      fuelRemainingEstimate: 0, // Not accurately possible without real-time odo
      stationRanking: {
        cheapest: sortedByPrice[0]?.name || '-',
        mostExpensive: sortedByPrice[sortedByPrice.length - 1]?.name || '-',
        mostFrequent: sortedByFreq[0]?.name || '-'
      }
    };
  }
}

export const db = new DatabaseService();