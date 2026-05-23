import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, User as UserIcon, Bell, ShieldCheck, Heart } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>([]);
  const [preferredPlatforms, setPreferredPlatforms] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  const sportsOptions = ['NBA', 'NFL', 'MLB', 'NHL', 'Soccer', 'UFC'];
  const platformsOptions = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars'];

  useEffect(() => {
    async function loadProfile() {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'profiles', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFavoriteSports(data.favoriteSports || []);
          setFavoriteLeagues(data.favoriteLeagues || []);
          setPreferredPlatforms(data.preferredPlatforms || []);
          setNotifications(data.notificationsEnabled ?? true);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }
    if (isOpen) loadProfile();
  }, [isOpen]);

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'profiles', auth.currentUser.uid);
      await setDoc(docRef, {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        favoriteSports,
        favoriteLeagues,
        preferredPlatforms,
        notificationsEnabled: notifications,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `profiles/${auth.currentUser.uid}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-panel overflow-hidden shadow-2xl border-emerald-500/20"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold font-display uppercase tracking-wider">User Intelligence Profile</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none rounded-full transition-colors" aria-label="Close profile">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Favorite Sports */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-tighter">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  Preferred Disciplines
                </div>
                <div className="flex flex-wrap gap-2">
                  {sportsOptions.map(sport => (
                    <button
                      key={sport}
                      onClick={() => toggleItem(favoriteSports, setFavoriteSports, sport)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        favoriteSports.includes(sport)
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </section>

              {/* Preferred Platforms */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-tighter">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verified Sportsbooks
                </div>
                <div className="flex flex-wrap gap-2">
                  {platformsOptions.map(platform => (
                    <button
                      key={platform}
                      onClick={() => toggleItem(preferredPlatforms, setPreferredPlatforms, platform)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        preferredPlatforms.includes(platform)
                          ? 'bg-white/20 text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </section>

              {/* Notifications */}
              <section className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-tighter">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      Neural Bet Alerts
                    </div>
                    <p className="text-xs text-gray-400">Push high-confidence signals to display.</p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)} role="switch" aria-checked={notifications} aria-label="Toggle neural bet alerts"
                    className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-emerald-500' : 'bg-white/20'}`}
                  >
                    <motion.div
                      animate={{ x: notifications ? 26 : 2 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-white/10">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Synchronize Profile
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
