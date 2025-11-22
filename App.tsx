import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { getRoutes } from './services/geminiService';
import { RouteOption, SearchParams } from './types';
import { RouteCard } from './components/RouteCard';
import { ImpactChart } from './components/ImpactChart';
import { AddressAutocomplete } from './components/AddressAutocomplete';
import { 
  Leaf, 
  Menu, 
  ArrowRight, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  IndianRupee, 
  BarChart2, 
  X 
} from './components/Icons';

// Pre-defined cities for the MVP
const CITIES = ['Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Chennai'];

// Eco Facts for Loading State
const ECO_FACTS = [
  "A full bus takes 50 cars off the road.",
  "Metro travel produces 75% less CO₂ than driving.",
  "Mumbai's local trains carry 7.5 million people daily!",
  "Walking just 1km saves ~150g of CO₂ vs a car.",
  "Electric buses have zero tailpipe emissions."
];

type SortType = 'duration' | 'cost' | 'co2';
type SortOrder = 'asc' | 'desc';

const App: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    origin: '',
    destination: '',
    city: 'Mumbai'
  });
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  // Sorting State
  const [sortBy, setSortBy] = useState<SortType>('duration');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Rotate eco facts while loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setFactIndex(prev => (prev + 1) % ECO_FACTS.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.origin || !searchParams.destination) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setRoutes([]);
    setShowComparison(false);

    try {
      const results = await getRoutes(searchParams.origin, searchParams.destination, searchParams.city);
      setRoutes(results);
    } catch (err) {
      setError("We couldn't calculate the route at this moment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const toggleSort = (type: SortType) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc'); // Default to ascending
      // For CO2, default to Descending (Highest Saved is best)
      if (type === 'co2') setSortOrder('desc'); 
    }
  };

  const sortedRoutes = useMemo(() => {
    if (!routes.length) return [];
    
    return [...routes].sort((a, b) => {
      let valA, valB;

      switch(sortBy) {
        case 'duration':
          valA = a.totalDuration;
          valB = b.totalDuration;
          break;
        case 'cost':
          valA = a.totalCost;
          valB = b.totalCost;
          break;
        case 'co2':
          valA = a.co2Saved;
          valB = b.co2Saved;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });
  }, [routes, sortBy, sortOrder]);

  // Calculate Best In Class Stats
  const bestStats = useMemo(() => {
    if (!routes.length) return null;
    const minDuration = Math.min(...routes.map(r => r.totalDuration));
    const minCost = Math.min(...routes.map(r => r.totalCost));
    const maxSaved = Math.max(...routes.map(r => r.co2Saved));

    return {
      minDuration,
      minCost,
      maxSaved
    };
  }, [routes]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-emerald-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-emerald-900">GreenRoute<span className="text-emerald-500">India.in</span></span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-emerald-600">How it works</a>
            <a href="#" className="hover:text-emerald-600">Impact</a>
            <a href="#" className="hover:text-emerald-600">Business</a>
          </div>
          <button className="md:hidden p-2">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </nav>

      <main className="flex-grow px-4 pb-12">
        
        {/* Hero Section */}
        {!searched && (
          <div className="max-w-3xl mx-auto text-center pt-16 pb-10 animate-in fade-in duration-700">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-6 border border-emerald-200">
              <Zap className="w-3 h-3 mr-1 fill-emerald-700" />
              LIVE in Mumbai, Pune & Bangalore
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              The Fastest + Greenest way to commute.
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Daily office-goers, students, and delivery partners: don't let traffic steal your life. Compare Metro, Bus, Train, and E-bike routes instantly. See exactly how much time, money, and CO₂ you save vs a cab.
            </p>
          </div>
        )}

        {/* Search Card */}
        <div className={`max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 transition-all duration-500 ${searched ? 'mt-8' : ''} z-30 relative`}>
          <form onSubmit={handleSearch} className="space-y-4">
            
            {/* City Select */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">City</label>
              <select 
                value={searchParams.city}
                onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3 font-medium"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Autocomplete Origin */}
            <AddressAutocomplete 
              placeholder="Start Location (e.g., Andheri Station)"
              value={searchParams.origin}
              onChange={(val) => setSearchParams(prev => ({...prev, origin: val}))}
              iconType="origin"
              city={searchParams.city}
            />

            {/* Autocomplete Destination */}
            <AddressAutocomplete 
              placeholder="Destination (e.g., BKC)"
              value={searchParams.destination}
              onChange={(val) => setSearchParams(prev => ({...prev, destination: val}))}
              iconType="destination"
              city={searchParams.city}
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking Routes...
                </span>
              ) : (
                <>
                  Show Routes <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading State Overlay with Facts */}
        {loading && (
           <div className="max-w-2xl mx-auto mt-8 text-center p-6 animate-in fade-in">
             <div className="inline-block p-3 rounded-full bg-emerald-50 mb-4 animate-bounce">
                <Leaf className="w-6 h-6 text-emerald-500" />
             </div>
             <h3 className="text-lg font-semibold text-gray-800 mb-2">Calculating your savings...</h3>
             <p className="text-sm text-gray-500 italic h-6 transition-all duration-500">
               "{ECO_FACTS[factIndex]}"
             </p>
           </div>
        )}

        {/* Results Section */}
        {searched && !loading && (
          <div className="max-w-2xl mx-auto mt-8 animate-in slide-in-from-bottom-4 duration-500">
            
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
                {error}
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 px-1 gap-3">
                  <div className="flex items-center gap-2">
                     <h2 className="text-lg font-bold text-gray-800">Best Commute Options</h2>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                      {/* Compare Button */}
                      <button 
                        onClick={() => setShowComparison(true)}
                        className="bg-white border border-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-50 hover:text-emerald-600 transition-colors flex items-center gap-2 shadow-sm"
                        title="Compare All"
                      >
                          <BarChart2 className="w-4 h-4" />
                          <span className="text-xs font-semibold hidden sm:inline">Compare</span>
                      </button>

                      {/* Sorting Toolbar */}
                      <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                        <span className="text-xs font-medium text-gray-400 uppercase px-2 hidden sm:inline">Sort:</span>
                        
                        <button 
                            onClick={() => toggleSort('duration')}
                            className={`px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${sortBy === 'duration' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Clock className="w-3 h-3" />
                            <span className="hidden sm:inline">Time</span>
                            {sortBy === 'duration' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                        </button>

                        <button 
                            onClick={() => toggleSort('cost')}
                            className={`px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${sortBy === 'cost' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <IndianRupee className="w-3 h-3" />
                            <span className="hidden sm:inline">Price</span>
                            {sortBy === 'cost' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                        </button>

                        <button 
                            onClick={() => toggleSort('co2')}
                            className={`px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${sortBy === 'co2' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Leaf className="w-3 h-3" />
                            <span className="hidden sm:inline">Saved</span>
                            {sortBy === 'co2' && (sortOrder === 'desc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                        </button>
                      </div>
                  </div>
                </div>

                {sortedRoutes.map((route, idx) => (
                  <RouteCard 
                    key={idx} 
                    route={route} 
                    origin={searchParams.origin}
                    destination={searchParams.destination}
                    bestStats={{
                      isFastest: route.totalDuration === bestStats?.minDuration,
                      isCheapest: route.totalCost === bestStats?.minCost,
                      isGreenest: route.co2Saved === bestStats?.maxSaved
                    }}
                  />
                ))}

                <div className="mt-8 p-6 bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <h3 className="text-xl font-bold relative z-10">Small Switch, Big Impact</h3>
                    <p className="text-emerald-100 mt-2 text-sm relative z-10 mb-4">By choosing the Greenest route, you can save approximately {bestStats?.maxSaved.toFixed(2)}kg of CO2 per trip!</p>
                    <button className="relative z-10 bg-white text-emerald-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors">
                        Share Your Savings
                    </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Comparison Modal Overlay */}
        {showComparison && routes.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Detailed Comparison</h3>
                  <p className="text-sm text-gray-500">Visualize the trade-offs between routes</p>
                </div>
                <button 
                  onClick={() => setShowComparison(false)}
                  className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {/* Chart */}
                <div className="mb-8">
                  <ImpactChart routes={routes} />
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Route Name</th>
                        <th className="px-6 py-3">Duration</th>
                        <th className="px-6 py-3">Cost</th>
                        <th className="px-6 py-3">CO₂ Saved</th>
                        <th className="px-6 py-3">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((route, idx) => (
                        <tr key={idx} className="bg-white border-b last:border-0 hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {route.title}
                          </td>
                          <td className="px-6 py-4">
                            {route.totalDuration} min
                          </td>
                          <td className="px-6 py-4">
                            ₹{route.totalCost}
                          </td>
                          <td className="px-6 py-4 text-emerald-600 font-medium">
                            {route.co2Saved.toFixed(2)} kg
                          </td>
                          <td className="px-6 py-4">
                            {route.totalDuration === bestStats?.minDuration && <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Fastest</span>}
                            {route.totalCost === bestStats?.minCost && <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Cheapest</span>}
                            {route.co2Saved === bestStats?.maxSaved && <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Greenest</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} GreenRoute India. Made for cleaner cities.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;