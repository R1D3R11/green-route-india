import React from 'react';
import { 
  Leaf, 
  Zap, 
  IndianRupee, 
  Clock, 
  MapPin, 
  Navigation, 
  Train, 
  Bus, 
  Footprints, 
  Bike, 
  Car,
  ArrowRight,
  Search,
  Menu,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  BarChart2,
  X,
  Trophy,
  Check,
  ExternalLink,
  Map,
  CheckCircle,
  Circle,
  LocateFixed,
  Loader2
} from 'lucide-react';

export { 
  Leaf, 
  Zap, 
  IndianRupee, 
  Clock, 
  MapPin, 
  Navigation, 
  Train, 
  Bus, 
  Footprints, 
  Bike,
  Car,
  ArrowRight,
  Search,
  Menu,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  BarChart2,
  X,
  Trophy,
  Check,
  ExternalLink,
  Map,
  CheckCircle,
  Circle,
  LocateFixed,
  Loader2
};

export const TransportIcon = ({ mode, className = "w-5 h-5" }: { mode: string, className?: string }) => {
  const m = mode.toLowerCase();
  if (m.includes('walk') || m.includes('foot')) return <Footprints className={className} />;
  if (m.includes('metro') || m.includes('train')) return <Train className={className} />;
  if (m.includes('bus')) return <Bus className={className} />;
  if (m.includes('bike') || m.includes('cycle')) return <Bike className={className} />;
  if (m.includes('auto') || m.includes('cab') || m.includes('taxi')) return <Car className={className} />;
  return <Navigation className={className} />;
};
