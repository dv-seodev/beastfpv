'use client';

import { useMutation, useApolloClient } from "@apollo/client/react";
import { gql } from "@apollo/client";

const APPLY_COUPON = gql`
    mutation ApplyCoupon($code: String!) {
        applyCoupon(input: { code: $code }) {
            applied {
                code
                description
            }
        }
    }
`;

const GET_COUPON_INFO = gql`
    query GetCouponInfo($search: String!) {
        coupons(first: 1, where: { search: $search }) {
            nodes {
                code
                amount
                discountType
                description
            }
        }
    }
`;

export const useCoupon = () => {
    const [applyCouponMutation, { loading, error }] = useMutation(APPLY_COUPON);
    const client = useApolloClient();

    const getCouponInfo = async (code) => {
        try {
            console.log('Fetching coupon info for:', code);

            const { data } = await client.query({
                query: GET_COUPON_INFO,
                variables: { search: code },
            });

            console.log('Coupons response:', data);

            if (data?.coupons?.nodes && data.coupons.nodes.length > 0) {
                const coupon = data.coupons.nodes[0];

                return {
                    amount: parseFloat(coupon.amount) || 0,
                    discountType: coupon.discountType || 'FIXED_CART',
                };
            }

            return null;
        } catch (err) {
            console.error('Error getting coupon info:', err);
            return null;
        }
    };

    const applyCode = async (code) => {
        try {
            const result = await applyCouponMutation({
                variables: { code },
            });

            console.log('Apply Coupon Response:', result.data?.applyCoupon);

            const { applied } = result.data?.applyCoupon || {};

            if (!applied?.code) {
                return { success: false, coupon: null };
            }

            // Получаем информацию о купоне
            const couponInfo = await getCouponInfo(code);

            console.log('Coupon info:', couponInfo);

            return {
                success: true,
                coupon: {
                    code: applied?.code,
                    description: applied?.description,
                    amount: couponInfo?.amount || 0,
                    discountType: couponInfo?.discountType || 'FIXED_CART',
                },
            };
        } catch (err) {
            console.error('Ошибка применения купона:', err);
            throw err;
        }
    };

    return { applyCode, loading, error };
};
