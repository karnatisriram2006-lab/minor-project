"use client"

import React, { useState, useEffect } from 'react';
import { IndianRupee, MapPin, Calendar, Calculator, Sparkles, Navigation, Hotel, Car, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCostEstimator } from '@/hooks/useCostEstimator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CostEstimatorPage() {
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [days, setDays] = useState("3");
    
    const { estimate, loading, error, calculateEstimate } = useCostEstimator();

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        calculateEstimate(source, destination, parseInt(days));
    };

    return (
        <div className="min-h-screen bg-[#F7F7F7] text-[#484848] pt-12 pb-24 font-sans">
            <div className="container mx-auto px-6 max-w-6xl space-y-12">
                
                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-[#FF5A5F]/8 px-4 py-1.5 rounded-full border border-[#FF5A5F]/20 text-[#FF5A5F] text-xs font-bold uppercase tracking-widest"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Cost Predictor
                    </motion.div>
                    <h1 className="text-4xl sm:text-5xl font-black text-[#484848] tracking-tighter">
                        Plan your <span className="text-[#FF5A5F]">budget</span>.
                    </h1>
                    <p className="text-lg text-[#767676] max-w-2xl mx-auto font-medium">
                        Estimate travel costs across India with 100% precision using our open-source distance algorithms.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Input Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 bg-white rounded-3xl border border-[#EBEBEB] shadow-sm p-8 space-y-6 sticky top-28"
                    >
                        <form onSubmit={handleCalculate} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-[#767676] uppercase tracking-widest ml-1">Starting Point</Label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767676] h-4 w-4 group-focus-within:text-[#FF5A5F] transition-colors" />
                                    <Input 
                                        placeholder="e.g. Mumbai"
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        className="pl-12 h-14 rounded-2xl bg-[#F7F7F7] border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-[#767676] uppercase tracking-widest ml-1">Destination</Label>
                                <div className="relative group">
                                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767676] h-4 w-4 group-focus-within:text-[#FF5A5F] transition-colors" />
                                    <Input 
                                        placeholder="e.g. Jaipur"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="pl-12 h-14 rounded-2xl bg-[#F7F7F7] border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-[#767676] uppercase tracking-widest ml-1">Trip Duration (Days)</Label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767676] h-4 w-4 group-focus-within:text-[#FF5A5F] transition-colors" />
                                    <Input 
                                        type="number"
                                        min="1"
                                        value={days}
                                        onChange={(e) => setDays(e.target.value)}
                                        className="pl-12 h-14 rounded-2xl bg-[#F7F7F7] border-[#EBEBEB] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 transition-all font-semibold"
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                variant="premium" 
                                disabled={loading}
                                className="w-full h-14 rounded-2xl text-base font-bold shadow-sm transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Calculating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Calculator className="h-5 w-5" />
                                        <span>Generate Estimate</span>
                                    </div>
                                )}
                            </Button>
                        </form>

                        {error && (
                            <div className="p-4 rounded-2xl bg-[#FF5A5F]/5 border border-[#FF5A5F]/20 text-[#FF5A5F] text-xs font-bold text-center">
                                {error}
                            </div>
                        )}
                    </motion.div>

                    {/* Results Display */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {estimate ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm p-8">
                                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#EBEBEB]">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black text-[#484848] tracking-tight truncate">
                                                    {source} → {destination}
                                                </h3>
                                                <p className="text-sm font-bold text-[#767676]">{estimate.distanceKm} km Total Distance</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767676] mb-1">Total Estimate</p>
                                                <p className="text-4xl font-black text-[#FF5A5F] tracking-tighter">₹{estimate.totalCost.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-[#F7F7F7] p-6 rounded-3xl border border-[#EBEBEB] space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#FF5A5F] shadow-sm">
                                                        <Car className="h-4 w-4" />
                                                    </div>
                                                    <h4 className="font-bold text-[#484848] text-sm">Transport</h4>
                                                </div>
                                                <p className="text-2xl font-black text-[#484848]">₹{estimate.transportCost.toLocaleString()}</p>
                                                <p className="text-[11px] font-medium text-[#767676] leading-relaxed">Estimated for private car travel @ ₹12/km including road tolls.</p>
                                            </div>

                                            <div className="bg-[#F7F7F7] p-6 rounded-3xl border border-[#EBEBEB] space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#00A699] shadow-sm">
                                                        <Hotel className="h-4 w-4" />
                                                    </div>
                                                    <h4 className="font-bold text-[#484848] text-sm">Stay ({days} days)</h4>
                                                </div>
                                                <p className="text-2xl font-black text-[#484848]">₹{estimate.accommodationCost.toLocaleString()}</p>
                                                <p className="text-[11px] font-medium text-[#767676] leading-relaxed">Average mid-range hotel cost @ ₹1800/night across Indian states.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#222222] rounded-3xl p-8 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                                <Wallet className="h-6 w-6 text-[#FF5A5F]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Save this budget?</p>
                                                <p className="text-xs text-white/50 tracking-tight">Sync it to your dashboard and track spending live.</p>
                                            </div>
                                        </div>
                                        <Button className="h-12 px-8 rounded-xl bg-white text-[#222222] font-black hover:bg-[#F7F7F7] transition-all">
                                            Save to Trip
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full min-h-[400px] bg-white rounded-3xl border-2 border-dashed border-[#EBEBEB] flex flex-col items-center justify-center text-center p-12 space-y-4">
                                    <div className="w-20 h-20 bg-[#F7F7F7] rounded-3xl flex items-center justify-center text-[#BBBBBB]">
                                        <IndianRupee className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-[#484848]">Ready to calculate</h3>
                                        <p className="text-sm text-[#767676] max-w-sm">Enter your trip details on the left to see a real-time budget breakdown.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
