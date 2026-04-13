"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { 
  User as UserIcon, 
  MapPin, 
  Compass, 
  Calendar, 
  Heart, 
  Share2, 
  MessageCircle, 
  ShieldCheck,
  Loader2,
  CheckCircle2,
  UserPlus,
  X as XIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface PublicProfile {
  user: {
    name: string;
    avatar: string | null;
    bio: string;
    interests: string[];
    nationality: string;
    language: string;
  };
  stats: {
    trips: number;
    destinations: number;
    likes: number;
  };
}

export default function PublicProfilePage() {
  const { uid } = useParams();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    // Sync auth state to ensure API interceptor has the latest token
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile/${uid}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (uid) fetchProfile();
    return () => unsubscribe();
  }, [uid]);

  const handleConnect = async () => {
    // 1. Guard against connecting with self
    if (currentUser?.uid === uid) {
      alert("You cannot send a connection request to yourself.");
      return;
    }

    // 2. Double check token existence
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token || !currentUser) {
      alert("Please login first to connect with other travelers.");
      window.location.href = `/login?redirect=/profile/${uid}`;
      return;
    }

    setConnecting(true);
    const payload = { recipientId: uid };
    console.log(`[handleConnect] Initiating request to /connections/request`, payload);

    try {
      await api.post(`/connections/request`, payload);
      setRequestSent(true);
      console.log("[handleConnect] Request sent successfully!");
      alert("Connection request sent!");
    } catch (err: any) {
      const status = err?.response?.status;
      const errorMessage = err?.response?.data?.message || "Action failed. Please try again later.";
      
      console.error(`[handleConnect] Connection request failed:`, err.response?.data || err);
      
      if (status === 401) {
        alert("Session expired. Please login again to continue.");
      } else if (status === 400) {
        // Handle specific 400 cases from backend (already connected, etc.)
        alert(errorMessage);
        setRequestSent(true); // Don't let them spam if it already exists
      } else {
        alert(errorMessage);
      }
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#FF5A5F] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1A1A1A] flex items-center justify-center mx-auto border border-[#EBEBEB] dark:border-[#2A2A2A]">
            <XIcon className="h-7 w-7 text-[#FF5A5F]" />
          </div>
          <p className="font-bold">User not found</p>
        </div>
      </div>
    );
  }

  const { user, stats } = profile;
  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] pt-8 pb-24 font-sans">
      <div className="container mx-auto px-6 max-w-2xl space-y-8">
        
        {/* Header Decals */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#FF5A5F]/10 to-transparent -z-10" />

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A1A1A] rounded-[32px] border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center space-y-6 relative overflow-hidden"
        >
          {/* Glassmorphic Badge */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#00A699]/10 border border-[#00A699]/20 text-[#00A699] text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Verified Traveler
          </div>

          <div className="relative inline-block mt-4">
            <Avatar className="h-24 w-24 rounded-full border-4 border-white dark:border-[#1A1A1A] shadow-xl mx-auto ring-4 ring-[#FF5A5F]/5">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback className="text-3xl font-black bg-gradient-to-br from-[#FF5A5F] to-[#FF8A8F] text-white">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#00A699] border-4 border-white dark:border-[#1A1A1A] flex items-center justify-center text-white">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-[#767676] dark:text-[#888]">
              <MapPin className="h-3.5 w-3.5" /> {user.nationality || 'India'}
              <span className="w-1 h-1 rounded-full bg-[#DDDDDD]" />
              <Compass className="h-3.5 w-3.5" /> {user.language || 'English'}
            </div>
          </div>

          <p className="text-sm leading-relaxed max-w-md mx-auto text-[#484848] dark:text-[#CCCCCC]">
            {user.bio || "Crafting stories one destination at a time. Let's explore the Incredible India together!"}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button 
              onClick={handleConnect}
              disabled={connecting || requestSent}
              className={cn(
                "h-12 px-8 rounded-2xl font-bold transition-all active:scale-95 flex items-center gap-2",
                requestSent 
                  ? "bg-[#00A699] text-white hover:bg-[#00A699]" 
                  : "bg-[#FF5A5F] text-white hover:bg-[#FF5A5F]/90 shadow-[0_8px_20px_rgba(255,90,95,0.2)]"
              )}
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : requestSent ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Request Sent</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Connect</span>
                </>
              )}
            </Button>
            <Button variant="outline" className="h-12 w-12 rounded-2xl border-[#EBEBEB] dark:border-[#2A2A2A] p-0">
               <MessageCircle className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="h-12 w-12 rounded-2xl border-[#EBEBEB] dark:border-[#2A2A2A] p-0">
               <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#F7F7F7] dark:border-[#2A2A2A]">
            <div className="space-y-1">
              <p className="text-xl font-black text-[#1a1a1a] dark:text-white uppercase">{stats.trips}</p>
              <p className="text-[10px] font-bold text-[#767676] uppercase tracking-widest leading-none">Trips</p>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black text-[#1a1a1a] dark:text-white uppercase">{stats.destinations}</p>
              <p className="text-[10px] font-bold text-[#767676] uppercase tracking-widest leading-none">Places</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Heart className="h-4 w-4 text-[#FF5A5F] fill-[#FF5A5F]" />
                <p className="text-xl font-black text-[#1a1a1a] dark:text-white uppercase">{stats.likes}</p>
              </div>
              <p className="text-[10px] font-bold text-[#767676] uppercase tracking-widest leading-none">Impact</p>
            </div>
          </div>
        </motion.div>

        {/* Interests Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1A1A1A] rounded-[32px] border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm p-8 space-y-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-[#FF5A5F]" />
            <h2 className="text-base font-bold uppercase tracking-widest text-[#767676]">Passions & Interests</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.interests && user.interests.length > 0 ? user.interests.map((interest) => (
              <span 
                key={interest}
                className="px-4 py-2 rounded-xl bg-[#F7F7F7] dark:bg-[#2A2A2A] border border-[#EBEBEB] dark:border-[#333] text-sm font-semibold text-[#484848] dark:text-[#E0E0E0]"
              >
                {interest}
              </span>
            )) : (
              <p className="text-sm text-[#767676]">No interests listed yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
