export interface Place {
  id: string
  name: string
  city: string
  category: "monument" | "restaurant" | "hotel" | "beach" | "temple" | "market"
  rating: number
  priceRange: string
  description: string
  lat: number
  lng: number
  imageUrl: string
}

export const places: Place[] = [
  // ── Goa (10) ──
  { id: "goa-1", name: "Baga Beach", city: "Goa", category: "beach", rating: 4.5, priceRange: "Free", description: "Lively beach with water sports, shacks, and vibrant nightlife.", lat: 15.5527, lng: 73.7553, imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80" },
  { id: "goa-2", name: "Fort Aguada", city: "Goa", category: "monument", rating: 4.3, priceRange: "Free", description: "17th-century Portuguese fort with panoramic Arabian Sea views.", lat: 15.4915, lng: 73.7774, imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80" },
  { id: "goa-3", name: "Basilica of Bom Jesus", city: "Goa", category: "temple", rating: 4.6, priceRange: "Free", description: "UNESCO World Heritage church housing St. Francis Xavier's relics.", lat: 15.5010, lng: 73.9130, imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80" },
  { id: "goa-4", name: "Thalassa Vagator", city: "Goa", category: "restaurant", rating: 4.7, priceRange: "$$$", description: "Stunning cliffside Greek restaurant with sunset views.", lat: 15.5833, lng: 73.7417, imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop&q=80" },
  { id: "goa-5", name: "Palolem Beach", city: "Goa", category: "beach", rating: 4.6, priceRange: "Free", description: "Crescent-shaped beach with calm waters and dolphin spotting.", lat: 15.0100, lng: 74.0233, imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80" },
  { id: "goa-6", name: "Zostel Goa", city: "Goa", category: "hotel", rating: 4.4, priceRange: "$", description: "Popular backpacker hostel with social vibe and pool.", lat: 15.5200, lng: 73.7600, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80" },
  { id: "goa-7", name: "Anjuna Flea Market", city: "Goa", category: "market", rating: 4.2, priceRange: "$", description: "Iconic Wednesday market with handicrafts, jewelry, and live music.", lat: 15.5730, lng: 73.7400, imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80" },
  { id: "goa-8", name: "Dudhsagar Falls", city: "Goa", category: "monument", rating: 4.8, priceRange: "$$", description: "Majestic four-tiered waterfall on the Mandovi River.", lat: 15.3144, lng: 74.3100, imageUrl: "https://images.unsplash.com/photo-1432405972618-c6b0cfba8d03?w=800&auto=format&fit=crop&q=80" },
  { id: "goa-9", name: "Martin's Corner", city: "Goa", category: "restaurant", rating: 4.5, priceRange: "$$", description: "Legendary Goan restaurant serving authentic fish curry and bebinca.", lat: 15.3173, lng: 73.9750, imageUrl: "https://images.unsplash.com/photo-1517244683847-745431cd6028?w=800&auto=format&fit=crop&q=80" },
  { id: "goa-10", name: "Calangute Beach", city: "Goa", category: "beach", rating: 4.3, priceRange: "Free", description: "Queen of beaches — Goa's most popular stretch of sand.", lat: 15.5440, lng: 73.7550, imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80" },

  // ── Jaipur (10) ──
  { id: "jai-1", name: "Amber Fort", city: "Jaipur", category: "monument", rating: 4.8, priceRange: "$$", description: "Magnificent hilltop fort with mirror palace and elephant rides.", lat: 26.9855, lng: 75.8513, imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80" },
  { id: "jai-2", name: "Hawa Mahal", city: "Jaipur", category: "monument", rating: 4.6, priceRange: "$", description: "Iconic Palace of Winds with 953 intricate jharokha windows.", lat: 26.9239, lng: 75.8267, imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80" },
  { id: "jai-3", name: "Laxmi Misthan Bhandar", city: "Jaipur", category: "restaurant", rating: 4.8, priceRange: "$", description: "Famous for ghewar, pyaaz kachori, and Rajasthani thali.", lat: 26.9213, lng: 75.8189, imageUrl: "https://images.unsplash.com/photo-1517244683847-745431cd6028?w=800&auto=format&fit=crop&q=80" },
  { id: "jai-4", name: "City Palace", city: "Jaipur", category: "monument", rating: 4.7, priceRange: "$$", description: "Royal palace complex with museums, courtyards, and gardens.", lat: 26.9255, lng: 75.8235, imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80" },
  { id: "jai-5", name: "Jal Mahal", city: "Jaipur", category: "monument", rating: 4.4, priceRange: "Free", description: "Water palace floating in the middle of Man Sagar Lake.", lat: 26.9531, lng: 75.8493, imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80" },
  { id: "jai-6", name: "Moustache Jaipur", city: "Jaipur", category: "hotel", rating: 4.5, priceRange: "$", description: "Vibrant hostel with rooftop views and social events.", lat: 26.9239, lng: 75.8235, imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&auto=format&fit=crop&q=80" },
  { id: "jai-7", name: "Johari Bazaar", city: "Jaipur", category: "market", rating: 4.5, priceRange: "$$", description: "Jeweler's market for traditional Kundan and Meenakari jewelry.", lat: 26.9200, lng: 75.8250, imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80" },
  { id: "jai-8", name: "Galta Ji Temple", city: "Jaipur", category: "temple", rating: 4.3, priceRange: "Free", description: "Ancient monkey temple with natural springs and hill views.", lat: 26.9117, lng: 75.8633, imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80" },
  { id: "jai-9", name: "Nahargarh Fort", city: "Jaipur", rating: 4.6, category: "monument", priceRange: "$", description: "Fortress on the Aravalli hills with stunning city panoramas.", lat: 26.9383, lng: 75.8153, imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80" },
  { id: "jai-10", name: "Chokhi Dhani", city: "Jaipur", category: "restaurant", rating: 4.5, priceRange: "$$", description: "Ethnic village resort with Rajasthani food, folk dance, and camel rides.", lat: 26.7950, lng: 75.8250, imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop&q=80" },

  // ── Kerala (10) ──
  { id: "ker-1", name: "Alleppey Backwaters", city: "Kerala", category: "monument", rating: 4.9, priceRange: "$$", description: "Serene houseboat cruises through palm-fringed canals.", lat: 9.4981, lng: 76.3388, imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80" },
  { id: "ker-2", name: "Munnar Tea Gardens", city: "Kerala", category: "monument", rating: 4.8, priceRange: "Free", description: "Rolling green tea plantations in the Western Ghats.", lat: 10.0889, lng: 77.0595, imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80" },
  { id: "ker-3", name: "Kovalam Beach", city: "Kerala", category: "beach", rating: 4.5, priceRange: "Free", description: "Crescent beach with lighthouse and Ayurvedic spas.", lat: 8.4003, lng: 76.9750, imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80" },
  { id: "ker-4", name: "Padmanabhaswamy Temple", city: "Kerala", category: "temple", rating: 4.7, priceRange: "Free", description: "Ancient Vishnu temple, one of the wealthiest in the world.", lat: 8.4844, lng: 76.9472, imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80" },
  { id: "ker-5", name: "Fort Kochi", city: "Kerala", category: "monument", rating: 4.6, priceRange: "Free", description: "Colonial heritage area with Chinese fishing nets and art cafes.", lat: 9.9667, lng: 76.2433, imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80" },
  { id: "ker-6", name: "Zostel Munnar", city: "Kerala", category: "hotel", rating: 4.3, priceRange: "$", description: "Cozy hostel overlooking tea plantations and misty hills.", lat: 10.0889, lng: 77.0595, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80" },
  { id: "ker-7", name: "Paragon Restaurant", city: "Kerala", category: "restaurant", rating: 4.7, priceRange: "$$", description: "Legendary Kozhikode biryani and Kerala seafood.", lat: 11.2588, lng: 75.7804, imageUrl: "https://images.unsplash.com/photo-1517244683847-745431cd6028?w=800&auto=format&fit=crop&q=80" },
  { id: "ker-8", name: "Varkala Beach", city: "Kerala", category: "beach", rating: 4.6, priceRange: "Free", description: "Clifftop beach with natural springs and yoga retreats.", lat: 8.7378, lng: 76.7056, imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80" },
  { id: "ker-9", name: "Broadway Market", city: "Kerala", category: "market", rating: 4.2, priceRange: "$", description: "Bustling Ernakulam market for spices, textiles, and local snacks.", lat: 9.9894, lng: 76.2869, imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80" },
  { id: "ker-10", name: "Thekkady Wildlife", city: "Kerala", category: "monument", rating: 4.5, priceRange: "$$", description: "Periyar Tiger Reserve with boat safaris and spice plantations.", lat: 9.6117, lng: 77.1667, imageUrl: "https://images.unsplash.com/photo-1432405972618-c6b0cfba8d03?w=800&auto=format&fit=crop&q=80" },
]
