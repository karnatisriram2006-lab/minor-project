"use client"

import React from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, CloudLightning } from 'lucide-react';
import { WeatherData } from '@/lib/weatherService';
import { motion } from 'framer-motion';

interface WeatherCardProps {
    data: WeatherData | null;
    city: string;
    loading?: boolean;
}

const WeatherIcon = ({ code, isDay, className }: { code: number; isDay: boolean; className?: string }) => {
    if (code === 0) return <Sun className={className} />;
    if (code >= 1 && code <= 3) return <Cloud className={className} />;
    if (code >= 51 && code <= 65) return <CloudRain className={className} />;
    if (code >= 95) return <CloudLightning className={className} />;
    return <Cloud className={className} />;
};

export function WeatherCard({ data, city, loading }: WeatherCardProps) {
    if (loading) {
        return (
            <div className="w-full bg-white rounded-3xl border border-[#EBEBEB] p-6 animate-pulse">
                <div className="h-4 w-24 bg-gray-100 rounded-full mb-4" />
                <div className="h-10 w-32 bg-gray-100 rounded-xl mb-6" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-gray-50 rounded-2xl" />
                    <div className="h-12 bg-gray-50 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-3xl border border-[#EBEBEB] shadow-sm overflow-hidden"
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#484848] uppercase tracking-wider">{city}</h3>
                    <div className="px-2.5 py-1 rounded-full bg-[#00A699]/8 text-[#00A699] text-[10px] font-bold uppercase tracking-widest border border-[#00A699]/20">
                        Live Weather
                    </div>
                </div>

                <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#FF5A5F]/5 flex items-center justify-center text-[#FF5A5F]">
                        <WeatherIcon code={data.conditionCode} isDay={data.isDay} className="h-8 w-8" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-[#484848] tracking-tighter">{data.temperature}°</span>
                            <span className="text-lg font-bold text-[#767676]">C</span>
                        </div>
                        <p className="text-sm font-medium text-[#767676] capitalize">{data.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F7F7F7] p-3 rounded-2xl border border-[#EBEBEB] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#00A699]">
                            <Wind className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#767676] uppercase tracking-wide">Wind</p>
                            <p className="text-xs font-bold text-[#484848]">{data.windSpeed} km/h</p>
                        </div>
                    </div>
                    <div className="bg-[#F7F7F7] p-3 rounded-2xl border border-[#EBEBEB] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#FF5A5F]">
                            <Droplets className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#767676] uppercase tracking-wide">Humidity</p>
                            <p className="text-xs font-bold text-[#484848]">{data.humidity}%</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-[#484848] px-6 py-2.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Open-Meteo Realtime</span>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#00A699] animate-pulse" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">Verified</span>
                </div>
            </div>
        </motion.div>
    );
}
