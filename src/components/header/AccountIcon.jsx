'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/useAuth';

const AccountIcon = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    return (
        <Link
            className='icon-action account-auth header__mobile-invisible'
            href="/account/"
        >

            <img
                src={isHydrated && isAuthenticated ? "/icons-header/account-red.svg" : "/icons-header/account.svg"}
                alt="account"
            />
        </Link>
    );
};

export default AccountIcon;