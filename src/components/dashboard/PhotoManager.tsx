'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Heart, 
  X, 
  Sparkles, 
  MapPin, 
  Utensils, 
  Music, 
  Briefcase, 
  Calendar, 
  Tag, 
  Home, 
  Play, 
  CheckCircle2, 
  Flame,
  ArrowRight,
  Info,
  Eye
} from 'lucide-react';
import { PatientPhoto, Patient } from '@/types/database';
import ActivityGeneratorModal from './ActivityGeneratorModal';
import { GeneratedActivity } from '@/lib/ai/generator';

interface PhotoManagerProps {
  patientId: string;
  patient?: Patient;
  photos: PatientPhoto[];
  onPhotoAdded: (photo: PatientPhoto) => void;
  onActivityApproved?: (activity: GeneratedActivity) => void;
}

interface CategoryTab {
  id: string;
  label: string;
  icon: string;
}

const DEFAULT_CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'All Memories', icon: '🌟' },
  { id: 'family', label: 'Family & Loved Ones', icon: '💖' },
  { id: 'food', label: 'Food & Recipes', icon: '🍲' },
  { id: 'home', label: 'Home & Childhood', icon: '🏡' },
  { id: 'places', label: 'Places & Hometown', icon: '🏞️' },
  { id: 'music', label: 'Music & Instruments', icon: '🪕' },
  { id: 'work', label: 'Work & Life', icon: '💼' },
  { id: 'festivals', label: 'Festivals & Celebrations', icon: '🪔' },
  { id: 'traditions', label: 'Traditions & Handlooms', icon: '🧵' },
  { id: 'hobbies', label: 'Hobbies & Passions', icon: '📻' },
  { id: 'moments', label: 'Important Moments', icon: '✨' },
];

export default function PhotoManager({ patientId, patient, photos, onPhotoAdded, onActivityApproved }: PhotoManagerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewActivityModal, setPreviewActivityModal] = useState<PatientPhoto | null>(null);
  const [activityGenModalMemory, setActivityGenModalMemory] = useState<{ text: string; category: string } | null>(null);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCatInput, setShowCustomCatInput] = useState(false);

  const [formData, setFormData] = useState({
    file_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    person_name: '',
    relationship: 'Daughter',
    category: 'family',
    custom_category: '',
    era_decade: 'Recent',
    context_memory: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Diverse Indian & Northeast presets
  const samplePresets = [
    {
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
      name: 'Dr. Sunita Sharma',
      relation: 'Cousin & Physician',
      category: 'family',
      era: '2010s',
      memory: 'Family get-together during Guwahati book fair in winter'
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
      name: 'Umananda Ghat Sunset',
      relation: 'Sacred River Walk',
      category: 'places',
      era: '1970s',
      memory: 'Sitting by the Brahmaputra steps listening to evening temple bells and water'
    },
    {
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      name: 'Bihu Pitha & Black Rice Kheer',
      relation: 'Grandmother’s Festive Recipe',
      category: 'food',
      era: '1980s',
      memory: 'Sesame til pitha and Manipuri chak-hao kheer prepared for festive family visits'
    },
    {
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      name: 'Classical Sitar & Harmonium',
      relation: 'Monsoon Evening Music',
      category: 'music',
      era: '1965',
      memory: 'Practicing classical raagas and Bhupen Hazarika tunes with hot ginger tea'
    },
    {
      url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&auto=format&fit=crop&q=80',
      name: 'Traditional Eri Silk Weaving',
      relation: 'Handloom Heritage',
      category: 'traditions',
      era: '1978',
      memory: 'Mother weaving warm wild silk shawls with intricate tribal border patterns'
    },
    {
      url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
      name: 'Ningol Chakouba Celebration',
      relation: 'Family Reunion Festival',
      category: 'festivals',
      era: '1982',
      memory: 'Welcoming married daughters home with traditional blessings and feasts'
    }
  ];

  // Dynamically collect any unique categories present in photos
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach(p => {
      if (p.category) set.add(p.category.toLowerCase());
    });
    const extra: CategoryTab[] = [];
    set.forEach(cat => {
      if (!DEFAULT_CATEGORIES.some(c => c.id === cat)) {
        extra.push({
          id: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: '🏷️'
        });
      }
    });
    return [...DEFAULT_CATEGORIES, ...extra];
  }, [photos]);

  // Filter memories
  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all') return photos;
    return photos.filter(p => {
      const cat = (p.category || 'family').toLowerCase();
      return cat === activeCategory;
    });
  }, [photos, activeCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person_name) return;

    const finalCategory = formData.category === 'custom' && formData.custom_category.trim()
      ? formData.custom_category.trim().toLowerCase()
      : formData.category;

    setIsSubmitting(true);
    try {
      const payload = {
        file_url: formData.file_url,
        person_name: formData.person_name,
        relationship: formData.relationship,
        category: finalCategory,
        era_decade: formData.era_decade,
        context_memory: formData.context_memory
      };

      const res = await fetch(`/api/patients/${patientId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        onPhotoAdded(data.data);
        setShowAddModal(false);
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      // Local fallback add
      const fallback: PatientPhoto = {
        id: `ph-local-${Date.now()}`,
        patient_id: patientId,
        file_url: formData.file_url,
        person_name: formData.person_name,
        relationship: formData.relationship,
        category: finalCategory,
        era_decade: formData.era_decade,
        context_memory: formData.context_memory,
        created_at: new Date().toISOString()
      };
      onPhotoAdded(fallback);
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
      setFormData({
        file_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
        person_name: '',
        relationship: 'Daughter',
        category: 'family',
        custom_category: '',
        era_decade: 'Recent',
        context_memory: ''
      });
      setShowCustomCatInput(false);
    }
  };

  const getCategoryBadge = (cat?: string) => {
    const c = (cat || 'family').toLowerCase();
    switch (c) {
      case 'places':
        return { label: 'Places & Hometown', bg: 'bg-sky-50 dark:bg-sky-950/60 text-ocean border-sky-200' };
      case 'food':
        return { label: 'Food & Recipe', bg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 border-orange-200' };
      case 'music':
        return { label: 'Music & Songs', bg: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 border-violet-200' };
      case 'home':
        return { label: 'Home & Childhood', bg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 border-teal-200' };
      case 'festivals':
        return { label: 'Festivals', bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 border-amber-200' };
      case 'traditions':
        return { label: 'Traditions & Loom', bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 border-rose-200' };
      case 'work':
        return { label: 'Work & Career', bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 border-indigo-200' };
      case 'hobbies':
        return { label: 'Hobby & Passions', bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-sage border-emerald-200' };
      case 'moments':
        return { label: 'Milestone', bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 border-purple-200' };
      case 'family':
      default:
        return { label: 'Family & Loved Ones', bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 border-rose-200' };
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-md">
      {/* Header with Memory Loop Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-bloom-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl sm:text-2xl font-bold text-navy">
              Personal Memory Bank & Archive
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Every memory you add here directly powers personalized <strong>Face–Name Recall</strong>, <strong>Reminiscence Trivia</strong>, and morning conversations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setActivityGenModalMemory({
              text: 'Anita enjoyed gardening with her grandchildren in the backyard.',
              category: 'gardens'
            })}
            className="px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>✨ Generate AI Activity</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Memory</span>
          </button>
        </div>
      </div>

      {/* Memory → Activity Loop Infographic Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-navy dark:text-emerald-300">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>The Memory-to-Activity Loop:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-medium">
          <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-bloom-dark border border-slate-200 text-navy font-bold">1. Caregiver Adds Memory</span>
          <ArrowRight className="w-3.5 h-3.5 text-sage hidden sm:inline" />
          <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-bloom-dark border border-slate-200 text-navy font-bold">2. Auto-Crafts Activity</span>
          <ArrowRight className="w-3.5 h-3.5 text-sage hidden sm:inline" />
          <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-bloom-dark border border-slate-200 text-navy font-bold">3. Patient Smiles & Plays</span>
          <ArrowRight className="w-3.5 h-3.5 text-sage hidden sm:inline" />
          <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-bloom-dark border border-slate-200 text-sage font-bold">4. Engagement Tracked</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {dynamicCategories.map((tab) => {
          const isActive = activeCategory === tab.id;
          const count = tab.id === 'all' 
            ? photos.length 
            : photos.filter(p => (p.category || 'family').toLowerCase() === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 flex-shrink-0 transition-all ${
                isActive
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-bloom-dark hover:bg-slate-200 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Memory Cards */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-bloom-dark border-2 border-dashed border-slate-300 dark:border-bloom-border">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-sage flex items-center justify-center mx-auto mb-3 text-2xl">
            📷
          </div>
          <h3 className="text-lg font-bold text-navy mb-1">
            No memories in this category yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
            Add a personal photo or cultural memory to weave it into today&apos;s games.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-sage text-white font-bold text-xs flex items-center gap-1.5 mx-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => {
            const badge = getCategoryBadge(photo.category);
            return (
              <div
                key={photo.id}
                className="group rounded-2xl overflow-hidden glass-card hover:border-sage transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Photo Display */}
                  <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={photo.file_url}
                      alt={photo.person_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Category & Era Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-bold shadow-sm backdrop-blur-md ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    {photo.era_decade && (
                      <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white">
                        {photo.era_decade}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <h4 className="font-bold text-base text-navy line-clamp-1 mb-0.5">
                      {photo.person_name}
                    </h4>
                    <div className="text-xs font-semibold text-sage mb-2">
                      {photo.relationship}
                    </div>
                    {photo.context_memory && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {photo.context_memory}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Memory Loop & AI Generator Trigger */}
                <div className="p-4 pt-0 space-y-2">
                  <button
                    type="button"
                    onClick={() => setActivityGenModalMemory({
                      text: photo.context_memory || `${photo.person_name} (${photo.relationship})`,
                      category: photo.category || 'family'
                    })}
                    className="w-full py-2 px-3 rounded-xl bg-sage hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate AI Activity</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewActivityModal(photo)}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-bloom-card hover:bg-slate-100 border border-slate-200 dark:border-bloom-border text-slate-700 hover:text-navy text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>Quick Preview Loop</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Preview Modal (Demonstrating the Loop) */}
      {previewActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-bloom-card border-2 border-emerald-200 dark:border-bloom-border p-6 shadow-2xl relative">
            <button
              onClick={() => setPreviewActivityModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-bloom-dark text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-sage text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Generated Cognitive Activity</span>
            </div>

            <h3 className="text-xl font-bold text-navy mb-1">
              {previewActivityModal.person_name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Here is how Nivora automatically turns this memory into a comforting activity:
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 mb-4 space-y-2">
              <div className="text-xs font-bold text-navy">
                🎮 Activity Type: {previewActivityModal.category === 'family' ? 'Face & Name Recall' : 'Story Reminiscence Trivia'}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <strong>Patient Prompt:</strong> &ldquo;{previewActivityModal.category === 'family' 
                  ? `Who is this beloved ${previewActivityModal.relationship} smiling in the photo?` 
                  : `What special memory do you recall about ${previewActivityModal.person_name}?`}&rdquo;
              </div>
              <div className="text-xs text-sage font-medium">
                <strong>Encouraging Fact:</strong> &ldquo;{previewActivityModal.context_memory || 'Familiar family memories strengthen emotional connection and bring joy.'}&rdquo;
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewActivityModal(null)}
                className="px-5 py-2.5 rounded-xl bg-navy text-white text-xs font-bold shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-bloom-dark text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-navy mb-1">+ Add New Memory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add family, hometown places, favorite recipes, or special traditions.
            </p>

            {/* Quick Sample Presets */}
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>One-Tap Cultural Presets:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData({
                        file_url: preset.url,
                        person_name: preset.name,
                        relationship: preset.relation,
                        category: preset.category,
                        custom_category: '',
                        era_decade: preset.era,
                        context_memory: preset.memory
                      });
                      setShowCustomCatInput(false);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-bloom-card hover:bg-slate-100 text-xs text-slate-700 dark:text-slate-200 border border-slate-300 transition-all text-left shadow-xs"
                  >
                    + {preset.name.split(' ')[0]} ({preset.category})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Title or Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.person_name}
                    onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                    placeholder="e.g. Meera, Umananda, or Masor Tenga"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, category: val });
                      setShowCustomCatInput(val === 'custom');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  >
                    <option value="family">Family & Loved Ones</option>
                    <option value="food">Food & Recipes</option>
                    <option value="home">Home & Childhood</option>
                    <option value="places">Places & Hometown</option>
                    <option value="music">Music & Instruments</option>
                    <option value="work">Work & Life</option>
                    <option value="festivals">Festivals & Celebrations</option>
                    <option value="traditions">Traditions & Handlooms</option>
                    <option value="hobbies">Hobbies & Passions</option>
                    <option value="moments">Important Moments</option>
                    <option value="custom">+ Add Custom Category...</option>
                  </select>
                </div>
              </div>

              {/* Custom Category Input if selected */}
              {showCustomCatInput && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 animate-fadeIn">
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    Custom Category Name (e.g. Village Temple, Weaving, Gardening, Folk Dance)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.custom_category}
                    onChange={(e) => setFormData({ ...formData, custom_category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter custom category..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Relationship or Role
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                    placeholder="e.g. Daughter (Maajoni), Sunday Lunch, Headmaster"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Decade or Year
                  </label>
                  <input
                    type="text"
                    value={formData.era_decade}
                    onChange={(e) => setFormData({ ...formData, era_decade: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                    placeholder="e.g. 1970s, 1982, Recent"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-navy">
                    Short Description or Story
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/ai/describe-photo', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            category: formData.category,
                            existing_notes: formData.context_memory,
                            patient_name: formData.person_name || patient?.name || 'Anita'
                          })
                        });
                        const d = await res.json();
                        if (d.success && d.data) {
                          setFormData(prev => ({
                            ...prev,
                            person_name: prev.person_name || d.data.suggestedTitle,
                            context_memory: d.data.suggestedContext
                          }));
                        }
                      } catch {}
                    }}
                    className="text-[11px] text-sage font-bold flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>✨ AI Suggest Description</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formData.context_memory}
                  onChange={(e) => setFormData({ ...formData, context_memory: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  placeholder="Share a detail that sparks warm conversation..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-sage hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Memory...' : 'Save to Memory Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Generator Review Modal */}
      {activityGenModalMemory && patient && (
        <ActivityGeneratorModal
          isOpen={!!activityGenModalMemory}
          onClose={() => setActivityGenModalMemory(null)}
          patient={patient}
          initialMemoryText={activityGenModalMemory.text}
          initialCategory={activityGenModalMemory.category}
          onActivityApproved={(act) => {
            if (onActivityApproved) onActivityApproved(act);
            setActivityGenModalMemory(null);
          }}
        />
      )}
    </div>
  );
}
