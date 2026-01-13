/**
 * Получает URL товара по его slug
 * @param {Object} item - Объект товара
 * @returns {string} - URL товара или "/" если slug отсутствует
 */
export const getProductUrl = (item) => {
  return item?.slug ? `/product/${item.slug}` : "/";
};

/**
 * Получает URL изображения товара или дефолтное изображение
 * @param {Object} item - Объект товара
 * @returns {string} - URL изображения
 */
export const getProductImage = (item) => {
  return item?.image || "/images/product_image.jpg";
};
