const FAVORITES_KEY = 'favoriteIds';

const getFavoriteIds = () => {
    try {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem('favoriteIds');
        const ids = stored ? JSON.parse(stored) : [];
        return Array.isArray(ids) ? ids : [];
    } catch (e) {
        console.error('❌ Ошибка:', e);
        return [];
    }
};

const isInFavorites = (productId) => {
    try {
        if (typeof window === 'undefined') return false;
        const ids = getFavoriteIds();
        return ids.includes(productId);
    } catch (e) {
        return false;
    }
};

const addToFavorites = (product) => {
    try {
        if (typeof window === 'undefined') return false;
        const productId = product.databaseId;
        const ids = getFavoriteIds();
        if (ids.includes(productId)) return false;
        const newIds = [...ids, productId];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newIds));
        window.dispatchEvent(new Event('favoritesChanged'));
        return true;
    } catch (e) {
        return false;
    }
};

const removeFromFavorites = (productId) => {
    try {
        if (typeof window === 'undefined') return false;
        const ids = getFavoriteIds();
        const newIds = ids.filter(id => id !== productId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newIds));
        window.dispatchEvent(new Event('favoritesChanged'));
        return true;
    } catch (e) {
        return false;
    }
};

const toggleFavorite = (product) => {
    const productId = product.databaseId;
    if (isInFavorites(productId)) {
        return removeFromFavorites(productId);
    } else {
        return addToFavorites(product);
    }
};

const getFavoriteCount = () => {
    try {
        if (typeof window === 'undefined') return 0;
        const ids = getFavoriteIds();
        return ids.length;
    } catch (e) {
        return 0;
    }
};

const clearFavorites = () => {
    try {
        if (typeof window === 'undefined') return false;
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
        window.dispatchEvent(new Event('favoritesChanged'));
        return true;
    } catch (e) {
        return false;
    }
};

const getAllFavorites = () => {
    try {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(FAVORITES_KEY);
        const items = stored ? JSON.parse(stored) : [];
        // ✅ Фильтруем null значения
        return Array.isArray(items) ? items.filter(id => id) : [];
    } catch (e) {
        console.error('❌ Ошибка:', e);
        return [];
    }
};

export const useFavoriteStore = {
    addItem: addToFavorites,
    removeItem: removeFromFavorites,
    toggleFavorite,
    isInFavorites,
    getFavoriteIds,
    getAllFavorites,      // ✅ ДОБАВИТЬ ЭТУ СТРОКУ!
    getFavoriteCount,
    clearFavorites,
};

export {
    getFavoriteIds,
    isInFavorites,
    addToFavorites,
    removeFromFavorites,
    getAllFavorites,
    toggleFavorite,
    getFavoriteCount,
    clearFavorites,
};
