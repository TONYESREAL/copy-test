import getConfig from 'next/config';
import { InputText } from 'primereact/inputtext';
import { forwardRef, useContext, useImperativeHandle, useRef, useEffect, useState } from 'react';
import AppBreadcrumb from './AppBreadCrumb';
import { LayoutContext } from './context/layoutcontext';
import { useSession } from "next-auth/react"
import { InputSwitch } from "primereact/inputswitch";


const AppTopbar = forwardRef((props, ref) => {
    const { onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const { data: session, status } = useSession()

    const { layoutConfig, setLayoutConfig, layoutState, setLayoutState, isSlim, isHorizontal } = useContext(LayoutContext);

    const [checked, setChecked] = useState(false);

    useEffect(() => {
        //if (layoutConfig.colorScheme == 'dim') {
        //    setChecked(true)
        //}
    });

    const changeTheme = (e) => {
        if (e == false) {
            changeColorScheme('light')
            setChecked(false)
        } else {
            changeColorScheme('dim')
            setChecked(true)
        }
    }
    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current
    }));

    const replaceLink = (linkElement, href, onComplete) => {
        if (!linkElement || !href) {
            return;
        }

        const id = linkElement.getAttribute('id');
        const cloneLinkElement = linkElement.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

        cloneLinkElement.addEventListener('load', () => {
            linkElement.remove();

            const element = document.getElementById(id); // re-check
            element && element.remove();

            cloneLinkElement.setAttribute('id', id);
            onComplete && onComplete();
        });
    };

    const changeColorScheme = (colorScheme) => {
        const themeLink = document.getElementById('theme-link');
        const themeLinkHref = themeLink.getAttribute('href');
        const currentColorScheme = 'theme-' + layoutConfig.colorScheme.toString();
        const newColorScheme = 'theme-' + colorScheme;
        const newHref = themeLinkHref.replace(currentColorScheme, newColorScheme);

        replaceLink(themeLink, newHref, () => {
            setLayoutConfig((prevState) => ({ ...prevState, colorScheme }));
        });
    };

    if (status === "unauthenticated") {
        <></>
    }
    if (status === "authenticated") {

        return (
            <div className="layout-topbar">
                <div className="topbar-start">
                    <button ref={menubuttonRef} type="button" className="topbar-menubutton p-link p-trigger" onClick={onMenuToggle}>
                        <i className="pi pi-bars"></i>
                    </button>

                    <AppBreadcrumb className="topbar-breadcrumb"></AppBreadcrumb>
                </div>

                <div className="topbar-end">
                    <ul className="topbar-menu">
                        {/*
                        <li className="topbar-search">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search"></i>
                                <InputText type="text" placeholder="Search" className="w-12rem sm:w-full" />
                            </span>
                        </li>*/}
                        {/*<InputSwitch checked={checked} onChange={(e) => changeTheme(e.value)} />*/}
                        <li className="topbar-profile">
                            <button type="button" className="p-link" onClick={showProfileSidebar}>
                                {/*<img src={`${contextPath}/layout/images/avatar.png`} alt="Profile" />*/}
                                {session.user.image.includes('google') &&
                                    <img src={session.user.image} height="120px" width="120px" alt="Profile" className="border-round"></img>
                                }
                                {!session.user.image.includes('google') &&
                                    <img src={`${contextPath}/layout/images/avatar.png`} alt="Profile" />
                                }
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        );

    }
});

export default AppTopbar;
