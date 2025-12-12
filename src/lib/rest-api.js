export const fetchAllShippingMethods = async () => {
    try {
        const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;

        const response = await fetch(
            `${WORDPRESS_URL}/wp-json/beastfpv/v1/shipping-methods`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch shipping methods');
        }

        const methods = await response.json();
        console.log('All shipping methods:', methods);

        return methods;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};