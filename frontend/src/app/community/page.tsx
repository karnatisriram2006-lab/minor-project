"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Heart, Bookmark, Calendar, Clock, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import Link from 'next/link'
import axios from 'axios'
import { imageService } from "@/services/imageService"
import Image from "next/image"

interface Trip {
  _id: string;
  title: string;
  destination: string;
  duration: number;
  likesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  author: {
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  placeImage?: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const getAvatarHash = (name: string) => {
    let hash = 0;
    for (let i = 0; i < (name || 'user').length; i++) {
        hash = (name || 'user').charCodeAt(i) + ((hash << 5) - hash);
    }
    const color1 = `hsl(${hash % 360}, 80%, 65%)`;
    const color2 = `hsl(${(hash + 40) % 360}, 80%, 65%)`;
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  };

  useEffect(() => {
    const fetchCommunityTrips = async () => {
      try {
        // Fallback to local API if NEXT_PUBLIC_API_URL isn't set
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${apiUrl}/trips/community`);
        
        // Map to include local state
        const formatted = res.data.trips.map((t: any) => ({
          ...t,
          isLiked: t.likedBy?.includes(user?.uid) || false,
        }));
        // Enrich with images
        const enriched = await Promise.all(formatted.map(async (t: any) => {
          const img = await imageService.getPlaceImage(t.destination || t.title);
          return { ...t, placeImage: img };
        }));

        setTrips(enriched);
      } catch (err) {
        console.error('Failed to load community feed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunityTrips();
  }, [user]);

  const toggleLike = async (tripId: string, idx: number) => {
    if (!user) return alert("Log in to like trips!");
    
    // Optimistic UI update
    const newTrips = [...trips];
    const isLiking = !newTrips[idx].isLiked;
    newTrips[idx].isLiked = isLiking;
    newTrips[idx].likesCount += isLiking ? 1 : -1;
    setTrips(newTrips);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = await user.getIdToken();
      await axios.post(`${apiUrl}/trips/${tripId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch(err) {
      // Revert on error
      newTrips[idx].isLiked = !isLiking;
      newTrips[idx].likesCount += !isLiking ? 1 : -1;
      setTrips([...newTrips]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] pt-24 pb-12 flex items-center justify-center">
         <Loader2 className="h-8 w-8 text-[#FF5A5F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] pt-24 pb-24 font-sans overflow-hidden">
      {/* ── Background Decals ───────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#FF5A5F]/5 to-transparent -z-10 dark:from-[#FF5A5F]/10" />
      <div className="absolute top-40 -right-20 w-96 h-96 bg-[#00A699]/5 rounded-full blur-3xl -z-10 dark:bg-[#00A699]/10" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        
        {/* HERO SECTION */}
        <div className="mb-20 text-center max-w-3xl mx-auto fade-up pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 text-[#FF5A5F] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A5F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5A5F]"></span>
            </span>
            Live Updates
          </div>
          <h1 className="text-[32px] sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-[#484848] dark:text-[#E0E0E0] mb-6">
            Where travelers <br className="hidden sm:block"/>
            <span className="text-[#FF5A5F]">become a tribe.</span>
          </h1>
          <p className="text-lg text-[#767676] dark:text-[#888888] leading-relaxed mx-auto">
            Discover secret spots, copy amazing itineraries, and find your next travel crew. The official YĀTRĀ community feed is curating the best of India, right now.
          </p>
        </div>

        {/* FEED SECTION */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
          <h2 className="text-2xl font-black tracking-tight">Trending Trips</h2>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className="text-[#FF5A5F] border-b-2 border-[#FF5A5F] pb-1 cursor-pointer">Global Feed</span>
            <span className="text-[#767676] hover:text-[#484848] pb-1 cursor-pointer transition-colors">Following</span>
          </div>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5A5F]/5 rounded-full blur-3xl -z-10" />
            <MapPin className="h-16 w-16 text-[#EBEBEB] dark:text-[#2A2A2A] mx-auto mb-6" />
            <h3 className="text-2xl font-black tracking-tight">No public trips yet</h3>
            <p className="text-[#767676] mt-3 max-w-sm mx-auto">Be the pioneer! Generate an itinerary and share it with the world to kickstart the community.</p>
            <Link href="/trip-planner" className="inline-block mt-8">
              <button className="bg-[#484848] dark:bg-white text-white dark:text-[#1A1A1A] px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform">
                Plan a Trip
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger">
            {trips.map((trip, idx) => (
              <motion.div 
                key={trip._id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-[#1A1A1A] rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden group flex flex-col relative transition-all cursor-pointer"
              >
                <Link href={`/trip-planner?load=${trip._id}`} className="flex flex-col flex-1 relative z-10 focus:outline-none">
                  
                  {/* Image Header with Overlay */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                    {trip.placeImage ? (
                      <Image 
                        src={trip.placeImage} 
                        alt={trip.destination} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FF5A5F]/5 flex items-center justify-center">
                        <MapPin className="h-10 w-10 text-[#FF5A5F]/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Floating Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                       <div className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
                         {trip.duration} Days
                       </div>
                    </div>
                  </div>

                  <div className="p-6 pb-2">
                  {/* Top Bar: Minimal Author Details */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm"
                        style={{ background: getAvatarHash(trip.author.name) }}
                      >
                        {trip.author.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#484848] dark:text-[#E0E0E0] truncate max-w-[150px]">{trip.author.name}</span>
                        <span className="text-[11px] font-medium text-[#767676]">
                          {new Date(trip.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Tags */}
                  <h3 className="text-[22px] font-bold text-[#484848] dark:text-white leading-[1.2] mb-3 line-clamp-2">
                    {trip.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7F7F7] dark:bg-[#2A2A2A] text-[#484848] dark:text-[#E0E0E0] text-[11px] font-semibold tracking-wide">
                      <MapPin className="h-3 w-3 text-[#FF5A5F]" />
                      {trip.destination}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7F7F7] dark:bg-[#2A2A2A] text-[#484848] dark:text-[#E0E0E0] text-[11px] font-semibold tracking-wide">
                      <Clock className="h-3 w-3 text-[#00A699]" />
                      {trip.duration} Days
                    </div>
                  </div>

                  <div className="flex-1" />
                </div>
              </Link>

                {/* Bottom Action Footer */}
                <div className="px-6 py-4 flex justify-between items-center relative z-20 border-t border-[#EBEBEB] dark:border-[#2A2A2A] mt-2">
                  <button 
                    onClick={(e) => { e.preventDefault(); toggleLike(trip._id, idx); }}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    <Heart className={`h-5 w-5 ${
                      trip.isLiked 
                        ? 'text-[#FF5A5F] fill-[#FF5A5F]' 
                        : 'text-[#484848] dark:text-[#E0E0E0]'
                    }`} />
                    <span className={`text-[13px] font-semibold ${trip.isLiked ? 'text-[#FF5A5F]' : 'text-[#484848] dark:text-[#E0E0E0]'}`}>
                      {trip.likesCount} <span className="font-normal text-[#767676]">Likes</span>
                    </span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button className="text-[#484848] hover:text-[#00A699] dark:text-[#E0E0E0] transition-colors p-1">
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <Link href={`/trip-planner?load=${trip._id}`} className="text-[#00A699] text-[13px] font-semibold hover:underline">
                      View itinerary
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
