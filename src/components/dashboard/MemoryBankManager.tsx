'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MapPin, 
  Utensils, 
  Briefcase, 
  Music, 
  Sparkles, 
  Plus, 
  Star, 
  Archive, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Compass, 
  Smile, 
  Tag,
  AlertCircle
} from 'lucide-react';
import { Patient, CuratedMemory, MemoryCategory, MemorySource } from '@/types/database';
import { initialCuratedMemories } from '@/lib/mock-db';
import { speech } from '@/lib/tts/speech';

interface MemoryBankManagerProps {
  patient: Patient;
  onActivityCreateRequested?: (memory: CuratedMemory) => void;
}

export default function MemoryBankManager({ patient, onActivityCreateRequested }: MemoryBankManagerProps) {
  const [memories, setMemories] = useState<CuratedMemory[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [statusTab, setStatusTab] = useState<'active' | 'important' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<CuratedMemory | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for add / edit
  const [memoryForm, setMemoryForm] = useState({
    title: '',
    detail: '',
    category: 'family' as MemoryCategory,
    source: 'caregiver_entered' as MemorySource,
    is_important: false,
    era_decade: '',
    tags: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load memories for patient
  useEffect(() => {
    fetch(`/api/patients/${patient.id}/memories?include_archived=true`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setMemories(data.data);
        } else {
          // Fallback to initial seed memories
          const patientMemories = initialCuratedMemories.filter(m => m.patient_id === patient.id);
          setMemories(patientMemories.length > 0 ? patientMemories : initialCuratedMemories);
        }
      })
      .catch(() => {
        const patientMemories = initialCuratedMemories.filter(m => m.patient_id === patient.id);
        setMemories(patientMemories.length > 0 ? patientMemories : initialCuratedMemories);
      });
  }, [patient.id]);

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryForm.title || !memoryForm.detail) return;

    if (editingMemory) {
      // Update
      const updates = {
        title: memoryForm.title,
        detail: memoryForm.detail,
        category: memoryForm.category,
        is_important: memoryForm.is_important,
        era_decade: memoryForm.era_decade,
        tags: memoryForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      try {
        await fetch(`/api/patients/${patient.id}/memories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', memoryId: editingMemory.id, updates })
        });
      } catch {}

      setMemories(prev => prev.map(m => m.id === editingMemory.id ? { ...m, ...updates } : m));
      speech.playChime('success');
      showToast('Memory updated successfully.');
      setEditingMemory(null);
    } else {
      // Add new
      const newMemData = {
        patient_id: patient.id,
        title: memoryForm.title,
        detail: memoryForm.detail,
        category: memoryForm.category,
        source: 'caregiver_entered' as const,
        status: 'active' as const,
        is_important: memoryForm.is_important,
        era_decade: memoryForm.era_decade,
        tags: memoryForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      try {
        const res = await fetch(`/api/patients/${patient.id}/memories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMemData)
        });
        const data = await res.json();
        if (data.success && data.data) {
          setMemories(prev => [data.data, ...prev]);
        } else {
          throw new Error('Local fallback');
        }
      } catch {
        const localCreated: CuratedMemory = {
          ...newMemData,
          id: `mem-local-${Date.now()}`,
          created_at: new Date().toISOString()
        };
        setMemories(prev => [localCreated, ...prev]);
      }

      speech.playChime('complete');
      showToast(`Added "${memoryForm.title}" to active memory bank.`);
      setShowAddModal(false);
    }

    setMemoryForm({
      title: '',
      detail: '',
      category: 'family',
      source: 'caregiver_entered',
      is_important: false,
      era_decade: '',
      tags: ''
    });
  };

  const handleToggleImportant = async (id: string) => {
    speech.playChime('click');
    setMemories(prev => prev.map(m => m.id === id ? { ...m, is_important: !m.is_important } : m));
    try {
      await fetch(`/api/patients/${patient.id}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_important', memoryId: id })
      });
    } catch {}
  };

  const handleArchiveToggle = async (mem: CuratedMemory) => {
    speech.playChime('click');
    const newStatus = mem.status === 'archived' ? 'active' : 'archived';
    setMemories(prev => prev.map(m => m.id === mem.id ? { ...m, status: newStatus } : m));

    try {
      await fetch(`/api/patients/${patient.id}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: newStatus === 'archived' ? 'archive' : 'unarchive', 
          memoryId: mem.id 
        })
      });
    } catch {}

    showToast(newStatus === 'archived' 
      ? 'Memory archived. Excluded from all cognitive games.' 
      : 'Memory restored to active cognitive deck.'
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory? It will be permanently removed.')) return;
    speech.playChime('click');
    setMemories(prev => prev.filter(m => m.id !== id));

    try {
      await fetch(`/api/patients/${patient.id}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', memoryId: id })
      });
    } catch {}
    showToast('Memory deleted.');
  };

  const openEditModal = (mem: CuratedMemory) => {
    setEditingMemory(mem);
    setMemoryForm({
      title: mem.title,
      detail: mem.detail,
      category: mem.category,
      source: mem.source,
      is_important: !!mem.is_important,
      era_decade: mem.era_decade || '',
      tags: mem.tags?.join(', ') || ''
    });
  };

  // Filter memories
  const filteredMemories = memories.filter(m => {
    // Status tab
    if (statusTab === 'active' && m.status !== 'active') return false;
    if (statusTab === 'important' && (!m.is_important || m.status !== 'active')) return false;
    if (statusTab === 'archived' && m.status !== 'archived') return false;

    // Category
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDetail = m.detail.toLowerCase().includes(q);
      const matchTags = m.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDetail && !matchTags) return false;
    }

    return true;
  });

  const getSourceBadge = (source: MemorySource) => {
    switch (source) {
      case 'caregiver_entered':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-sage border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
            🛡️ Caregiver Entered
          </span>
        );
      case 'caregiver_approved_ai':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">
            ✨ Caregiver Approved AI
          </span>
        );
      case 'imported':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
            📥 Imported History
          </span>
        );
    }
  };

  const getCategoryIcon = (category: MemoryCategory) => {
    switch (category) {
      case 'occupation': return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case 'food': return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'places': return <MapPin className="w-3.5 h-3.5 text-emerald-500" />;
      case 'music': return <Music className="w-3.5 h-3.5 text-purple-500" />;
      case 'festivals': return <Sparkles className="w-3.5 h-3.5 text-rose-500" />;
      case 'family': return <Heart className="w-3.5 h-3.5 text-pink-500" />;
      case 'hobbies': return <Compass className="w-3.5 h-3.5 text-indigo-500" />;
      default: return <Smile className="w-3.5 h-3.5 text-teal-500" />;
    }
  };

  const activeCount = memories.filter(m => m.status === 'active').length;
  const importantCount = memories.filter(m => m.status === 'active' && m.is_important).length;
  const archivedCount = memories.filter(m => m.status === 'archived').length;

  return (
    <div className="bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Toast */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 text-emerald-900 dark:text-emerald-100 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100 dark:border-bloom-border/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-sage text-[11px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Curated Memory Engine</span>
          </div>
          <h3 className="text-xl font-bold text-navy">
            {patient.name}&apos;s Memory Bank
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified memories used to dynamically construct trivia questions, reminiscence prompts, and cognitive games.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingMemory(null);
            setMemoryForm({
              title: '',
              detail: '',
              category: 'family',
              source: 'caregiver_entered',
              is_important: false,
              era_decade: '',
              tags: ''
            });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory Manually</span>
        </button>
      </div>

      {/* Guaranteed Provenance Alert */}
      <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <ShieldCheck className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-navy dark:text-slate-100">Nivora Strict Provenance Guarantee:</strong>{' '}
          Cognitive games exclusively use memories marked <strong>Active</strong> and approved by you. Archived items remain safely stored for your notes but are never presented to {patient.name}.
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusTab === 'active'
                ? 'bg-white dark:bg-bloom-card text-navy shadow-xs'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('important')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              statusTab === 'important'
                ? 'bg-white dark:bg-bloom-card text-navy shadow-xs'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Important ({importantCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('archived')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              statusTab === 'archived'
                ? 'bg-white dark:bg-bloom-card text-navy shadow-xs'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <Archive className="w-3 h-3 text-slate-400" />
            <span>Archived ({archivedCount})</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="all">All Categories</option>
            <option value="family">Family</option>
            <option value="occupation">Occupation</option>
            <option value="places">Places</option>
            <option value="food">Comfort Foods</option>
            <option value="music">Music & Radio</option>
            <option value="festivals">Festivals & Traditions</option>
            <option value="hobbies">Hobbies & Crafts</option>
          </select>
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="space-y-3">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-dashed border-slate-200 dark:border-bloom-border">
            <Smile className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-navy">No memories found in this view</div>
            <p className="text-xs text-slate-500 mt-1">
              Try changing the filter, or add new memories via Quick Memory Setup above.
            </p>
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                mem.status === 'archived'
                  ? 'bg-slate-50/50 dark:bg-bloom-dark/40 border-slate-200/60 dark:border-bloom-border/40 opacity-75'
                  : mem.is_important
                  ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/60 shadow-xs'
                  : 'bg-white dark:bg-bloom-card border-slate-200 dark:border-bloom-border shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-bloom-dark border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1">
                      {getCategoryIcon(mem.category)}
                      <span className="capitalize">{mem.category}</span>
                    </span>

                    {getSourceBadge(mem.source)}

                    {mem.status === 'archived' && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1">
                        <Archive className="w-2.5 h-2.5" />
                        <span>Archived (Excluded from Games)</span>
                      </span>
                    )}

                    {mem.era_decade && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                        🗓️ {mem.era_decade}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-navy mb-1 flex items-center gap-2">
                    <span>{mem.title}</span>
                    {mem.is_important && (
                      <span className="text-xs text-amber-500" title="Primary Memory">★</span>
                    )}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mem.detail}
                  </p>

                  {mem.tags && mem.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      {mem.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-bloom-dark text-[10px] text-slate-500 font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-1.5 self-end sm:self-start flex-shrink-0 pt-1">
                  {/* Toggle Important / Star */}
                  <button
                    type="button"
                    onClick={() => handleToggleImportant(mem.id)}
                    className={`p-2 rounded-xl border text-xs transition-all ${
                      mem.is_important
                        ? 'bg-amber-50 border-amber-300 text-amber-600'
                        : 'bg-slate-50 dark:bg-bloom-dark border-slate-200 text-slate-400 hover:text-amber-500'
                    }`}
                    title={mem.is_important ? 'Unmark as Important' : 'Mark as Important Primary Memory'}
                  >
                    <Star className={`w-3.5 h-3.5 ${mem.is_important ? 'fill-amber-500' : ''}`} />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditModal(mem)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-bloom-dark hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs transition-all"
                    title="Edit Memory Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Archive / Unarchive */}
                  <button
                    type="button"
                    onClick={() => handleArchiveToggle(mem)}
                    className={`p-2 rounded-xl border text-xs transition-all ${
                      mem.status === 'archived'
                        ? 'bg-emerald-50 border-emerald-300 text-sage'
                        : 'bg-slate-50 dark:bg-bloom-dark hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                    title={mem.status === 'archived' ? 'Restore Memory to Active' : 'Archive Memory (Hide from Games)'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(mem.id)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-bloom-dark hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 text-xs transition-all"
                    title="Delete Memory Permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Memory Modal */}
      {(showAddModal || editingMemory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingMemory(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-bloom-dark text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-xl">✨</span>
              <h3 className="text-xl font-bold text-navy">
                {editingMemory ? 'Edit Memory' : 'Add New Curated Memory'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Personalized memories directly enrich {patient.name}&apos;s reminiscence games.
            </p>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Memory Title *
                </label>
                <input
                  type="text"
                  required
                  value={memoryForm.title}
                  onChange={(e) => setMemoryForm({ ...memoryForm, title: e.target.value })}
                  placeholder="e.g. Sunday Family Masor Tenga Lunch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Memory Detail / Context *
                </label>
                <textarea
                  rows={3}
                  required
                  value={memoryForm.detail}
                  onChange={(e) => setMemoryForm({ ...memoryForm, detail: e.target.value })}
                  placeholder="e.g. Loved preparing fresh Rohu fish curry with garden lemon on Sunday afternoons with grandchildren."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Category
                  </label>
                  <select
                    value={memoryForm.category}
                    onChange={(e) => setMemoryForm({ ...memoryForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sage"
                  >
                    <option value="family">Family</option>
                    <option value="occupation">Occupation</option>
                    <option value="places">Places</option>
                    <option value="food">Food & Recipes</option>
                    <option value="music">Music</option>
                    <option value="festivals">Festivals</option>
                    <option value="hobbies">Hobbies</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Era / Decade (Optional)
                  </label>
                  <input
                    type="text"
                    value={memoryForm.era_decade}
                    onChange={(e) => setMemoryForm({ ...memoryForm, era_decade: e.target.value })}
                    placeholder="e.g. 1970s, 1982"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={memoryForm.tags}
                  onChange={(e) => setMemoryForm({ ...memoryForm, tags: e.target.value })}
                  placeholder="e.g. guwahati, cooking, family, sunday"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isImportantCheck"
                  checked={memoryForm.is_important}
                  onChange={(e) => setMemoryForm({ ...memoryForm, is_important: e.target.checked })}
                  className="w-4 h-4 text-sage rounded border-slate-300 focus:ring-sage"
                />
                <label htmlFor="isImportantCheck" className="text-xs font-bold text-navy cursor-pointer">
                  Mark as Primary / Important Memory (★)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMemory(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sage hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  {editingMemory ? 'Save Changes' : 'Add to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
