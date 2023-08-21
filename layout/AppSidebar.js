import Link from 'next/link';
import AppMenu from './AppMenu';
import { MenuProvider } from './context/menucontext';

const AppSidebar = () => {
    return (
        <>
            {/* @see https://github.com/vercel/next.js/commit/489e65ed98544e69b0afd7e0cfc3f9f6c2b803b7 */}
            

            <div className="layout-menu-container">
                <MenuProvider>
                    <AppMenu />
                </MenuProvider>
            </div>
        </>
    );
};

export default AppSidebar;
