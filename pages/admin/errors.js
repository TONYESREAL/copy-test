import React, { useContext, useEffect, useRef, useState } from 'react';
import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
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

const Errors = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const dt = useRef(null);
    const router = useRouter()

    const { data: session, status } = useSession()

    const [isLoading, setLoading] = useState(false)
    const [progressLoading, setProgressLoading] = useState(false)
    const [errors, setErrors] = useState([])
    const [visible, setVisible] = useState(false);


    const deleteError = async (action, id) => {
        let params = {
            action: action,
            id: id
        }
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        }
        await fetch('/api/admin/delete_err', options)
            .then((res) => res.json())
            .then((data) => {
                getErrors()
            })
    }

    const getErrors = async () => {
        setLoading(true)
        let params = {
            year: ''
        };
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        };
        fetch('/api/admin/errors', options)
            .then((res) => res.json())
            .then((data) => {
                setErrors(data)
                setLoading(false)
            })
    }

    useEffect(() => {
        getErrors();
    }, [layoutConfig]);


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2 sm:ml-auto">
                <Button type="button" tooltip="Delete" tooltipOptions={{ position: 'bottom' }} size="sm" icon="pi pi-trash" className="p-button-rounded p-button-outlined" onClick={() => deleteError('single', rowData.id)}></Button>
            </div>
        )
    }

    const [globalFilter, setGlobalFilter] = useState('');

    const getHeader = () => {
        return (
            <div className="flex justify-content-end">
                <div className="p-input-icon-left">
                    <i className="pi pi-search"></i>
                    <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search errors" />   
                    Delete all <Button type="button" tooltip="Delete all" tooltipOptions={{ position: 'bottom' }} size="sm" icon="pi pi-trash" className="p-button-rounded p-button-outlined" onClick={() => deleteError('all', '')}></Button>
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
                <Dialog header="Details" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
                    <div className="grid">
                        <div className="col-12 md:col-12">
                            <div className="card p-fluid">

                            </div>
                        </div>
                    </div>
                </Dialog>
                <div className="col-12">
                    <div className="flex flex-column sm:flex-row align-items-center gap-4">
                        <div className="flex flex-column sm:flex-row align-items-center gap-3">
                            <div className="flex flex-column align-items-center sm:align-items-start">
                                <span className="text-900 font-bold text-4xl">Errors</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 lg:col-12">
                    <div className="card">
                        <div className="text-900 text-xl font-semibold mb-3">Errors</div>
                        {isLoading &&
                            <>
                                <Skeleton height="2rem" className="mb-2"></Skeleton>
                                <Skeleton height="2rem" className="mb-2"></Skeleton>
                                <Skeleton height="2rem" className="mb-2"></Skeleton>
                            </>
                        }
                        {!isLoading &&
                            <DataTable globalFilter={globalFilter} header={header} ref={dt} value={errors} dataKey="id" paginator rows={5} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive" emptyMessage="No errors found." responsiveLayout="scroll">
                                <Column field="user" header="User" headerClassName="white-space-nowrap w-4"></Column>
                                <Column field="exchange" header="Exchange" headerClassName="white-space-nowrap w-4"></Column>
                                <Column field="msg" header="Message" headerClassName="white-space-nowrap w-4"></Column>
                                <Column field="type" header="Type" headerClassName="white-space-nowrap w-4"></Column>
                                <Column body={actionBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
                            </DataTable>
                        }
                    </div>
                </div>

            </div>
        );
    }
};

export default Errors;
