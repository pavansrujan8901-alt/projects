'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Share2, 
  Heart, 
  MapPin, 
  Utensils, 
  Music, 
  Flower2, 
  Compass, 
  ArrowRight 
} from 'lucide-react';
import { Patient, PatientPhoto } from '@/types/database';

interface MemoryConnectionsViewProps {
  patient: Patient;
  photos: PatientPhoto[];
  onOpenActivityGenerator?: (memoryText: string, category: string) => void;
}

export default function MemoryConnectionsView({
  patient,
  photos,
  onOpenActivityGenerator
}: MemoryConnectionsViewProps) {
  const [selectedCluster, setSelectedCluster] = useState<string | null>('family');

  const clusters = [
    {
      id: 'family',
      title: 'Family & Loved Ones',
      icon: '💖',
      tagColor: 'bg-rose-100 text-rose-800',
      count: photos.filter(p => !p.category || p.category === 'family').length || 4,
      connectedTo: 'Face & Name Recall Activities',
      description: `Cherished photographs of grandchildren and children evoking joyful recognition.`
    },
    {
      id: 'gardens',
      title: 'Gardening & Tea Gardens',
      icon: '🌸',
      tagColor: 'bg-emerald-100 text-emerald-800',
      count: photos.filter(p => p.category === 'gardens').length || 3,
      connectedTo: 'Memory Match & Sensory Pairing',
      description: 'Outdoor planting, tea leaves, and nature memories stimulating calm motor coordination.'
    },
    {
      id: 'places',
      title: 'Hometown & Riverfront',
      icon: '📍',
      tagColor: 'bg-sky-100 text-sky-800',
      count: photos.filter(p => p.category === 'places').length || 3,
      connectedTo: 'Daily Orientation & Landmarks',
      description: `${patient.hometown.split(',')[0]} riverfront walks and local landmarks providing spatial orientation.`
    },
    {
      id: 'food_traditions',
      title: 'Festive Recipes & Meals',
      icon: '🍲',
      tagColor: 'bg-amber-100 text-amber-800',
      count: photos.filter(p => p.category === 'food').length || 2,
      connectedTo: 'Reminiscence Trivia & Storytelling',
      description: `Traditional culinary aromas (${patient.favorite_meals || 'Masor Tenga'}) connecting multisensory memory.`
    },
    {
      id: 'music',
      title: 'Timeless Melodies & Radio',
      icon: '📻',
      tagColor: 'bg-purple-100 text-purple-800',
      count: photos.filter(p => p.category === 'music').length || 2,
      connectedTo: 'Melody & Era Association',
      description: 'Beloved folk classics and radio tunes that tap into resilient musical memory pathways.'
    }
  ];

  const activeClusterData = clusters.find(c => c.id === selectedCluster) || clusters[0];

  return (
    <div className="bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-md">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-bloom-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🕸️</span>
            <h2 className="text-xl sm:text-2xl font-bold text-navy">
              Memory Connections Graph
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A visual overview of how memories link into cognitive activities and daily orientation for <strong>{patient.name}</strong>.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-sage border border-emerald-200 dark:border-emerald-800 text-xs font-bold self-start sm:self-auto">
          {clusters.length} Connected Clusters
        </span>
      </div>

      {/* Interactive Cluster Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Cluster Selector List */}
        <div className="md:col-span-1 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Memory Clusters
          </div>
          {clusters.map((cluster) => {
            const isSelected = selectedCluster === cluster.id;
            return (
              <button
                key={cluster.id}
                onClick={() => setSelectedCluster(cluster.id)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-sage shadow-sm'
                    : 'bg-slate-50 dark:bg-bloom-dark border-slate-200 dark:border-bloom-border hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cluster.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-navy">{cluster.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {cluster.count} memory items
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${cluster.tagColor}`}>
                  {cluster.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Connection Details & Activity Trigger */}
        <div className="md:col-span-2 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{activeClusterData.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-navy">
                  {activeClusterData.title}
                </h3>
                <span className="text-xs text-sage font-semibold flex items-center gap-1">
                  <span>Directly Powers:</span>
                  <strong>{activeClusterData.connectedTo}</strong>
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {activeClusterData.description}
            </p>

            {/* Visual Constellation Wireframe Indicator */}
            <div className="p-4 rounded-xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border mb-6">
              <div className="text-xs font-bold text-navy mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Memory Association Strength</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-bloom-dark rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-sage h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(activeClusterData.count * 25, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Emerging</span>
                <span>Rich & Active Association</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-bloom-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Transform this cluster into custom trivia or matching games
            </span>

            {onOpenActivityGenerator && (
              <button
                onClick={() => onOpenActivityGenerator(
                  `Personal memories from ${patient.name}'s ${activeClusterData.title.toLowerCase()} collection.`,
                  activeClusterData.id
                )}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sage hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Generate Activity from Cluster</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
