"use client"

import { useState } from "react"
import { ShieldAlert, Phone, Ambulance, AlertCircle, Search, Building2, Sparkles, MapPin, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen bg-white text-[#222222] selection:bg-[#FF385C]/10 pt-32 pb-48 relative overflow-hidden font-sans">
      
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-tr from-red-50/20 via-white to-gray-50/10" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10 space-y-16">
        
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FF385C]/5 text-[#FF385C] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#FF385C]/10 shadow-sm"
          >
            <ShieldAlert className="h-8 w-8" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-[#222222]">
               Emergency <span className="text-[#FF385C]">Assistance</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Immediate access to critical safety and support services during your travels.
            </p>
          </motion.div>
        </div>

        <div className="space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search services and locations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-14 h-16 rounded-2xl text-base font-semibold bg-white border-gray-100 shadow-sm focus:ring-4 focus:ring-[#FF385C]/5 transition-all transition-shadow"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyData.general.map((contact, i) => {
              const Icon = contact.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-white rounded-2xl border-gray-100 hover:border-[#FF385C]/20 hover:shadow-xl transition-all duration-300 text-center py-10 px-6 cursor-pointer group shadow-sm">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-gray-100">
                      <Icon className={cn("h-6 w-6", contact.color)} />
                    </div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-1">{contact.name}</h3>
                    <p className="text-3xl font-extrabold tracking-tighter text-[#222222]">{contact.number}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white rounded-[2rem] border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 p-8 border-b border-gray-50">
                  <div className="p-3 bg-teal-50 rounded-xl text-[#00A699]">
                    <Ambulance className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Medical Centers</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {emergencyData.hospitals.map((hosp, i) => (
                      <AccordionItem key={i} value={`hosp-${i}`} className="border-gray-50 px-4 hover:bg-gray-50/50 rounded-xl mb-2">
                        <AccordionTrigger className="hover:no-underline font-bold text-[#222222] hover:text-[#FF385C] py-4 text-base tracking-tight transition-colors">
                          {hosp.name}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-500 space-y-4 pb-6">
                          <div className="space-y-2">
                             <p className="flex items-center gap-3 text-sm font-medium"><Phone className="h-4 w-4 text-[#00A699]" /> {hosp.phone}</p>
                             <p className="flex items-center gap-3 text-sm font-medium"><MapPin className="h-4 w-4 text-[#00A699]" /> {hosp.address}</p>
                          </div>
                          <Button className="w-full h-12 rounded-xl font-bold bg-[#00A699] hover:bg-[#008C82] text-white shadow-sm transition-all active:scale-[0.98]">Call Hospital</Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white rounded-[2rem] border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 p-8 border-b border-gray-50">
                  <div className="p-3 bg-red-50 rounded-xl text-[#FF385C]">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Embassies</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {emergencyData.embassies.map((emb, i) => (
                      <AccordionItem key={i} value={`emb-${i}`} className="border-gray-50 px-4 hover:bg-gray-50/50 rounded-xl mb-2">
                        <AccordionTrigger className="hover:no-underline font-bold text-[#222222] hover:text-[#FF385C] py-4 text-base tracking-tight transition-colors">
                          {emb.name}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-500 space-y-4 pb-6">
                          <div className="space-y-2">
                             <p className="flex items-center gap-3 text-sm font-medium"><Phone className="h-4 w-4 text-[#FF385C]" /> {emb.phone}</p>
                             <p className="flex items-center gap-3 text-sm font-medium"><MapPin className="h-4 w-4 text-[#FF385C]" /> {emb.address}</p>
                          </div>
                          <Button className="w-full h-12 rounded-xl font-bold bg-[#FF385C] hover:bg-[#E31C5F] text-white shadow-sm transition-all active:scale-[0.98]">Contact Embassy</Button>
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
