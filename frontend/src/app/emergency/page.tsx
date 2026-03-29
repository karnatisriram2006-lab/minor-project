"use client"

import { useState } from "react"
import { ShieldAlert, Phone, Ambulance, AlertCircle, Search, Building2, MapPin } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export default function EmergencyHelp() {
  const [search, setSearch] = useState("")

  const emergencyData = {
    general: [
      { name: "National Emergency", number: "112", icon: AlertCircle, color: "text-[#FF5A5F]" },
      { name: "Police Service", number: "100", icon: ShieldAlert, color: "text-[#FF5A5F]" },
      { name: "Ambulance", number: "102", icon: Ambulance, color: "text-[#00A699]" },
      { name: "Tourist Support", number: "1363", icon: Phone, color: "text-[#484848]" },
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

  const filteredHospitals = emergencyData.hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  )
  const filteredEmbassies = emergencyData.embassies.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#484848] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-5xl space-y-8">

        {/* ── Page header ──────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F] bg-[#FF5A5F]/8 px-3 py-1 rounded-full border border-[#FF5A5F]/15">
              <ShieldAlert className="h-3.5 w-3.5" />
              Emergency
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#484848] tracking-tight">
            Emergency <span className="text-[#FF5A5F]">help</span>
          </h1>
          <p className="text-[#767676] text-base max-w-xl leading-relaxed">
            Quick access to emergency numbers, hospitals, and embassies across India.
          </p>
        </div>

        {/* ── Search ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-lg"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676]" />
          <Input
            placeholder="Search hospitals or embassies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-xl bg-white border-[#EBEBEB] shadow-sm focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10 text-sm font-medium text-[#484848] placeholder:text-[#BBBBBB] transition-all"
          />
        </motion.div>

        {/* ── Emergency numbers grid ────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {emergencyData.general.map((contact, i) => {
            const Icon = contact.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110",
                    contact.color === "text-[#FF5A5F]" ? "bg-[#FF5A5F]/8" :
                    contact.color === "text-[#00A699]" ? "bg-[#00A699]/8" : "bg-[#484848]/8"
                  )}>
                    <Icon className={cn("h-5 w-5", contact.color)} />
                  </div>
                  <p className="text-[11px] font-semibold text-[#767676] uppercase tracking-wide mb-1.5">{contact.name}</p>
                  <p className="text-2xl font-bold text-[#484848] tracking-tight">{contact.number}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Hospitals + Embassies ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Hospitals */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-[#EBEBEB]">
                <div className="w-9 h-9 rounded-xl bg-[#00A699]/8 flex items-center justify-center text-[#00A699]">
                  <Ambulance className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#484848]">Hospitals</h2>
                  <p className="text-xs text-[#767676]">Major medical centers</p>
                </div>
              </div>
              <div className="p-4">
                <Accordion type="single" collapsible className="w-full space-y-1">
                  {(filteredHospitals.length > 0 ? filteredHospitals : emergencyData.hospitals).map((hosp, i) => (
                    <AccordionItem
                      key={i}
                      value={`hosp-${i}`}
                      className="border border-[#EBEBEB] rounded-xl overflow-hidden px-0"
                    >
                      <AccordionTrigger className="hover:no-underline text-sm font-semibold text-[#484848] hover:text-[#FF5A5F] transition-colors px-4 py-3.5">
                        {hosp.name}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 space-y-3">
                        <p className="flex items-center gap-2.5 text-sm font-medium text-[#484848]">
                          <Phone className="h-4 w-4 text-[#00A699] shrink-0" />
                          {hosp.phone}
                        </p>
                        <p className="flex items-center gap-2.5 text-sm font-medium text-[#484848]">
                          <MapPin className="h-4 w-4 text-[#00A699] shrink-0" />
                          {hosp.address}
                        </p>
                        <Button
                          className="w-full h-10 rounded-xl bg-[#00A699] hover:bg-[#008C82] text-white text-xs font-semibold transition-all active:scale-[0.97] mt-1"
                        >
                          Call now
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </motion.div>

          {/* Embassies */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-[#EBEBEB]">
                <div className="w-9 h-9 rounded-xl bg-[#FF5A5F]/8 flex items-center justify-center text-[#FF5A5F]">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#484848]">Embassies</h2>
                  <p className="text-xs text-[#767676]">Foreign diplomatic missions</p>
                </div>
              </div>
              <div className="p-4">
                <Accordion type="single" collapsible className="w-full space-y-1">
                  {(filteredEmbassies.length > 0 ? filteredEmbassies : emergencyData.embassies).map((emb, i) => (
                    <AccordionItem
                      key={i}
                      value={`emb-${i}`}
                      className="border border-[#EBEBEB] rounded-xl overflow-hidden px-0"
                    >
                      <AccordionTrigger className="hover:no-underline text-sm font-semibold text-[#484848] hover:text-[#FF5A5F] transition-colors px-4 py-3.5">
                        {emb.name}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 space-y-3">
                        <p className="flex items-center gap-2.5 text-sm font-medium text-[#484848]">
                          <Phone className="h-4 w-4 text-[#FF5A5F] shrink-0" />
                          {emb.phone}
                        </p>
                        <p className="flex items-center gap-2.5 text-sm font-medium text-[#484848]">
                          <MapPin className="h-4 w-4 text-[#FF5A5F] shrink-0" />
                          {emb.address}
                        </p>
                        <Button
                          variant="premium"
                          className="w-full h-10 rounded-xl text-xs font-semibold transition-all active:scale-[0.97] mt-1"
                        >
                          Contact embassy
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
