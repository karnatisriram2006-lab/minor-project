/**
 * Global Image Service for YĀTRĀ
 * Fetches, caches, and manages place imagery from Unsplash and local fallbacks.
 */

import touristPlacesData from '../data/touristPlaces.json';
import placesData from '../data/places.json';

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';

// High-quality curated fallbacks for major Indian destinations
const PREMIUM_FALLBACKS: Record<string, string> = {
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
  delhi: 'https://images.unsplash.com/photo-1587474260584-1f35a74a8970?w=800&q=80',
  mumbai: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&q=80',
  udaipur: 'https://images.unsplash.com/photo-1590497672223-b67705cc8672?w=800&q=80',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
  kochi: 'https://images.unsplash.com/photo-1589783901535-c54766f2025b?w=800&q=80',
  varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80',
  agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
};

const CACHE_PREFIX = 'yatra_img_v13_';

const STATIC_MAPPINGS: Record<string, string> = {
  // Jaipur
  'hawa mahal': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
  'amber fort': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80',
  'amer fort': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80',
  'city palace': 'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?w=800&q=80',
  'jal mahal': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80',
  'nahargarh fort': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
  'albert hall museum': 'https://images.unsplash.com/photo-1612053075271-eecb1f930e13?w=800&q=80',
  
  // Agra
  'taj mahal': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
  'agra fort': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80',
  
  // Delhi
  'qutub minar': 'https://images.unsplash.com/photo-1523544545175-92e04b96d26b?w=800&q=80',
  'red fort': 'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800&q=80',
  'india gate': 'https://images.unsplash.com/photo-1587474260584-1f35a74a8970?w=800&q=80',
  'lotus temple': 'https://images.unsplash.com/photo-1565361617161-417bbad17933?w=800&q=80',
  
  // Mumbai
  'gateway of india': 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&q=80',
  'marine drive': 'https://images.unsplash.com/photo-1562979314-bee7453e911c?w=800&q=80',
  'chhatrapati shivaji terminus': 'https://images.unsplash.com/photo-1570160897040-30430ed22114?w=800&q=80',
  
  // Others
  'golden temple': 'https://images.unsplash.com/photo-1588096344316-f70396ee9712?w=800&q=80',
  'charminar': 'https://images.unsplash.com/photo-1581390129939-946a9a693a7f?w=800&q=80',
  'meenakshi temple': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
  'sun temple': 'https://images.unsplash.com/photo-1569477458557-3f8d38440539?w=800&q=80',
};

export interface PlaceImage {
  url: string;
  attribution?: string;
}

class ImageService {
  private cache: Map<string, string> = new Map();
  private datasetMapping: Record<string, string> = {};

  constructor() {
    // 1. Initialize Dataset Mapping from touristPlaces.json (Exact URLs)
    touristPlacesData.forEach((place: any) => {
      this.datasetMapping[place.name.toLowerCase().trim()] = place.image;
    });

    // 2. Supplement with keywords from places.json for better searching
    placesData.forEach((place: any) => {
      const nameKey = place.name.toLowerCase().trim();
      if (!this.datasetMapping[nameKey] && place.imageKeyword) {
          // Store keyword for smarter fallback searching
          this.datasetMapping[`kw_${nameKey}`] = place.imageKeyword;
      }
    });

    // 3. Initial hydration from localStorage
    if (typeof window !== 'undefined') {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(CACHE_PREFIX)) {
            const place = key.replace(CACHE_PREFIX, '');
            this.cache.set(place, localStorage.getItem(key)!);
          }
        });
      } catch (e) {
        console.warn('[ImageService] LocalStorage access failed');
      }
    }
  }

  /**
   * Fetches a highly accurate image for a place.
   * Priority: Static Mapping -> Filtered API Result -> First API Result -> Category Fallback
   */
  async getPlaceImage(place: string, city?: string, state: string = ''): Promise<string> {
    if (!place) return 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&q=80';

    const cleanPlace = place.toLowerCase().trim();
    const cacheKey = `${cleanPlace}_${(city || '').toLowerCase().trim()}_${state.toLowerCase().trim()}`;
    
    // 1. Priority: Static Image Mapping (Exact Dictionary)
    if (STATIC_MAPPINGS[cleanPlace]) {
      return STATIC_MAPPINGS[cleanPlace];
    }

    // 2. Secondary Priority: JSON Dataset Exact Match
    if (this.datasetMapping[cleanPlace]) {
      return this.datasetMapping[cleanPlace];
    }

    // 3. Check Cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // 3. Try Wikipedia (Official) Official Thumbnail Discovery
    try {
      const wikiUrl = await this.getWikipediaImage(cleanPlace);
      if (wikiUrl) {
        this.saveToCache(cacheKey, wikiUrl);
        return wikiUrl;
      }
    } catch (e) {
      console.warn('[ImageService] Wikipedia discovery failed:', cleanPlace);
    }

    // 4. Try Unsplash API with Structured Query & Strict Filtering
    if (UNSPLASH_ACCESS_KEY) {
      try {
        // Use imageKeyword from dataset if available to make the search more precise
        const datasetKeyword = this.datasetMapping[`kw_${cleanPlace}`];
        const searchQuery = datasetKeyword ? `${datasetKeyword} India landmark` : `${place} ${city || ''} ${state} India architecture landmark`;
        
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery.trim())}&per_page=10&client_id=${UNSPLASH_ACCESS_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            // Priority: Strict Metadata Filter (Accept images containing place name in description/alt)
            const strictMatch = data.results.find((res: any) => {
               const searchContent = `${res.alt_description || ''} ${res.description || ''} ${res.user?.location || ''}`.toLowerCase();
               return searchContent.includes(cleanPlace);
            });

            // Fallback: If no strict match found, take the most relevant (first) API result
            const url = strictMatch ? strictMatch.urls.regular : data.results[0].urls.regular;
            this.saveToCache(cacheKey, url);
            return url;
          }
        }
      } catch (error) {
        console.error('[ImageService] Production accurate fetch failed:', error);
      }
    }

    // 4. Final Fallback: Category-based High Quality Unsplash Images
    // We use a set of high-quality "vibe" images if specific ones aren't found
    const CATEGORY_FALLBACKS: Record<string, string> = {
      heritage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80', // Palace/Fort (Hawa Mahal)
      market: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80',   // Indian Market
      nature: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',   // Indian Nature/Greenery
      dining: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80',   // Indian Dining/Food
      general: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',  // Travel Vibe
    };

    let selectedFallback = CATEGORY_FALLBACKS.general;
    const lowerQuery = cleanPlace.toLowerCase();
    
    if (lowerQuery.includes('fort') || lowerQuery.includes('palace') || lowerQuery.includes('temple') || lowerQuery.includes('heritage')) {
      selectedFallback = CATEGORY_FALLBACKS.heritage;
    } else if (lowerQuery.includes('bazaar') || lowerQuery.includes('market') || lowerQuery.includes('street')) {
      selectedFallback = CATEGORY_FALLBACKS.market;
    } else if (lowerQuery.includes('park') || lowerQuery.includes('garden') || lowerQuery.includes('lake') || lowerQuery.includes('hill')) {
      selectedFallback = CATEGORY_FALLBACKS.nature;
    } else if (lowerQuery.includes('restaurant') || lowerQuery.includes('cafe') || lowerQuery.includes('food')) {
      selectedFallback = CATEGORY_FALLBACKS.dining;
    }

    this.saveToCache(cacheKey, selectedFallback);
    return selectedFallback;
  }

  /**
   * Fetches an official thumbnail from Wikipedia/MediaWiki PageImages API.
   * Very high accuracy for landmarks/museums.
   */
  private async getWikipediaImage(query: string): Promise<string | null> {
    try {
      // Use the query to search for the most relevant Wikipedia page and get its thumbnail
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(query)}&pithumbsize=800&origin=*`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const pages = data.query?.pages;
      if (!pages) return null;
      
      // Get the first page (usually the most relevant)
      const pageId = Object.keys(pages)[0];
      if (pageId === '-1') return null; // No page found
      
      const thumbnail = pages[pageId].thumbnail;
      return thumbnail ? thumbnail.source : null;
    } catch (error) {
      return null;
    }
  }

  private saveToCache(key: string, url: string) {
    this.cache.set(key, url);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CACHE_PREFIX + key, url);
      } catch (e) {}
    }
  }

  /**
   * Helper to enrich an array of objects with images
   */
  async enrichWithImages<T extends { name?: string; destination?: string; city?: string }>(items: T[]): Promise<T[]> {
    return Promise.all(items.map(async (item) => {
      const place = item.name || item.destination || item.city || '';
      const city = item.city || (item.destination !== item.name ? item.destination : undefined);
      const image = await this.getPlaceImage(place, city);
      return { ...item, placeImage: image };
    }));
  }
}

export const imageService = new ImageService();
