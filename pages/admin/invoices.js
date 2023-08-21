import React, { useContext, useEffect, useRef, useState } from 'react';
import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Skeleton } from 'primereact/skeleton';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router'
import NextLink from 'next/link';

const Invoices = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const dt = useRef(null);
    const router = useRouter()

    const { data: session, status } = useSession()

    const [isLoading, setLoading] = useState(false)
    const [invoices, setInvoices] = useState([])

    const getInvoices = async () => {
        setLoading(true)
        let params = {
            year: ''
        };
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        };
        fetch('/api/admin/invoices', options)
            .then((res) => res.json())
            .then((data) => {
                setInvoices(data)
                setLoading(false)
            })
    }

    const sendInvoices = async () => {
        let params = {
          data: ''
        };
        let options = {
          method: 'POST',
          body: JSON.stringify(params)
        };
        fetch(`${process.env.NEXT_PUBLIC_FLASK_API}/sync_invoices`, options)
          .then((res) => res.json())
          .then((data) => {
            getInvoices()
          })
      }


    useEffect(() => {
        getInvoices();
    }, [layoutConfig]);


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2 sm:ml-auto">
                {rowData.status == 'Paid' &&
                    <NextLink href={{
                        pathname: `/client/invoice?id=[id]`,
                        query: {
                            id: rowData.id, // should be `title` not `id`
                        },
                    }}
                        as={`/client/invoice?id=${rowData.id}`}
                    >
                        <Button type="button" tooltip="View" tooltipOptions={{ position: 'bottom' }} size="sm" icon="pi pi-eye" className="p-button-rounded"></Button>
                    </NextLink>
                }
            </div>
        )
    }

    const statusBodyTemplate = (rowData) => {
        return <>{rowData.status == 'Paid' ? <Tag value="Paid" severity="success"></Tag> : <Tag value="Pending" severity="warning"></Tag>}</>;
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const toPayBodyTemplate = (rowData) => {
        return (
            <>
                {formatCurrency(rowData.to_pay / 100)}
            </>
        );
    };

    const expiryBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.day}-{rowData.month}-{rowData.year}
            </>
        );
    };

    const [globalFilter, setGlobalFilter] = useState('');

    const getHeader = () => {
        return (
            <div className="flex justify-content-end">
                <div className="p-input-icon-left">
                    <i className="pi pi-search"></i>
                    <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search invoices" />
                    <Button label="Send invoices" className="ml-2" onClick={() => sendInvoices()} />
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

                <div className="col-12 lg:col-12">
                    <div className="card">
                        <div className="text-900 text-xl font-semibold mb-3">Invoices</div>
                        {isLoading &&
                            <>
                                <Skeleton height="2rem" className="mb-2"></Skeleton>
                                <Skeleton height="2rem" className="mb-2"></Skeleton>
                                <Skeleton height="2rem" className="mb-2"></Skeleton>
                            </>
                        }
                        {!isLoading &&
                            <DataTable globalFilter={globalFilter} header={header} ref={dt} value={invoices} dataKey="id" paginator rows={5} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive" emptyMessage="No invoices found." responsiveLayout="scroll">
                                <Column field="user" header="User" headerClassName="white-space-nowrap w-4"></Column>
                                <Column field="to_pay" header="To Pay" body={toPayBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
                                <Column field="expiry" header="Expiry" body={expiryBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
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

export default Invoices;
