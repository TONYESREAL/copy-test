import React, { useContext, useEffect, useRef, useState } from 'react';
import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Skeleton } from 'primereact/skeleton';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { ProgressBar } from 'primereact/progressbar';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router'

const Users = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const dt = useRef(null);
    const router = useRouter()

    const { data: session, status } = useSession()

    const [isLoading, setLoading] = useState(false)
    const [progressLoading, setProgressLoading] = useState(false)
    const [users, setUsers] = useState([])
    const [visible, setVisible] = useState(false);
    const [action, setAction] = useState('');

    const [user, setUser] = useState()
    const [api, setAPI] = useState()
    const [secret, setSecret] = useState()
    const [exchange, setExchange] = useState()
    const [maxAllowed, setMaxAllowed] = useState()
    const [risk, setRisk] = useState()
    const [apiStatus, setApiStatus] = useState()

    const exchanges = [
        { name: 'Binance', code: 'Binance' }
    ];

    const addModal = () => {
        setAction('Add')
        setUser('')
        setAPI('')
        setSecret('')
        setExchange('')
        setMaxAllowed('')
        setRisk('')
        setApiStatus('')
        setVisible(true)
    }

    const updateModal = (data) => {
        setAction('Update')
        setUser(data.user)
        setAPI(data.api)
        setSecret(data.secret)
        setExchange({ 'name': data.exchange, 'code': data.exchange })
        setMaxAllowed(data.max_allowed)
        setRisk(data.risk)
        setApiStatus(data.status)
        setVisible(true)
    }

    const updateUser = async () => {
        setProgressLoading(true)
        let params = {
            user: user,
            api: api,
            secret: secret,
            max_allowed: maxAllowed,
            risk: risk
        }
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        }
        console.log('UPDATE USER: ', params)
        const res = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API}/check_api`, options)
            .then((res) => res.json())
            .then((data) => {
                if (data['response'] == 'Error') {
                    showUserError()
                } else {
                    showUserSuccess()
                }
                setProgressLoading(false)
                setVisible(false)
                getUsers()
            })
    }

    const addUser = async () => {
        setProgressLoading(true)
        let params = {
            user: user,
            api: api,
            secret: secret,
            exchange: exchange['code'],
            max_allowed: maxAllowed,
            risk: risk,
            action: ''
        }
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API}/add_user`, options)
            .then((res) => res.json())
            .then((data) => {
                if (data['response'] == 'Error') {
                    showUserError()
                } else {
                    showUserSuccess()
                }
                setProgressLoading(false)
                setVisible(false)
                getUsers()
            })
    }

    const deleteUser = async () => {
        let params = {
            user: user
        }
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        }
        await fetch('/api/admin/delete_user', options)
            .then((res) => res.json())
            .then((data) => {
                getUsers()
            })
    }

    const getUsers = async () => {
        setLoading(true)
        let params = {
            year: ''
        };
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        };
        fetch('/api/admin/users', options)
            .then((res) => res.json())
            .then((data) => {
                setUsers(data)
                setLoading(false)
            })
    }

    const toast = useRef(null);

    const buttonEl = useRef(null);
    const [dialogVisible, setDialogVisible] = useState(false);

    const accept = () => {
        deleteUser()
        toast.current.show({ severity: 'info', summary: 'Confirmed', detail: 'You have deleted ' + user, life: 3000 });
    };

    const reject = () => {
        toast.current.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
    };

    const showUserError = () => {
        toast.current.show({ severity: 'warn', summary: 'Rejected', detail: 'Control your details and try again', life: 3000 });
    }
    const showUserSuccess = () => {
        toast.current.show({ severity: 'success', summary: 'Updated', detail: 'User details updated successfully', life: 3000 });
    }

    const confirmDelete = (u) => {
        setUser(u)
        setDialogVisible(true)
    }

    const goTo = (u) => {
        router.push(`/admin/user?id=${u}`)
    }


    useEffect(() => {
        getUsers();
    }, [layoutConfig]);


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2 sm:ml-auto">
                <Button type="button" tooltip="Update" tooltipOptions={{ position: 'bottom' }} size="sm" icon="pi pi-user-edit" className="p-button-rounded" onClick={() => updateModal(rowData)}></Button>
                <Button type="button" tooltip="Delete" tooltipOptions={{ position: 'bottom' }} size="sm" icon="pi pi-user-minus" className="p-button-rounded" ref={buttonEl} onClick={() => confirmDelete(rowData.user)}></Button>
                <Button type="button" tooltip="Details" tooltipOptions={{ position: 'bottom' }} size="sm" icon="pi pi-eye" className="p-button-rounded" onClick={() => goTo(rowData.user)}></Button>
            </div>
        )
    }

    const statusBodyTemplate = (rowData) => {
        return <>{rowData.status == 'Connected' ? <Tag value="Connected" severity="success"></Tag> : <Tag value="Error" severity="warning"></Tag>}</>;
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const balanceBodyTemplate = (rowData) => {
        return (
            <>
                {formatCurrency(parseFloat(rowData.balance))}
            </>
        );
    };

    const maxAllowedBodyTemplate = (rowData) => {
        return (
            <>
                {formatCurrency(parseFloat(rowData.max_allowed))}
            </>
        );
    };

    const percBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.risk}%
            </>
        )
    }

    const [globalFilter, setGlobalFilter] = useState('');

    const getHeader = () => {
        return (
            <div className="flex justify-content-end">
                <div className="p-input-icon-left">
                    <i className="pi pi-search"></i>
                    <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search users" />
                </div>
            </div>
        );
    };

    let header = getHeader();

    if (status === "unauthenticated") {
        router.push('/login')
    }

    if (status === "authenticated") {
        return (

            <div className="grid">
                <Toast ref={toast} />
                <ConfirmPopup target={buttonEl.current} visible={dialogVisible} onHide={() => setDialogVisible(false)}
                    message="Are you sure you want to proceed?" icon="pi pi-exclamation-triangle" accept={accept} reject={reject} />
                <Dialog header={action + " User"} visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
                    <div className="grid">
                        <div className="col-12 md:col-12">
                            <div className="card p-fluid">
                                {action == 'Add' &&
                                    <div className="field">
                                        <label htmlFor="user">User</label>
                                        <InputText id="user" type="text" value={user} onChange={(e) => setUser(e.target.value)} />
                                    </div>
                                }
                                <div className="field">
                                    <label htmlFor="api">API Key</label>
                                    <InputText id="api" type="text" value={api} onChange={(e) => setAPI(e.target.value)} className={apiStatus == 'Error' ? "p-invalid" : ''} />
                                </div>
                                <div className="field">
                                    <label htmlFor="secret">Secret Key</label>
                                    <InputText id="secret" type="text" value={secret} onChange={(e) => setSecret(e.target.value)} className={apiStatus == 'Error' ? "p-invalid" : ''} />
                                </div>
                                <div className="field">
                                    <label htmlFor="max_allowed">Max Allowed ($)</label>
                                    <InputText id="max_allowed" type="text" value={maxAllowed} onChange={(e) => setMaxAllowed(e.target.value)} />
                                </div>
                                <div className="field">
                                    <label htmlFor="risk">Risk (%)</label>
                                    <InputText id="risk" type="text" value={risk} onChange={(e) => setRisk(e.target.value)} />
                                </div>
                                {action == 'Update' &&
                                    <>
                                        {!progressLoading &&
                                            <Button label="Update" severity="success" raised onClick={() => updateUser()} />
                                        }
                                        {progressLoading &&
                                            <ProgressBar mode="indeterminate" style={{ height: '6px' }}></ProgressBar>
                                        }
                                    </>
                                }
                                {action == 'Add' &&
                                    <>
                                        {!progressLoading &&
                                            <Button label="Add" severity="success" raised onClick={() => addUser()} />
                                        }
                                        {progressLoading &&
                                            <ProgressBar mode="indeterminate" style={{ height: '6px' }}></ProgressBar>
                                        }
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </Dialog>
                <div className="col-12">
                    <div className="flex flex-column sm:flex-row align-items-center gap-4">
                        <div className="flex flex-column sm:flex-row align-items-center gap-3">
                            <div className="flex flex-column align-items-center sm:align-items-start">
                                <span className="text-900 font-bold text-4xl">Users</span>
                            </div>
                        </div>
                        <div className="flex gap-2 sm:ml-auto">
                            <Button type="button" tooltip="Add" tooltipOptions={{ position: 'bottom' }} icon="pi pi-user-plus" className="p-button-rounded" onClick={() => addModal()}></Button>
                        </div>
                    </div>
                </div>

                <div className="col-12 lg:col-12">
                    <div className="card">
                        <div className="text-900 text-xl font-semibold mb-3">Users</div>
                        {isLoading &&
                            <>
                                <Skeleton height="2rem" className="mb-2"></Skeleton>
                                <Skeleton height="2rem" className="mb-2"></Skeleton>
                                <Skeleton height="2rem" className="mb-2"></Skeleton>
                            </>
                        }
                        {!isLoading &&
                            <DataTable globalFilter={globalFilter} header={header} ref={dt} value={users} dataKey="id" paginator rows={5} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive" emptyMessage="No products found." responsiveLayout="scroll">
                                <Column field="user" header="User" headerClassName="white-space-nowrap w-4"></Column>
                                <Column field="api" header="API" headerClassName="white-space-nowrap w-4"></Column>
                                <Column body={maxAllowedBodyTemplate} header="Max Allowed ($)" headerClassName="white-space-nowrap w-4"></Column>
                                <Column body={percBodyTemplate} header="Risk" headerClassName="white-space-nowrap w-4"></Column>
                                <Column field="secret" header="Secret" headerClassName="white-space-nowrap w-4"></Column>
                                <Column field="balance" header="Balance" body={balanceBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
                                <Column field="status" header="Status" body={statusBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
                                <Column body={actionBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
                            </DataTable>
                        }
                    </div>
                </div>

            </div>
        );
    }
};

export default Users;
