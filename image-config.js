// Image Configuration for Nakuru Coffee House
// Best Image APIs and Dynamic Loading System

const IMAGE_CONFIG = {
    // Primary API - Unsplash (Best for coffee photos)
    unsplash: {
        base: 'https://images.unsplash.com/photo-',
        params: '?w=400&h=300&fit=crop&crop=center',
        coffeeIds: {
            kenyanEspresso: '1510550760185-1e5a9b1c5c99',
            cappuccino: '1549060279-7e168ccee14b',
            latte: '1532938125485-7211e1165a84',
            americano: '1578662996442-48f60103fc96',
            mocha: '1572442388486-a885a88a9361',
            caramelMacchiato: '1534752182431-1f5e2c2e3d3b',
            matchaLatte: '1576092768241-dec231879fc3',
            flatWhite: '1564890369478-c89ca6d9cda9',
            turkishCoffee: '1556909114-f6e7ad7d3136',
            coldBrew: '1559491565-c770c18e0d59',
            hibiscusTea: '1578662996442-48f60103fc96',
            affogato: '1571875493083-4b78c1b3b8b8'
        }
    },
    
    // Pexels API (Alternative)
    pexels: {
        base: 'https://images.pexels.com/photos/',
        params: '?auto=compress&cs=tinysrgb&w=400&h=300',
        coffeeIds: {
            kenyanEspresso: '989547',
            cappuccino: '1024459',
            latte: '1024459',
            americano: '989547',
            mocha: '1024459',
            caramelMacchiato: '1024459',
            matchaLatte: '1578662996442-48f60103fc96',
            flatWhite: '1024459',
            turkishCoffee: '989547',
            coldBrew: '1559491565-c770c18e0d59',
            hibiscusTea: '1578662996442-48f60103fc96',
            affogato: '1571875493083-4b78c1b3b8b8'
        }
    },
    
    // Pixabay API (Alternative)
    pixabay: {
        base: 'https://pixabay.com/get/',
        params: '_960_720.jpg',
        coffeeIds: {
            kenyanEspresso: 'g19a8b6c6b_640',
            cappuccino: 'g19a8b6c6b_640',
            latte: 'g19a8b6c6b_640',
            americano: 'g19a8b6c6b_640',
            mocha: 'g19a8b6c6b_640',
            caramelMacchiato: 'g19a8b6c6b_640',
            matchaLatte: 'g19a8b6c6b_640',
            flatWhite: 'g19a8b6c6b_640',
            turkishCoffee: 'g19a8b6c6b_640',
            coldBrew: 'g19a8b6c6b_640',
            hibiscusTea: 'g19a8b6c6b_640',
            affogato: 'g19a8b6c6b_640'
        }
    },
    
    // Dynamic Unsplash Source API (Random images)
    unsplashSource: {
        base: 'https://source.unsplash.com/featured/',
        coffeeTypes: {
            kenyanEspresso: 'kenyan-coffee',
            cappuccino: 'cappuccino',
            latte: 'latte',
            americano: 'americano',
            mocha: 'mocha',
            caramelMacchiato: 'caramel-macchiato',
            matchaLatte: 'matcha-latte',
            flatWhite: 'flat-white',
            turkishCoffee: 'turkish-coffee',
            coldBrew: 'cold-brew',
            hibiscusTea: 'hibiscus-tea',
            affogato: 'affogato'
        }
    }
};

// Current API to use (change this to switch APIs)
const CURRENT_API = 'unsplash';

// Function to get image URL
function getImageUrl(coffeeType, api = CURRENT_API) {
    const config = IMAGE_CONFIG[api];
    
    if (api === 'unsplashSource') {
        return `${config.base}${config.coffeeTypes[coffeeType]}?w=400&h=300&fit=crop&crop=center`;
    }
    
    const photoId = config.coffeeIds[coffeeType];
    return `${config.base}${photoId}${config.params}`;
}

// Function to get all menu images
function getAllMenuImages(api = CURRENT_API) {
    const images = {};
    Object.keys(IMAGE_CONFIG.unsplash.coffeeIds).forEach(coffeeType => {
        images[coffeeType] = getImageUrl(coffeeType, api);
    });
    return images;
}

// Function to update menu images dynamically
function updateMenuImages(api = CURRENT_API) {
    const images = getAllMenuImages(api);
    
    // Update all menu item images
    document.querySelectorAll('.menu-item').forEach((item, index) => {
        const img = item.querySelector('.coffee-img');
        if (img) {
            const coffeeType = Object.keys(images)[index];
            if (images[coffeeType]) {
                img.src = images[coffeeType];
            }
        }
    });
}

// Function to preload images for better performance
function preloadImages(api = CURRENT_API) {
    const images = getAllMenuImages(api);
    Object.values(images).forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IMAGE_CONFIG, getImageUrl, getAllMenuImages, updateMenuImages, preloadImages };
} else {
    window.ImageConfig = { IMAGE_CONFIG, getImageUrl, getAllMenuImages, updateMenuImages, preloadImages };
}
