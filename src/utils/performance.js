// Performance Optimizations

// Cache keys
const CACHE_KEYS = {
    EMPLOYEES: 'employees',
    ATTENDANCE: 'attendance',
    PAYROLL: 'payroll',
    LEAVE: 'leave',
    USER: 'user'
};

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes
    LONG: 24 * 60 * 60 * 1000  // 24 hours
};

// Cache manager
class CacheManager {
    constructor() {
        this.cache = new Map();
    }

    // Get cached data
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        const { data, timestamp, duration } = item;
        if (Date.now() - timestamp > duration) {
            this.cache.delete(key);
            return null;
        }

        return data;
    }

    // Set cache data
    set(key, data, duration) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            duration
        });
    }

    // Clear cache
    clear(key) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
}

// Create cache instance
const cache = new CacheManager();

// Image compression
async function compressImage(file, { maxWidth = 800, quality = 0.7 } = {}) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate dimensions
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // Set canvas size
                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Lazy loading images
function lazyLoadImage(imgElement) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });

    observer.observe(imgElement);
}

// Performance monitoring
const performance = {
    // Start timing
    start(label) {
        if (process.env.NODE_ENV === 'development') {
            console.time(label);
        }
    },

    // End timing
    end(label) {
        if (process.env.NODE_ENV === 'development') {
            console.timeEnd(label);
        }
    },

    // Mark performance
    mark(name) {
        if (process.env.NODE_ENV === 'development') {
            performance.mark(name);
        }
    },

    // Measure between marks
    measure(name, startMark, endMark) {
        if (process.env.NODE_ENV === 'development') {
            performance.measure(name, startMark, endMark);
        }
    }
};

// API request optimization
async function optimizedRequest(url, options = {}) {
    const cacheKey = `${url}${JSON.stringify(options)}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const response = await fetch(url, options);
    const data = await response.json();

    // Cache successful GET requests
    if (options.method === 'GET' && response.ok) {
        cache.set(cacheKey, data, CACHE_DURATIONS.SHORT);
    }

    return data;
}

// Export utilities
export {
    CACHE_KEYS,
    CACHE_DURATIONS,
    cache,
    compressImage,
    debounce,
    throttle,
    lazyLoadImage,
    performance,
    optimizedRequest
};
