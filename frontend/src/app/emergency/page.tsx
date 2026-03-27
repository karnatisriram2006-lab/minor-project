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
      { name: "National Emergency", number: "112", icon: AlertCircle, color: "text-rose-500" },
      { name: "Police Matrix", number: "100", icon: ShieldAlert, color: "text-blue-500" },
      { name: "Ambulance Node", number: "102", icon: Ambulance, color: "text-emerald-500" },
      { name: "Tourist Support", number: "1363", icon: Phone, color: "text-primary" },
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pt-32 pb-48 relative overflow-hidden font-sans">
      
      {/* Aurora Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-aurora" />
          <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-aurora [animation-delay:-5s]" />
      </div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10 space-y-20">
        
        <div className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 text-primary w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-3xl shadow-primary/20 border border-primary/20 animate-pulse"
          >
            <ShieldAlert className="h-12 w-12" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none italic">
               Emergency <br /><span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Assistance.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Rapid access to high-priority safety nodes across the sub-continent. Keep this matrix synchronized during traversal.
            </p>
          </motion.div>
        </div>

        <div className="space-y-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
            <Input 
              placeholder="Search Security Nodes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-16 h-20 rounded-3xl text-xl font-black bg-card/50 border-border focus:ring-4 focus:ring-primary/10 transition-all shadow-4xl glass-3d placeholder:text-muted-foreground/30 uppercase tracking-widest"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {emergencyData.general.map((contact, i) => {
              const Icon = contact.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-card rounded-[3rem] border-border hover:border-primary/20 hover:shadow-4xl transition-all duration-500 text-center py-12 px-8 cursor-pointer group glass-3d">
                    <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-xl border border-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-2 group-hover:text-primary transition-colors">{contact.name}</h3>
                    <p className="text-4xl font-black tracking-tighter text-foreground group-hover:scale-110 transition-all duration-500">{contact.number}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card rounded-[4rem] border-border shadow-4xl overflow-hidden glass-3d">
                <CardHeader className="flex flex-row items-center gap-6 p-12 border-b border-border">
                  <div className="p-4 bg-accent/10 rounded-[1.5rem] text-accent border border-accent/20">
                    <Ambulance className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tighter italic">Alpha Medical Nodes</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <Accordion type="single" collapsible className="w-full">
                    {emergencyData.hospitals.map((hosp, i) => (
                      <AccordionItem key={i} value={`hosp-${i}`} className="border-border px-4 transition-all hover:bg-muted/30 rounded-2xl mb-4">
                        <AccordionTrigger className="hover:no-underline font-black text-foreground hover:text-primary py-6 text-lg tracking-tight cursor-pointer">
                          {hosp.name}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground space-y-6 pb-10">
                          <div className="space-y-4">
                             <p className="flex items-center gap-4 font-black text-[10px] uppercase tracking-[0.2em]"><Phone className="h-4 w-4 text-accent" /> {hosp.phone}</p>
                             <p className="flex items-center gap-4 font-black text-[10px] uppercase tracking-[0.2em]"><MapPin className="h-4 w-4 text-accent" /> {hosp.address}</p>
                          </div>
                          <Button className="w-full h-14 rounded-2xl font-black bg-accent hover:bg-teal-600 text-white shadow-2xl shadow-accent/20 transition-all hover:scale-[1.03]">Initialize Contact</Button>
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
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-card rounded-[4rem] border-border shadow-4xl overflow-hidden glass-3d">
                <CardHeader className="flex flex-row items-center gap-6 p-12 border-b border-border">
                  <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary border border-primary/20">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tighter italic">Diplomatic Outposts</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <Accordion type="single" collapsible className="w-full">
                    {emergencyData.embassies.map((emb, i) => (
                      <AccordionItem key={i} value={`emb-${i}`} className="border-border px-4 transition-all hover:bg-muted/30 rounded-2xl mb-4">
                        <AccordionTrigger className="hover:no-underline font-black text-foreground hover:text-primary py-6 text-lg tracking-tight cursor-pointer">
                          {emb.name}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground space-y-6 pb-10">
                          <div className="space-y-4">
                             <p className="flex items-center gap-4 font-black text-[10px] uppercase tracking-[0.2em]"><Phone className="h-4 w-4 text-primary" /> {emb.phone}</p>
                             <p className="flex items-center gap-4 font-black text-[10px] uppercase tracking-[0.2em]"><MapPin className="h-4 w-4 text-primary" /> {emb.address}</p>
                          </div>
                          <Button className="w-full h-14 rounded-2xl font-black bg-primary hover:bg-orange-600 text-white shadow-2xl shadow-primary/20 transition-all hover:scale-[1.03]">Request Traversal Aid</Button>
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
