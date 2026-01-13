import { parsePrice } from "./price";

/**
 * Преобразует товары из GraphQL формата в формат для отображения
 * @param {Array} nodes - Массив узлов из GraphQL cart.contents.nodes
 * @returns {Array} - Массив товаров в упрощённом формате
 */
export const transformCartItems = (nodes) => {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  return nodes.map((node) => ({
    key: node.key,
    id: node.key,
    name: node.product?.node?.name || "",
    price: parsePrice(node.product?.node?.price),
    quantity: node.quantity,
    image: node.product?.node?.image?.sourceUrl || "/images/product_image.jpg",
    slug: node.product?.node?.slug || "",
    total: parsePrice(node.subtotal || "0"),
  }));
};

/**
 * Преобразует методы доставки из GraphQL формата
 * @param {Array} availableShippingMethods - Массив методов доставки из GraphQL
 * @returns {Array} - Массив методов доставки в упрощённом формате
 */
export const transformShippingMethods = (availableShippingMethods) => {
  if (!availableShippingMethods || !Array.isArray(availableShippingMethods)) return [];
  
  return availableShippingMethods
    .flatMap((pkg) => pkg.rates || [])
    .map((rate) => ({
      id: rate.id,
      title: rate.label,
      cost: parsePrice(rate.cost),
    }));
};

/**
 * Преобразует методы оплаты из GraphQL формата
 * @param {Array} nodes - Массив узлов из GraphQL paymentGateways.nodes
 * @returns {Array} - Массив методов оплаты в упрощённом формате
 */
export const transformPaymentMethods = (nodes) => {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  return nodes.map((gateway) => ({
    id: gateway.id,
    title: gateway.title,
    description: gateway.description,
  }));
};

/**
 * Преобразует товары из REST API формата в формат для отображения
 * @param {Array} items - Массив товаров из REST API cart.items
 * @returns {Array} - Массив товаров в упрощённом формате
 */
export const transformRestCartItems = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map((item) => ({
    key: item.key,
    id: item.key,
    name: item.name,
    price: parsePrice(item.prices?.price || "0"),
    quantity: item.quantity,
    image: item.images?.[0]?.src || "/images/product_image.jpg",
    slug: item.permalink?.match(/\/product\/([^\/]+)/)?.[1] || "",
    total: parsePrice(item.totals?.line_subtotal || "0"),
  }));
};

/**
 * Преобразует методы доставки из REST API формата
 * @param {Array} shippingRates - Массив методов доставки из REST API cart.shipping_rates
 * @returns {Array} - Массив методов доставки в упрощённом формате
 */
export const transformRestShippingMethods = (shippingRates) => {
  if (!shippingRates || !Array.isArray(shippingRates)) return [];
  
  return shippingRates
    .flatMap((pkg) => pkg.shipping_rates || [])
    .map((rate) => ({
      id: rate.rate_id,
      title: rate.name,
      cost: parsePrice(rate.price || "0"),
    }));
};

/**
 * Дефолтные методы оплаты для REST API
 */
const DEFAULT_PAYMENT_METHODS = [
  { id: "cod", title: "Оплата наличными", description: "Оплата наличными при самовывозе" },
  { id: "bacs", title: "Оплата на расчетный счет", description: "Оплата на расчетный счет" },
  { id: "yookassa_widget", title: "Онлайн-оплата Юкасса", description: "Онлайн-оплата Юкасса" },
];

/**
 * Преобразует методы оплаты из REST API формата
 * @param {Array} paymentMethodIds - Массив ID методов оплаты из REST API cart.payment_methods
 * @returns {Array} - Массив методов оплаты в упрощённом формате
 */
export const transformRestPaymentMethods = (paymentMethodIds) => {
  if (!paymentMethodIds || !Array.isArray(paymentMethodIds)) return DEFAULT_PAYMENT_METHODS;
  
  return paymentMethodIds.map((methodId) => {
    const found = DEFAULT_PAYMENT_METHODS.find((m) => m.id === methodId);
    return found || { id: methodId, title: methodId, description: "" };
  });
};

/**
 * Обрабатывает ошибку с показом alert
 * @param {Error} err - Объект ошибки
 * @param {string} message - Сообщение для пользователя
 */
export const handleCartError = (err, message) => {
  console.error(message, err);
  alert(message);
};
