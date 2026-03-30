/**
 * Weather Service using Open-Meteo API
 * 100% Free - No API Key Required
 * Open-source weather data.
 */

export interface WeatherData {
    temperature: number;
    windSpeed: number;
    humidity: number;
    conditionCode: number;
    isDay: boolean;
    description: string;
}

// Open-Meteo WMO Interpretation Codes
const WEATHER_CODES: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear", 
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
};

export const fetchWeather = async (lat: number, lng: number): Promise<WeatherData | null> => {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&relative_humidity_2m=true&windspeed_unit=kmh&timezone=auto`
        );
        
        const data = await response.json();
        
        if (data && data.current_weather) {
            const current = data.current_weather;
            return {
                temperature: Math.round(current.temperature),
                windSpeed: Math.round(current.windspeed),
                humidity: data.current && data.current.relative_humidity_2m ? data.current.relative_humidity_2m : 65, // Fallback
                conditionCode: current.weathercode,
                isDay: current.is_day === 1,
                description: WEATHER_CODES[current.weathercode] || "Conditions unknown"
            };
        }
        
        return null;
    } catch (error) {
        console.error('[Weather] Error fetching weather:', error);
        return null;
    }
};
