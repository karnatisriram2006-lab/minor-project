"use client";

import React, { useState, useEffect, useRef } from "react";
// Trace: Force re-compile to clear ghost corruption v1.0.2
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  User,
  Clock,
  Loader2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { imageService } from "@/services/imageService";
import Image from "next/image";

interface SearchResult {
  trips: any[];
  users: any[];
}

const INDIA_POPULAR = [
  {
    name: "Jaipur",
    type: "destination",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80",
  },
  {
    name: "Goa",
    type: "destination",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80",
  },
  {
    name: "Udaipur",
    type: "destination",
    image:
      "https://images.unsplash.com/photo-1594132474920-f59730c44f1c?w=400&q=80",
  },
];

export default function SearchTypeahead({
  isMobile = false,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    trips: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(isMobile); // Always open if mobile overlay
  const [activeTab, setActiveTab] = useState<"all" | "trips" | "travelers">(
    "all",
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isMobile) {
      setIsOpen(true);
    }
  }, [isMobile]);

  // Handle ESC key on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobile && onClose) {
        onClose();
      }
    };
    if (isMobile) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isMobile, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ trips: [], users: [] });
      setLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const [tripsRes, usersRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/trips/search?q=${query}`,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/profile/search?q=${query}`,
          ),
        ]);

        const tripsData = await tripsRes.json();
        const usersData = await usersRes.json();

        // Enrich trips with images
        const enrichedTrips = await Promise.all(
          (tripsData.trips || []).map(async (trip: any) => {
            const img = await imageService.getPlaceImage(
              trip.destination || trip.title,
              trip.destination,
            );
            return { ...trip, placeImage: img };
          }),
        );

        setResults({
          trips: enrichedTrips,
          users: usersData.users || [],
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const hasResults =
    results.trips.length > 0 || results.users.length > 0 || query.trim() === "";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full",
        isMobile &&
          "h-screen bg-white dark:bg-[#1A1A1A] flex flex-col px-4 pt-4",
      )}
    >
      {/* Mobile Header with Close Button */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4 gap-3">
          <button
            onClick={() => onClose?.()}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F7F7F7] dark:bg-[#2A2A2A] text-[#484848] dark:text-[#E0E0E0] hover:bg-[#EBEBEB] dark:hover:bg-[#333] transition-colors active:scale-95 shrink-0"
            aria-label="Go back"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-[#484848] dark:text-[#E0E0E0]">
            Search
          </span>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      )}

      {/* Search Input Pill */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 h-11 sm:h-12 bg-[#F7F7F7] dark:bg-[#2A2A2A] rounded-full border border-transparent transition-all duration-200",
          isOpen
            ? "bg-white dark:bg-[#222] border-[#FF5A5F] shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            : "hover:bg-[#EBEBEB] dark:hover:bg-[#333]",
          isMobile && "mb-4 h-12 bg-[#F7F7F7] dark:bg-[#2A2A2A]",
        )}
      >
        <Search
          className={cn(
            "h-4 w-4",
            isOpen ? "text-[#FF5A5F]" : "text-[#767676]",
          )}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={
            isMobile
              ? "Search destinations..."
              : "Search trips, destinations, or travelers..."
          }
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#484848] dark:text-[#E0E0E0] placeholder:text-[#767676]"
          autoFocus={isMobile}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults({ trips: [], users: [] });
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-3 w-3 text-[#767676]" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={
                isMobile ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }
              }
              animate={{
                opacity: 1,
                y: isMobile ? undefined : 0,
                scale: isMobile ? undefined : 1,
              }}
              exit={
                isMobile ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }
              }
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className={cn(
                "z-[200] bg-white dark:bg-[#1A1A1A] overflow-hidden",
                isMobile
                  ? "flex-1 rounded-t-2xl mt-2 flex flex-col"
                  : "absolute top-14 left-0 right-0 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-[#EBEBEB] dark:border-[#2A2A2A]",
              )}
            >
              {/* Tabs / Filters */}
              <div className="flex border-b border-[#EBEBEB] dark:border-[#2A2A2A] px-4 pt-4 pb-2 gap-4">
                {["all", "trips", "travelers"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "text-[12px] font-bold uppercase tracking-wider pb-2 px-1 transition-colors relative",
                      activeTab === tab
                        ? "text-[#FF5A5F]"
                        : "text-[#767676] hover:text-[#484848]",
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="search-tab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF5A5F] rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div
                className={cn(
                  "overflow-y-auto p-4 custom-scrollbar",
                  isMobile ? "flex-1" : "max-h-[420px]",
                )}
              >
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-8 w-8 text-[#FF5A5F] animate-spin" />
                    <p className="text-xs font-semibold text-[#767676] uppercase tracking-widest">
                      Searching the matrix...
                    </p>
                  </div>
                )}

                {!loading && query.trim() === "" && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-black text-[#767676] uppercase tracking-widest mb-2">
                      Popular Destinations
                    </p>
                    {INDIA_POPULAR.map((item) => (
                      <div
                        key={item.name}
                        onClick={() => setQuery(item.name)}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F7F7F7] dark:hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] dark:bg-[#2A2A2A] flex items-center justify-center text-[#FF5A5F] overflow-hidden relative shrink-0 border border-[#EBEBEB] dark:border-[#333]">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <MapPin className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#484848] dark:text-[#E0E0E0]">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-medium text-[#767676]">
                            Explore the best of {item.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading &&
                  query.trim() !== "" &&
                  results.trips.length === 0 &&
                  results.users.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-sm font-bold text-[#484848] dark:text-[#E0E0E0]">
                        No matches found
                      </p>
                      <p className="text-xs text-[#767676] mt-1">
                        Try searching for cities like Jaipur or Goa
                      </p>
                    </div>
                  )}

                {/* Trip Results */}
                {!loading &&
                  (activeTab === "all" || activeTab === "trips") &&
                  results.trips.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[11px] font-black text-[#767676] uppercase tracking-widest mb-3 flex justify-between items-center">
                        <span>Public Itineraries</span>
                        <span className="text-[10px] bg-[#FF5A5F]/10 text-[#FF5A5F] px-2 py-0.5 rounded-full">
                          {results.trips.length}
                        </span>
                      </p>
                      <div className="space-y-2">
                        {results.trips.map((trip) => (
                          <Link
                            key={trip._id}
                            href={`/trip-planner?load=${trip._id}`}
                            onClick={() => {
                              setIsOpen(false);
                              if (isMobile) onClose?.();
                            }}
                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F7F7F7] dark:hover:bg-[#2A2A2A] group transition-colors"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-[#2A2A2A] flex flex-col items-center justify-center text-[#FF5A5F] shrink-0 border border-[#EBEBEB] dark:border-[#333] overflow-hidden relative">
                              {trip.placeImage ? (
                                <Image
                                  src={trip.placeImage}
                                  alt={trip.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                              ) : (
                                <>
                                  <Calendar className="h-5 w-5" />
                                  <span className="text-[9px] font-bold mt-0.5">
                                    {trip.duration}d
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[15px] font-bold text-[#484848] dark:text-[#E0E0E0] truncate group-hover:text-[#FF5A5F] transition-colors">
                                {trip.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-medium text-[#767676] flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />{" "}
                                  {trip.destination}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-[11px] font-medium text-[#767676]">
                                  by {trip.author?.name || "Traveler"}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                {/* User Results */}
                {!loading &&
                  (activeTab === "all" || activeTab === "travelers") &&
                  results.users.length > 0 && (
                    <div>
                      <p className="text-[11px] font-black text-[#767676] uppercase tracking-widest mb-3">
                        Community Members
                      </p>
                      <div className="space-y-2">
                        {results.users.map((member) => (
                          <Link
                            key={member.firebaseUid}
                            href={`/profile?id=${member.firebaseUid}`}
                            onClick={() => {
                              setIsOpen(false);
                              if (isMobile) onClose?.();
                            }}
                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F7F7F7] dark:hover:bg-[#2A2A2A] group transition-colors"
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm uppercase shadow-sm shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${getRandomColor(member.name)}, #FF5A5F)`,
                              }}
                            >
                              {member.name[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-[#484848] dark:text-[#E0E0E0] truncate group-hover:text-[#FF5A5F] transition-colors">
                                {member.name}
                              </p>
                              <p className="text-[11px] font-medium text-[#767676] truncate">
                                {member.bio || "Avid traveler exploring India"}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>

            {/* Footer - outside scrollable area on mobile */}
            {isMobile && (
              <div className="bg-[#F7F7F7] dark:bg-[#222] p-4 text-center rounded-b-2xl">
                <p className="text-[10px] font-bold text-[#767676] uppercase tracking-widest">
                  Press ESC or tap the X to close
                </p>
              </div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Desktop Footer */}
      {!isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[calc(100%+0px)] left-0 right-0 z-[200] bg-[#F7F7F7] dark:bg-[#222] p-4 text-center rounded-b-3xl border border-t-0 border-[#EBEBEB] dark:border-[#2A2A2A]"
        >
          <p className="text-[10px] font-bold text-[#767676] uppercase tracking-widest">
            Tip: Search for "Jaipur" or "Kochi"
          </p>
        </motion.div>
      )}
    </div>
  );
}

function getRandomColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
