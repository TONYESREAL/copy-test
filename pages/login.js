import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import AppConfig from '../layout/AppConfig';
import { LayoutContext } from '../layout/context/layoutcontext';
import { getCsrfToken, signIn } from "next-auth/react"
import { FcGoogle, FcReddit } from 'react-icons/fc';
import { FaGithub, FaTwitter } from 'react-icons/fa'
import { useSession } from "next-auth/react"

function SignIn({ csrfToken }) {
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession()

    const { layoutConfig } = useContext(LayoutContext);
    const dark = layoutConfig.colorScheme !== 'light';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('')
    const [confirm, setConfirmPassword] = useState('');
    const [type, setType] = useState('Login');
    const [accept, setAccept] = useState(true)

    const signinUser = async () => {
        let options = { redirect: false, email, password }
        console.log('OPTIONS: ', options)
        const res = await signIn('credentials', options)
        setMessage(null)
        if (res?.error) {
            setMessage(res.error)
        }
        //return router.push('/')
    }

    const signupUser = async () => {
        setMessage(null);
        if (password != confirm) {
            setMessage("Passwords don't match")
            return false
        }
        if (accept) {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            })
            let data = await res.json()
            console.log('SIGNUP RES: ', data)
            if (data.message) {
                setMessage(data.message)
            }
            if (data.message == 'Registered successfully') {
                let options = { redirect: false, email, password }
                const res = await signIn("credentials", options)
                setMessage("You registered succesfully")
                setType('Login')
                return res
            }
        } else {
            setMessage('You must accept our Terms & Conditions and Risk Policy')
        }

    }

    const forgotPassword = async () => {
        const res = await fetch('/api/forgot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        })
        let data = await res.json()
        if (data.message == 'Not found') {
            setMessage("Email not found")
        } else {
            setMessage("Reset password link sent")
        }
    }

    if (status === 'authenticated') {
        if (session.user.email == process.env.NEXT_PUBLIC_EMAIL) {
            router.push('/admin/dashboard')
        } else {
            router.push('/client/dashboard')
        }
    }
    if (status === 'unauthenticated') {
        return (
            <>
                <ConfirmDialog />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 800" className="fixed left-0 top-0 min-h-screen min-w-screen" preserveAspectRatio="none">
                    <rect fill={dark ? 'var(--primary-900)' : 'var(--primary-500)'} width="1600" height="800" />
                    <path
                        fill={dark ? 'var(--primary-800)' : 'var(--primary-400)'}
                        d="M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z"
                    />
                    <path
                        fill={dark ? 'var(--primary-700)' : 'var(--primary-300)'}
                        d="M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z"
                    />
                    <path
                        fill={dark ? 'var(--primary-600)' : 'var(--primary-200)'}
                        d="M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z"
                    />
                    <path fill={dark ? 'var(--primary-500)' : 'var(--primary-100)'} d="M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z" />
                </svg>
                {type == 'Login' &&
                    <div className="px-5 min-h-screen flex justify-content-center align-items-center">
                        <div className="border-1 surface-border surface-card border-round py-7 px-4 md:px-7 z-1">
                            <div className="mb-4">
                                <div className="text-900 text-xl font-bold mb-2">Log in</div>
                                <span className="text-600 font-medium">Please enter your details</span>
                            </div>
                            <div className="flex flex-column">
                                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                                <span className="p-input-icon-left w-full mb-4">
                                    <i className="pi pi-envelope"></i>
                                    <InputText id="email" type="text" className="w-full md:w-25rem" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                                </span>
                                <span className="p-input-icon-left w-full mb-4">
                                    <i className="pi pi-lock"></i>
                                    <InputText id="password" type="password" className="w-full md:w-25rem" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                                </span>
                                {message}
                                <div className="mb-4 flex flex-wrap gap-3">
                                    <div>
                                        <a className="text-600 cursor-pointer hover:text-primary cursor-pointer ml-auto transition-colors transition-duration-300" onClick={() => setType('Forgot')}>Reset password</a>
                                    </div>
                                </div>
                                <Button label="Log in" onClick={() => signinUser()} className="w-full md:w-25rem"></Button>
                                <p>Or</p>
                                <Button label="Google" className="w-full md:w-25rem" onClick={() => signIn('google')} icon={<FcGoogle />}></Button>
                                <p></p>
                                <a href="#" onClick={() => setType('Signup')} css={{
                                    textAlign: "center"
                                }}>Sign up account</a>
                                <p></p>
                                
                            </div>
                        </div>
                    </div>
                }
                {type == 'Signup' &&
                    <div className="px-5 min-h-screen flex justify-content-center align-items-center">
                        <div className="border-1 surface-border surface-card border-round py-7 px-4 md:px-7 z-1">
                            <div className="mb-4">
                                <div className="text-900 text-xl font-bold mb-2">Signup</div>
                                <span className="text-600 font-medium">Please enter your details</span>
                            </div>
                            <div className="flex flex-column">

                                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                                <span className="p-input-icon-left w-full mb-4">
                                    <i className="pi pi-envelope"></i>
                                    <InputText id="email" type="text" className="w-full md:w-25rem" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                                </span>
                                <span className="p-input-icon-left w-full mb-4">
                                    <i className="pi pi-lock"></i>
                                    <InputText id="password" type="password" className="w-full md:w-25rem" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                                </span>
                                <span className="p-input-icon-left w-full mb-4">
                                    <i className="pi pi-lock"></i>
                                    <InputText id="confirm_password" type="password" className="w-full md:w-25rem" placeholder="Confirm password" value={confirm} onChange={e => setConfirmPassword(e.target.value)} />
                                </span>
                                <p>
                                    {message}
                                </p>
                                <Button label="Signup" onClick={() => signupUser()} className="w-full md:w-25rem"></Button>
                                <p>Or</p>

                                <Button label="Google" className="w-full md:w-25rem" onClick={() => signIn('google')} icon={<FcGoogle />}></Button>
                                <p></p>
                                <a href="#" onClick={() => setType('Login')} css={{
                                    textAlign: "center"
                                }}>Log in</a>
                                <p></p>
                                
                            </div>
                        </div>
                    </div>
                }
                {type == 'Forgot' &&
                    <div className="px-5 min-h-screen flex justify-content-center align-items-center">
                        <div className="border-1 surface-border surface-card border-round py-7 px-4 md:px-7 z-1">
                            <div className="mb-4">
                                <div className="text-900 text-xl font-bold mb-2">Reset password</div>
                                <span className="text-600 font-medium">Please enter your email</span>
                            </div>
                            <div className="flex flex-column">

                                <span className="p-input-icon-left w-full mb-4">
                                    <i className="pi pi-envelope"></i>
                                    <InputText id="email" type="text" className="w-full md:w-25rem" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                                </span>
                                <Button label="Reset password" onClick={() => forgotPassword()} className="w-full md:w-25rem"></Button>
                                <p></p>
                                <a href="#" onClick={() => setType('Login')} css={{
                                    textAlign: "center"
                                }}>Log in</a>
                                <p></p>
                                
                            </div>
                        </div>
                    </div>
                }
            </>
        );
    }
}

SignIn.getLayout = function getLayout(page) {
    return (
        <React.Fragment>
            {page}
            <AppConfig minimal />
        </React.Fragment>
    );
};

export default SignIn;

export async function getServerSideProps(context) {
    return {
        props: {
            csrfToken: await getCsrfToken(context),
        },
    }
}