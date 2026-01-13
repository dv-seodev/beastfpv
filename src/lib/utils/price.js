/**
 * Парсит строку цены в число
 * @param {string} priceString - Строка с ценой (может содержать HTML, пробелы, запятые)
 * @returns {number} - Числовое значение цены
 */
export const parsePrice = (priceString) => {
  if (!priceString) return 0;
  const cleaned = String(priceString)
    .replace(/&nbsp;/g, " ")
    .replace(/[^\d.,]/g, "")
    .replace(/\s+/g, "")
    .replace(/,/g, ".");
  return parseFloat(cleaned) || 0;
};

/**
 * Форматирует число в строку с валютой (₽)
 * @param {number} price - Числовое значение цены
 * @returns {string} - Отформатированная строка (например: "1 234 ₽")
 */
export const formatPriceForDisplay = (price) => {
  if (typeof price !== "number" || isNaN(price)) {
    return "0 ₽";
  }
  return (
    new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(price)) + " ₽"
  );
};
