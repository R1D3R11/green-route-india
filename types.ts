export enum TransportMode {
  WALK = 'Walk',
  METRO = 'Metro',
  BUS = 'Bus',
  TRAIN = 'Local Train',
  AUTO = 'Auto/Taxi',
  E_BIKE = 'E-Bike'
}

export interface RouteStep {
  mode: string;
  instruction: string;
  duration: number; // in minutes
}

export interface RouteOption {
  id: string;
  title: string;
  totalDuration: number; // in minutes
  totalCost: number; // in INR
  co2Emitted: number; // in kg

  // Savings vs Baseline Cab
  timeSaved: number; // in minutes (positive = faster, negative = slower)
  moneySaved: number; // in INR
  co2Saved: number; // in kg

  steps: RouteStep[];
  tags: string[]; // e.g., 'Greenest', 'Fastest', 'Cheapest'
  score: number; // A calculated efficiency score
}

export interface SearchParams {
  origin: string;
  destination: string;
  city: string;
}
