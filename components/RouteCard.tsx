import React, { useState } from 'react';
import { RouteOption } from '../types';
import { Leaf, Clock, IndianRupee, TransportIcon, ArrowRight, Trophy, Zap, Check, ExternalLink, Map, CheckCircle, Circle } from './Icons';

interface RouteCardProps {
  route: RouteOption;
  origin: string;
  destination: string;
  bestStats?: {
    isFastest: boolean;
    isCheapest: boolean;
    isGreenest: boolean;
  };
}

type JourneyState = 'idle' | 'started' | 'completed';

export const RouteCard: React.FC<RouteCardProps> = ({ route, origin, destination, bestStats }) => {
  const [expanded, setExpanded] = useState(false);
  const [journeyState, setJourneyState] = useState<JourneyState>('idle');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Determine if the route is "Zero Tailpipe"
  const isZeroTailpipe = 
    route.title.toLowerCase().includes('electric') ||
    route.title.toLowerCase().includes('ev') ||
    route.tags.some(t => t.toLowerCase().includes('electric')) ||
    route.steps.every(s => {
      const m = s.mode.toLowerCase();
      const i = s.instruction.toLowerCase();
      if (m.includes('bus')) {
        return i.includes('electric') || i.includes('ev');
      }
      return m.includes('walk') || m.includes('cycle') || m.includes('metro') || m.includes('train');
    });

  // Color coding logic
  let borderColor = 'border-gray-200';
  let accentColor = 'bg-gray-100 text-gray-600';
  
  if (bestStats?.isGreenest) {
    borderColor = 'border-emerald-500';
    accentColor = 'bg-emerald-100 text-emerald-700';
  } else if (bestStats?.isFastest) {
    borderColor = 'border-indigo-500';
    accentColor = 'bg-indigo-100 text-indigo-700';
  } else if (bestStats?.isCheapest) {
    borderColor = 'border-orange-400';
    accentColor = 'bg-orange-100 text-orange-700';
  } else if (route.tags.some(t => t.toLowerCase().includes('green'))) {
    borderColor = 'border-emerald-500';
    accentColor = 'bg-emerald-100 text-emerald-700';
  }

  const handleStartJourney = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Construct Google Maps URL
    const isWalkingOnly = route.steps.every(s => s.mode.toLowerCase().includes('walk'));
    const mode = isWalkingOnly ? 'walking' : 'transit';
    
    // We open Maps for general GPS support, but track the specific route internally
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`;
    
    window.open(url, '_blank');
    setJourneyState('started');
    setExpanded(true); // Force expand to show tracker
  };

  const toggleStep = (idx: number) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(completedSteps.filter(i => i !== idx));
    } else {
      setCompletedSteps([...completedSteps, idx]);
    }
  };

  const handleCompleteJourney = (e: React.MouseEvent) => {
    e.stopPropagation();
    setJourneyState('completed');
  };

  const progress = Math.round((completedSteps.length / route.steps.length) * 100);

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-l-8 ${borderColor} mb-6 relative`}>
      
      {/* Header Summary */}
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Top Row: Title & Badges */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
          <div className="overflow-hidden w-full">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
               <h3 className="text-xl font-bold text-gray-900 truncate pr-2">{route.title}</h3>
               
               {/* Dynamic Badges */}
               {bestStats?.isFastest && (
                 <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wide border border-indigo-200">
                   <Clock className="w-3 h-3" /> Fastest
                 </span>
               )}
               {bestStats?.isCheapest && (
                 <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide border border-blue-200">
                   <IndianRupee className="w-3 h-3" /> Cheapest
                 </span>
               )}
               {bestStats?.isGreenest && (
                 <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-200">
                   <Leaf className="w-3 h-3" /> Greenest
                 </span>
               )}

               {/* Zero Tailpipe Badge */}
               {isZeroTailpipe && (
                 <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 text-[10px] font-extrabold uppercase tracking-wide border border-teal-200 shadow-sm animate-pulse">
                   <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Zero Tailpipe
                 </span>
               )}
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-1">
              {route.steps.map((step, i) => (
                <React.Fragment key={i}>
                  <span className="flex items-center whitespace-nowrap">
                    <TransportIcon mode={step.mode} className="w-3 h-3 mr-1" />
                    {step.mode}
                  </span>
                  {i < route.steps.length - 1 && <span className="text-gray-300 mx-1">•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Primary Tag Badge */}
          {!bestStats?.isFastest && !bestStats?.isCheapest && !bestStats?.isGreenest && (
             <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${accentColor}`}>
              {route.tags[0] || 'Standard'}
             </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
           {/* CO2 Savings */}
           <div className={`rounded-xl p-3 text-center border ${bestStats?.isGreenest ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
             <div className="text-[10px] sm:text-xs text-emerald-600 font-semibold uppercase mb-1 flex items-center justify-center gap-1">
               {bestStats?.isGreenest && <Trophy className="w-3 h-3 text-emerald-500" />} Saved
             </div>
             <div className="text-emerald-800 font-bold text-lg flex items-center justify-center gap-1">
               <Leaf className="w-4 h-4" />
               {route.co2Saved.toFixed(1)}<span className="text-sm">kg</span>
             </div>
             <div className="text-[9px] sm:text-[10px] text-emerald-500">
                {isZeroTailpipe ? 'vs Car (100% Clean)' : 'vs Car (75% Clean)'}
             </div>
           </div>

           {/* Money Savings */}
           <div className={`rounded-xl p-3 text-center border ${bestStats?.isCheapest ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-gray-50 border-gray-100'}`}>
             <div className="text-[10px] sm:text-xs text-blue-600 font-semibold uppercase mb-1 flex items-center justify-center gap-1">
                {bestStats?.isCheapest && <Trophy className="w-3 h-3 text-blue-500" />} Saved
             </div>
             <div className="text-blue-800 font-bold text-lg flex items-center justify-center gap-1">
               <IndianRupee className="w-4 h-4" />
               {Math.round(route.moneySaved)}
             </div>
             <div className="text-[9px] sm:text-[10px] text-blue-500">₹ vs Car</div>
           </div>

           {/* Time Savings */}
           <div className={`rounded-xl p-3 text-center border ${bestStats?.isFastest ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100' : (route.timeSaved >= 0 ? 'bg-gray-50 border-gray-100' : 'bg-orange-50 border-orange-100')}`}>
             <div className={`text-[10px] sm:text-xs font-semibold uppercase mb-1 flex items-center justify-center gap-1 ${route.timeSaved >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                {bestStats?.isFastest && <Trophy className="w-3 h-3 text-indigo-500" />}
                {route.timeSaved >= 0 ? 'Saved' : 'Lost'}
             </div>
             <div className={`font-bold text-lg flex items-center justify-center gap-1 ${route.timeSaved >= 0 ? 'text-indigo-800' : 'text-orange-800'}`}>
               <Clock className="w-4 h-4" />
               {Math.abs(Math.round(route.timeSaved))}<span className="text-sm">m</span>
             </div>
             <div className={`text-[9px] sm:text-[10px] ${route.timeSaved >= 0 ? 'text-indigo-500' : 'text-orange-500'}`}>
                {route.timeSaved >= 0 ? 'Faster vs Car' : 'Slower vs Car'}
             </div>
           </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-400 pt-2 border-t border-gray-50">
           <div>
             Total Trip: <span className="font-medium text-gray-800">{route.totalDuration} min</span>
           </div>
           <div className="flex items-center gap-1 text-emerald-600 font-medium text-xs group">
             {journeyState === 'started' ? 'View Tracker' : 'View Steps'} <ArrowRight className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
           </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="bg-gray-50 p-5 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          
          {journeyState === 'started' ? (
             // --- LIVE TRACKER MODE ---
             <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live Journey Tracker
                    </h4>
                    <button onClick={handleStartJourney} className="text-[10px] flex items-center gap-1 text-gray-500 hover:text-emerald-600 border border-gray-200 rounded-full px-2 py-1 bg-white">
                         <Map className="w-3 h-3" /> Open Maps
                    </button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 mb-4">
                    <strong>Note:</strong> Google Maps might show a different route. Follow the steps below to ensure you save the Carbon & Money calculated!
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Interactive Steps */}
                <div className="space-y-3">
                    {route.steps.map((step, idx) => {
                        const isCompleted = completedSteps.includes(idx);
                        return (
                            <div 
                                key={idx} 
                                onClick={() => toggleStep(idx)}
                                className={`relative flex items-start p-3 rounded-xl border transition-all cursor-pointer ${isCompleted ? 'bg-emerald-50 border-emerald-200 opacity-60' : 'bg-white border-gray-200 shadow-sm hover:border-emerald-300'}`}
                            >
                                <div className={`mt-0.5 mr-3 flex-shrink-0`}>
                                    {isCompleted ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-bold leading-snug ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                        {step.instruction}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 font-medium flex items-center gap-1">
                                        <TransportIcon mode={step.mode} className="w-3 h-3" /> {step.duration} min
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200">
                    <button 
                      onClick={handleCompleteJourney}
                      disabled={progress < 100}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${progress === 100 ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                       {progress === 100 ? 'Finish Trip & Claim Savings' : 'Complete All Steps to Finish'}
                    </button>
                </div>
             </div>
          ) : journeyState === 'completed' ? (
             // --- COMPLETED STATE ---
             <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center animate-in zoom-in duration-300 shadow-sm">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-xl mb-2">
                      <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-md"><Check className="w-5 h-5" /></div>
                      Trip Completed!
                  </div>
                  <p className="text-emerald-700 text-sm mb-4">
                      You are a hero! By following this route, you saved:
                  </p>
                  <div className="flex justify-center gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                          <div className="text-xs text-emerald-500 font-bold uppercase">CO₂ Saved</div>
                          <div className="text-lg font-bold text-emerald-800">{route.co2Saved.toFixed(1)} kg</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                          <div className="text-xs text-emerald-500 font-bold uppercase">Money Saved</div>
                          <div className="text-lg font-bold text-emerald-800">₹{Math.round(route.moneySaved)}</div>
                      </div>
                  </div>
             </div>
          ) : (
             // --- STANDARD VIEW ---
             <>
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Step by Step</h4>
                <div className="space-y-4 relative ml-2">
                    {/* Vertical Line */}
                    <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-200" />

                    {route.steps.map((step, idx) => {
                    const renderInstruction = (text: string) => {
                        const match = text.match(/^(.*?)\s(towards\s.*)$/i);
                        if (match) {
                        return (
                            <>
                            {match[1]} <span className="text-gray-500 font-normal">{match[2]}</span>
                            </>
                        );
                        }
                        return text;
                    };

                    return (
                        <div key={idx} className="relative flex items-start z-10">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mr-3 shadow-sm mt-0.5">
                            <TransportIcon mode={step.mode} className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 pt-1">
                            <p className="text-sm font-bold text-gray-800 leading-snug">
                            {renderInstruction(step.instruction)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium">{step.duration} min</p>
                        </div>
                        </div>
                    );
                    })}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button 
                        onClick={handleStartJourney}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95 duration-150 flex items-center justify-center gap-2"
                    >
                        Start Journey on Google Maps <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
             </>
          )}
        </div>
      )}
    </div>
  );
};
