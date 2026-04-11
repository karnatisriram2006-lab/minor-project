"use client"

import React, { useEffect, useState } from 'react';
import { Utensils, Hotel, Image as ImageIcon, MapPin, Star, ArrowRight } from 'lucide-react';
import { imageService } from '@/services/imageService';
import Image from 'next/image';
import { usePlaces, Place } from '@/hooks/usePlaces';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlacesExplorerProps {
    lat?: number;
    lon?: number;
    city?: string;
}

const CATEGORIES = [
  { id: 'entertainment.culture', label: 'Sights', icon: <ImageIcon className="h-4 w-4" />, color: '#FF5A5F' },
  { id: 'catering.restaurant', label: 'Dining', icon: <Utensils className="h-4 w-4" />, color: '#00A699' },
  { id: 'accommodation.hotel', label: 'Hotels', icon: <Hotel className="h-4 w-4" />, color: '#484848' },
];

export function PlacesExplorer({ lat, lon, city }: PlacesExplorerProps) {
    const { places, loading, getNearbyPlaces } = usePlaces();
    const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);

    const [enrichedPlaces, setEnrichedPlaces] = useState<any[]>([]);
    const [enriching, setEnriching] = useState(false);

    useEffect(() => {
        if (lat && lon) {
            getNearbyPlaces(lat, lon, selectedCat);
        }
    }, [lat, lon, selectedCat, getNearbyPlaces]);

    useEffect(() => {
        const enrich = async () => {
            if (places.length > 0) {
                setEnriching(true);
                const results = await Promise.all(places.map(async (p) => {
                    const img = await imageService.getPlaceImage(p.name, city);
                    return { ...p, placeImage: img };
                }));
                setEnrichedPlaces(results);
                setEnriching(false);
            } else {
                setEnrichedPlaces([]);
            }
        };
        enrich();
    }, [places]);

    if (!lat || !lon) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
                <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-[#484848] tracking-tight truncate" title={`Explore ${city || "Nearby"}`}>
                        Explore {city || "Nearby"}
                    </h3>
                    <p className="text-xs text-[#767676] font-medium uppercase tracking-widest">Powered by OpenStreetMap</p>
                </div>
                <div className="flex gap-2 bg-[#F7F7F7] p-1 rounded-2xl border border-[#EBEBEB] overflow-x-auto sm:overflow-visible">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCat(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                selectedCat === cat.id 
                                    ? "bg-white text-[#484848] shadow-sm ring-1 ring-black/5" 
                                    : "text-[#767676] hover:text-[#484848]"
                            )}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(loading || enriching) ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl border border-[#EBEBEB] p-5 animate-pulse h-40" />
                    ))
                ) : enrichedPlaces.length > 0 ? (
                    enrichedPlaces.slice(0, 6).map((place) => (
                        <motion.div 
                            key={place.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm p-4 hover:border-[#FF5A5F]/30 hover:shadow-md transition-all group overflow-hidden"
                        >
                            <div className="relative h-28 -mx-4 -mt-4 mb-4 overflow-hidden">
                                {place.placeImage ? (
                                    <Image 
                                        src={place.placeImage} 
                                        alt={place.name} 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#F7F7F7] flex items-center justify-center">
                                        <MapPin className="h-6 w-6 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black text-[#00A699] uppercase tracking-widest">
                                    <Star className="h-3 w-3 fill-current" />
                                    Top Rated
                                </div>
                            </div>
                            <h4 className="text-sm font-bold text-[#484848] truncate mb-1">{place.name}</h4>
                            <p className="text-xs text-[#767676] line-clamp-1 mb-4 h-8">{place.address}</p>
                            <div className="flex items-center justify-between border-t border-[#F7F7F7] pt-4">
                                <span className="text-[10px] font-bold text-[#767676] uppercase tracking-tighter">
                                    {(place.distance / 1000).toFixed(1)} km away
                                </span>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#FF5A5F]/10 hover:text-[#FF5A5F]">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-12 bg-[#F7F7F7] rounded-3xl border border-dashed border-[#EBEBEB] text-center space-y-2">
                        <p className="text-sm font-bold text-[#484848]">Nothing found here.</p>
                        <p className="text-xs text-[#767676]">Try searching another category or location.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
