"use client"

import { useState } from "react"
import { ShieldAlert, Phone, Ambulance, AlertCircle, Search, Building2, MapPin } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export default function EmergencyHelp() {
  const [search, setSearch] = useState("")

  const emergencyData = {
    general: [
      { name: "National Emergency", number: "112", icon: AlertCircle, color: "text-[#FF385C]" },
      { name: "Police Service", number: "100", icon: ShieldAlert, color: "text-[#FF385C]" },
      { name: "Ambulance", number: "102", icon: Ambulance, color: "text-[#00A699]" },
      { name: "Tourist Support", number: "1363", icon: Phone, color: "text-gray-600" },
    ],
    hospitals: [
      { name: "AIIMS New Delhi", phone: "+91-11-26588500", address: "Ansari Nagar, New Delhi" },
      { name: "Apollo Hospital", phone: "+91-11-29871090", address: "Sarita Vihar, Delhi-Mathura Road" },
      { name: "Lilavati Hospital, Mumbai", phone: "+91-22-26751000", address: "Bandra Reclamation, Mumbai" },
    ],
    embassies: [
      { name: "US Embassy", phone: "+91-11-24198000", address: "Shantipath, Chanakyapuri, New Delhi" },
      { name: "British High Commission", phone: "+91-11-24192100", address: "Shantipath, Chanakyapuri, New Delhi" },
      { name: "Australian High Commission", phone: "+91-11-41399900", address: "1/50 G Shantipath, Chanakyapuri" },
    ]
  }

  return (
    <div className="min-h-screen bg-heritage-bone text-heritage-onyx selection:bg-heritage-saffron/10 pt-40 pb-56 relative overflow-hidden font-sans">
      
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" style={{ background: 'radial-gradient(circle at top right, #76767608, transparent 40%)' }} />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" style={{ background: 'radial-gradient(circle at bottom left, #FF5A5F06, transparent 40%)' }} />

      <div className="container mx-auto px-6 max-w-6xl relative z-10 space-y-24">
        
        <div className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-heritage-saffron/5 text-heritage-saffron w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-heritage-saffron/10 shadow-premium animate-pulse-soft"
          >
            <ShieldAlert className="h-12 w-12" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-none text-heritage-onyx">
               Safe <span className="text-heritage-saffron italic">Passage.</span>
            </h1>
            <p className="text-xl md:text-2xl text-heritage-onyx/50 font-medium max-w-3xl mx-auto leading-relaxed">
              Experience the gold standard in traveler safety. We connect you with local networks that exceed India&apos;s highest standards of care.
            </p>
          </motion.div>
        </div>

        <div className="space-y-20">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-3xl mx-auto"
          >
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-heritage-onyx/30" />
            <Input 
              placeholder="Search services, hospitals, or embassies..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-20 h-20 rounded-3xl text-lg font-bold bg-white border-heritage-gold/10 shadow-premium focus:ring-8 focus:ring-heritage-saffron/5 transition-all"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {emergencyData.general.map((contact, i) => {
              const Icon = contact.icon
              const colorClass = contact.name === "Ambulance" ? "text-[#00A699]" : "text-heritage-saffron"
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card variant="premium" className="text-center py-12 px-8 cursor-pointer group hover:-translate-y-2">
                    <div className="w-16 h-16 bg-heritage-bone rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 border border-heritage-gold/10 shadow-soft-inner">
                      <Icon className={cn("h-8 w-8", colorClass)} />
                    </div>
                    <h3 className="font-bold text-[11px] uppercase tracking-[0.3em] text-heritage-onyx/40 mb-2">{contact.name}</h3>
                    <p className="text-4xl font-extrabold tracking-tighter text-heritage-onyx drop-shadow-sm">{contact.number}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card variant="premium" className="overflow-hidden p-0 bg-white">
                <CardHeader className="flex flex-row items-center gap-6 p-10 border-b border-heritage-bone bg-heritage-bone/50">
                  <div className="p-4 bg-teal-50 rounded-2xl text-[#00A699] shadow-soft-inner border border-teal-100/50">
                    <Ambulance className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-3xl font-extrabold tracking-tight">Medical Centers</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <Accordion type="single" collapsible className="w-full">
                    {emergencyData.hospitals.map((hosp, i) => (
                      <AccordionItem key={i} value={`hosp-${i}`} className="border-heritage-bone px-6 hover:bg-heritage-bone/30 rounded-2xl mb-4 transition-colors">
                        <AccordionTrigger className="hover:no-underline font-extrabold text-heritage-onyx hover:text-heritage-saffron py-6 text-lg tracking-tight">
                          {hosp.name}
                        </AccordionTrigger>
                        <AccordionContent className="text-heritage-onyx/60 space-y-6 pb-8">
                          <div className="space-y-3">
                             <p className="flex items-center gap-4 text-base font-bold"><Phone className="h-5 w-5 text-[#00A699]" /> {hosp.phone}</p>
                             <p className="flex items-center gap-4 text-base font-bold"><MapPin className="h-5 w-5 text-[#00A699]" /> {hosp.address}</p>
                          </div>
                          <Button variant="premium" className="w-full h-14 rounded-2xl font-bold bg-[#00A699] hover:bg-[#008C82] text-white shadow-premium">Call Medical Services</Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card variant="premium" className="overflow-hidden p-0 bg-white">
                <CardHeader className="flex flex-row items-center gap-6 p-10 border-b border-heritage-bone bg-heritage-bone/50">
                  <div className="p-4 bg-heritage-saffron/5 rounded-2xl text-heritage-saffron shadow-soft-inner border border-heritage-saffron/10">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-3xl font-extrabold tracking-tight">Embassies</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <Accordion type="single" collapsible className="w-full">
                    {emergencyData.embassies.map((emb, i) => (
                      <AccordionItem key={i} value={`emb-${i}`} className="border-heritage-bone px-6 hover:bg-heritage-bone/30 rounded-2xl mb-4 transition-colors">
                        <AccordionTrigger className="hover:no-underline font-extrabold text-heritage-onyx hover:text-heritage-saffron py-6 text-lg tracking-tight">
                          {emb.name}
                        </AccordionTrigger>
                        <AccordionContent className="text-heritage-onyx/60 space-y-6 pb-8">
                          <div className="space-y-3">
                             <p className="flex items-center gap-4 text-base font-bold"><Phone className="h-5 w-5 text-heritage-saffron" /> {emb.phone}</p>
                             <p className="flex items-center gap-4 text-base font-bold"><MapPin className="h-5 w-5 text-heritage-saffron" /> {emb.address}</p>
                          </div>
                          <Button variant="premium" className="w-full h-14 rounded-2xl font-bold shadow-premium">Contact Embassy</Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}
