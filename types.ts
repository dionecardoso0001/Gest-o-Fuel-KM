export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  defaultFuel: 'gasoline' | 'ethanol';
  tankCapacity: number; // Default 50L
  currentOdometer: number; // Updated on refuel
}

export interface Budget {
  id: string;
  vehicleId: string;
  month: string; // Format YYYY-MM
  amount: number;
  strategy: 'RESET' | 'CARRY';
}

export interface Refuel {
  id: string;
  vehicleId: string;
  date: string; // ISO string
  fuelType: 'gasoline' | 'ethanol';
  totalAmount: number;
  liters: number;
  odometer: number;
  station: string;
  notes?: string;
  
  // Computed / Derived fields
  pricePerLiter: number; // totalAmount / liters
  
  // Historical Analysis (calculated relative to previous/next)
  computedConsumption?: {
    prevRefuelId: string;
    distanceDriven: number; // odometer - prevRefuel.odometer
    kmPerLiter: number; // distanceDriven / prevRefuel.liters (Using N-1 logic from prompt)
    costPerKm: number; // prevRefuel.totalAmount / distanceDriven
  };
}

export interface DashboardStats {
  month: string;
  budgetTotal: number;
  spentTotal: number;
  balance: number;
  totalLiters: number;
  avgPricePerLiter: number;
  avgKmPerLiter: number;
  avgCostPerKm: number;
  estimatedRange: number; // Based on tank capacity * avgKmPerLiter
  fuelRemainingEstimate: number; // Heuristic
  stationRanking: {
    cheapest: string;
    mostExpensive: string;
    mostFrequent: string;
  };
}