// @desc    Get emergency contacts for a city
// @route   GET /api/emergency/:city
// @access  Public
const getEmergencyContacts = async (req, res) => {
    const { city } = req.params;

    // Static fallback data dictionary for demo
    const contactsDB = {
        delhi: {
            police: '100',
            ambulance: '102',
            touristHelpline: '1363',
            hospitals: [
                { name: 'AIIMS Delhi', phone: '+91-11-26588500' },
                { name: 'Apollo Hospital', phone: '+91-11-29871090' }
            ],
            embassies: 'Located in Chanakyapuri (Diplomatic Enclave)'
        },
        mumbai: {
            police: '100',
            ambulance: '102',
            touristHelpline: '1363',
            hospitals: [
                { name: 'Lilavati Hospital', phone: '+91-22-26751000' },
                { name: 'Bombay Hospital', phone: '+91-22-22067676' }
            ],
            embassies: 'Located primarily in South Mumbai and BKC'
        },
        goa: {
            police: '100',
            ambulance: '108',
            touristHelpline: '1363',
            touristPolice: '+91-832-2225333',
            hospitals: [
                { name: 'Goa Medical College', phone: '+91-832-2458701' },
                { name: 'Manipal Hospital', phone: '+91-832-3048888' }
            ]
        }
    };

    const normalizedCity = city.toLowerCase();

    if (contactsDB[normalizedCity]) {
        res.json({ city: contactsDB[normalizedCity] });
    } else {
        // Default national level contacts
        res.json({
            city: {
                police: '100',
                ambulance: '102',
                fire: '101',
                touristHelpline: '1363 (National Tourist Helpline in 12 languages)',
                note: `Specific local hospital data for ${city} not currently available.`
            }
        });
    }
};

module.exports = {
    getEmergencyContacts
};
