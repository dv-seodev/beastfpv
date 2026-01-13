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
