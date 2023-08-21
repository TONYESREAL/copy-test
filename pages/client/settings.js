import React, { useContext, useEffect, useRef, useState } from 'react';
import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { InputText } from 'primereact/inputtext';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useRouter } from 'next/router'
import { useSession } from "next-auth/react"

const ClientApi = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const dt = useRef(null);
    const router = useRouter()
    const { data: session, status } = useSession()

    const [globalFilter, setGlobalFilter] = useState('');

    const getHeader = () => {
        return (
            <div className="flex justify-content-end">
                <div className="p-input-icon-left">
                    <i className="pi pi-search"></i>
                    <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search errors" />
                </div>
            </div>
        );
    };

    let header = getHeader();

    const [isLoading, setLoading] = useState(false)
    const [progressLoading, setProgressLoading] = useState(false)

    const [api, setAPI] = useState()
    const [secret, setSecret] = useState()
    const [maxAllowed, setMaxAllowed] = useState()
    const [risk, setRisk] = useState()

    const updateSettings = async () => {
        setProgressLoading(true)
        let params = {
            user: session.user.email,
            api: api,
            secret: secret,
            max_allowed: maxAllowed,
            risk: risk
        }
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        }
        fetch('http://localhost:5000/check_api', options)
            .then((res) => res.json())
            .then((data) => {
                getSettings()
                setProgressLoading(false)
            })
    }

    const getSettings = async () => {
        setLoading(true)
        let params = {
            year: ''
        };
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        };
        fetch('/api/admin/get_api', options)
            .then((res) => res.json())
            .then((data) => {
                setAPI(data[0]['api'])
                setSecret(data[0]['secret'])
                setMaxAllowed(data[0]['max_allowed'])
                setRisk(data[0]['risk'])
                setLoading(false)
            })
    }

    useEffect(() => {
        getSettings();
    }, [layoutConfig]);


    if (status === 'unauthenticated') {
        router.push('/login')
    }
    if (status === 'authenticated') {
        return (
            <>
                <span className="text-900 font-bold text-4xl">Settings</span>
                <div className="grid">
                    <div className="col-12 md:col-12">
                        <div className="card p-fluid">
                            <div className="field">
                                <label htmlFor="name">API Key</label>
                                <InputText id="api" type="text" value={api} onChange={(e) => setAPI(e.target.value)} />
                            </div>
                            <div className="field">
                                <label htmlFor="secret">Secret</label>
                                <InputText id="secret" type="text" value={secret} onChange={(e) => setSecret(e.target.value)} />
                            </div>
                            <div className="field">
                                <label htmlFor="max_allowed">Max Allowed</label>
                                <InputText id="max_allowed" type="text" value={maxAllowed} onChange={(e) => setMaxAllowed(e.target.value)} />
                            </div>
                            <div className="field">
                                <label htmlFor="risk">Risk</label>
                                <InputText id="risk" type="text" value={risk} onChange={(e) => setRisk(e.target.value)} />
                            </div>
                            {!progressLoading &&
                                <Button label="Update" severity="success" raised onClick={() => updateSettings()} />
                            }
                            {progressLoading &&
                                <ProgressBar mode="indeterminate" style={{ height: '6px' }}></ProgressBar>
                            }
                            <p></p>
                        </div>
                    </div>
                </div>
            </>
        );
    }
};

export default ClientApi;
