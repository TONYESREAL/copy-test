import React, { useContext, useEffect, useRef, useState } from 'react';
import getConfig from 'next/config';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { StyleClass } from 'primereact/styleclass';
import AppConfig from '../layout/AppConfig';
import { LayoutContext } from '../layout/context/layoutcontext';
import { useRouter } from 'next/router'
import { useSession } from "next-auth/react"

function LandingPage() {
    const [darkMode, setDarkMode] = useState(false);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const { layoutConfig } = useContext(LayoutContext);
    const { data: session, status } = useSession()
    const menuRef = useRef();

    const router = useRouter()

    const goTo = () => {
        if (status == 'unauthenticated') {
            router.push('/login')
        }
        if (status == 'authenticated') {
            if (session.user.email == process.env.NEXT_PUBLIC_ADMIN) {
                router.push('/admin/dashboard')
            } else {
                router.push('/client/dashboard')
            }
        }
    }

    useEffect(() => {
        setDarkMode(layoutConfig.colorScheme === 'dark' || layoutConfig.colorScheme === 'dim' ? true : false);
    }, [layoutConfig.colorScheme]);

    return (
        <div className="relative overflow-hidden flex flex-column justify-content-center">
            <div className="bg-circle opacity-50" style={{ top: '-200px', left: '-700px' }}></div>
            <div className="bg-circle hidden lg:flex" style={{ top: '50px', right: '-800px', transform: 'rotate(60deg)' }}></div>
            <div className="px-5 min-h-screen flex justify-content-center align-items-center">
                    <div className="z-1 text-center">
                        <div className="text-900 font-bold text-8xl mb-4">JONA Trading Dashboard</div>
                        <p className="line-height-3 mt-0 mb-5 text-700 text-xl font-medium"></p>
                        <Link href={'/'}>
                            <button type="button" className="p-button p-button-warning font-medium p-button-raised" onClick={() => goTo()}>
                                Go to Dashboard
                            </button>
                        </Link>
                    </div>
            </div>
        </div>
    );
}

LandingPage.getLayout = function getLayout(page) {
    return (
        <React.Fragment>
            {page}
            <AppConfig minimal />
        </React.Fragment>
    );
};

export default LandingPage;
