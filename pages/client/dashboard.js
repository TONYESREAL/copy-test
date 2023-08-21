import React, { useContext, useEffect, useRef, useState } from 'react';
import getConfig from 'next/config';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { Chart } from 'primereact/chart';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router'
import { subscribeToChannel } from '../../lib/pusher';
import moment from 'moment'

const ClientDash = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const dt = useRef(null);
    const router = useRouter()

    //TRADING PANEL VALUES
    const lev_types = ['CROSSED', 'ISOLATED'];
    const [lev_type, setLevOption] = useState(lev_types[0]);
    const [lev, setLev] = useState(1)
    const [size, setSize] = useState(1)
    const [tp, setTP] = useState()
    const [sl, setSL] = useState()

    const [symbol, setSymbol] = useState({ 'code': 'BTCUSDT', 'name': 'BTCUSDT' });
    const [symbols, setSymbols] = useState([])

    /*
    const symbols = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];
    */

    const { data: session, status } = useSession()

    const [isLoading, setLoading] = useState(false)
    const [algo_trades, setAlgoTrades] = useState([])
    const [positions, setPositions] = useState([])
    const [orders, setOrders] = useState([])
    const [eq_trades, setEqTrades] = useState([])
    const [eq, setEq] = useState([])
    const [profit, setProfit] = useState()
    const [win_rate, setWinRate] = useState()
    const [total, setTotal] = useState()
    const [used, setUsed] = useState()
    const [chartOptions, setChartOptions] = useState({})
    const [chartData, setChartData] = useState({})
    const [years, setYears] = useState([])

    const [currentUser, setCurrentUser] = useState('')

    const toast = useRef(null);

    const showError = (msg) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: msg, life: 3000 });
    }
    const showSuccess = (msg) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: msg, life: 3000 });
    }

    //GET SITUATION
    const getSymbols = async () => {
        await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo')
            .then((res) => res.json())
            .then((data) => {
                console.log(data['symbols'])
                let tmpSymbols = []
                data['symbols'].forEach((item, index) => {
                    tmpSymbols.push({
                        name: item['symbol'], code: item['symbol']
                    })
                })
                setSymbols(tmpSymbols)
            })
    }

    const getBinanceDetails = async (u) => {
        let params = {
            year: '2023',
            user: u
        };
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        };
        await fetch(`${process.env.NEXT_PUBLIC_FLASK_API}/get_details`, options)
            .then((res) => res.json())
            .then((data) => {
                console.log('DETAILS: ', data)
                setTotal(data['total'])
                setUsed(data['used'])
                let tmpPositions = []
                data['positions'].map((pos) => {
                    if (pos['positionAmt'] != 0) {
                        tmpPositions.push(pos)
                    }
                })
                setPositions(tmpPositions)
                setOrders(data['orders'])
                setLoading(false)
            })
    }

    const getStats = async (u) => {
        let params = {
            year: '2023',
            user: u
        };
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        };
        await fetch('/api/admin/user', options)
            .then((res) => res.json())
            .then((data) => {
                setYears(data['years'])
                setAlgoTrades(data['trades'])
                setProfit(data['profit'])
                setWinRate(data['win_rate'])
                setEqTrades(data['eq_trades'])
                setEq(data['eq'])
                initChart(data['eq'], data['eq_trades'])
            })
    }

    const updateDash = () => {
        getStats(currentUser)
        getBinanceDetails(currentUser)
    }

    //EXCHANGE
    const sendOrder = (posSide) => {
        let params = {
            action: 'open-ind',
            user: session.user.email,
            symbol: symbol['code'],
            side: posSide,
            size: size,
            tp: tp,
            sl: sl
        }
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        }
        fetch(`${process.env.NEXT_PUBLIC_FLASK_API}/signal`, options)
            .then((res) => res.json())
            .then((data) => {
                console.log('RESPONSE: ', data)
                showSuccess('Order sent')
            })
    }

    const closePos = (symbol) => {
        let params = {
            action: 'close-ind',
            user: session.user.email,
            symbol: symbol
        }
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        }
        fetch(`${process.env.NEXT_PUBLIC_FLASK_API}/signal`, options)
            .then((res) => res.json())
            .then((data) => {
                showSuccess('Position closed')
            })
    }

    const cancelOrder = (ci, id, symbol) => {
        console.log('CANCEL ORDER')
        let params = {
            ci: ci,
            order_id: id,
            symbol: symbol,
            user: session.user.email,
            action: 'cancel-ind'
        }
        console.log(params)

        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        }
        fetch(`${process.env.NEXT_PUBLIC_FLASK_API}/signal`, options)
            .then((res) => res.json())
            .then((data) => {
                console.log('RESPONSE: ', data)
                showSuccess('Order canceled')
            })

    }

    const updateLev = () => {
        if (symbol == null) {
            showError('Please select a symbol first')
        } else {
            let params = {
                action: 'update_lev-ind',
                user: session.user.email,
                lev_type: lev_type,
                lev: lev,
                symbol: symbol['code']
            }
            let options = {
                method: 'POST',
                body: JSON.stringify(params)
            }
            fetch(`${process.env.NEXT_PUBLIC_FLASK_API}/signal`, options)
                .then((res) => res.json())
                .then((data) => {
                    console.log('DATA: ', data)
                    showSuccess('Leverage updated')
                })
        }

    }

    //CHART
    const initChart = (values, labels) => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        const colors = {
            green: {
                default: "rgba(46, 204, 113, 1)",
                half: "rgba(46, 204, 113, 0.75)",
                quarter: "rgba(46, 204, 113, 0.55)",
                last: "rgba(46, 204, 113, 0.35)",
                zero: "rgba(46, 204, 113, 0.1)"
            },
            indigo: {
                default: "rgba(80, 102, 120, 1)",
                quarter: "rgba(80, 102, 120, 0.25)"
            }
        };

        const data = {
            labels: labels.reverse(),
            datasets: [
                {
                    label: 'Equity',
                    data: values.reverse(),
                    fill: true,
                    tension: 0,
                    //borderColor: documentStyle.getPropertyValue('--green-500'),
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 25, 0, 600);
                        gradient.addColorStop(0, colors.green.half);
                        gradient.addColorStop(0.35, colors.green.quarter);
                        gradient.addColorStop(0.65, colors.green.last);
                        gradient.addColorStop(1, colors.green.zero);
                        return gradient;
                    },
                }
            ]
        };

        const options = {
            animation: {
                duration: 2000
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    },
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';

                            if (label) {
                                label += ': ';
                            }

                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        display: false
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                        display: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                        display: false
                    }
                }
            }
        };

        setChartData(data);
        setChartOptions(options);
    };


    //TABLE TEMPLATES

    const sideBodyTemplate = (rowData) => {
        return <>{rowData.side == 'BUY' ? <Tag value="BUY" severity="success"></Tag> : <Tag value="SELL" severity="danger"></Tag>}</>;
    };

    const PosSideBodyTemplate = (rowData) => {
        return <>{rowData.positionAmt > 0 ? <Tag value="BUY" severity="success"></Tag> : <Tag value="SELL" severity="danger"></Tag>}</>;
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const profitBodyTemplate = (rowData) => {
        return (
            <>
                {formatCurrency(parseFloat(rowData.realizedPnl))}
            </>
        );
    };

    const feesBodyTemplate = (rowData) => {
        return (
            <>
                {formatCurrency(parseFloat(rowData.commission))}
            </>
        );
    };

    const dateBodyTemplate = (rowData) => {
        return (
            <>
                {moment(rowData.time).format('YYYY-MM-DD HH:mm:ss')}
            </>
        )
    }

    const actionPositionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2 sm:ml-auto">
                {/*<Button type="button" tooltip="TPSL" tooltipOptions={{ position: 'bottom' }} size="sm" icon="pi pi-user-edit" className="p-button-rounded" onClick={() => openTPSLModal(rowData.symbol, rowData.positionAmt)}></Button>
                <Button type="button" tooltip="Cancel" tooltipOptions={{ position: 'bottom' }} size="sm" icon="pi pi-delete-left" className="p-button-rounded" onClick={() => closePos(rowData.symbol)}></Button>*/}
            </div>
        )
    }

    const actionOrderBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2 sm:ml-auto">
                {/*<<Button type="button" tooltip="Cancel" tooltipOptions={{ position: 'bottom' }} size="sm" icon="pi pi-delete-left" className="p-button-rounded" onClick={() => cancelOrder(rowData.clientOrderId, rowData.orderId, rowData.symbol)}></Button>*/}
            </div>
        )
    }

    useEffect(() => {
        let params = {
            user: ''
        }
        let options = {
            method: 'POST',
            body: JSON.stringify(params)
        }
        fetch('/api/getcurrentuser', options)
            .then((res) => res.json())
            .then((data) => {
                setCurrentUser(data[0]['user'])
                getStats(data[0]['user'])
                getSymbols()
                getBinanceDetails(data[0]['user'])
            })
        subscribeToChannel('jona-channel', 'jona-event', (message) => {
            getBinanceDetails()
            getStats()
        });
    }, [layoutConfig]);


    if (status === "unauthenticated") {
        router.push('/login')
    }
    if (status === "authenticated") {
        return (
            <div className="grid">
                <Toast ref={toast} />

                <div className="col-12">
                    <div className="flex flex-column sm:flex-row align-items-center gap-4">
                        <div className="flex flex-column sm:flex-row align-items-center gap-3">
                            <div className="flex flex-column align-items-center sm:align-items-start">
                                <span className="text-900 font-bold text-4xl">Welcome {session.user.email}</span>
                                <Button onClick={() => updateDash()}>Update Dashboard</Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-6 xl:col-8">
                    <div class="card">
                        <Chart type="line" data={chartData} options={chartOptions}></Chart>
                    </div>
                </div>
                <div className="col-12 md:col-6 xl:col-4">
                    {!isLoading &&
                        <div className="card">
                            <div className="text-900 text-xl font-semibold mb-3">Statitics</div>
                            <ul className="list-none p-0 m-0">
                                <li className="flex align-items-center p-3 mb-3 border-bottom-1 surface-border">

                                    <div className="flex flex-column">
                                        <span className="text-xl font-medium text-900 mb-1">Net profit</span>
                                    </div>
                                    <span className="text-xl text-900 ml-auto font-semibold">{formatCurrency(parseFloat(profit))}</span>
                                </li>
                                <li className="flex align-items-center p-3 mb-3 border-bottom-1 surface-border">

                                    <div className="flex flex-column">
                                        <span className="text-xl font-medium text-900 mb-1">Win Rate</span>
                                    </div>
                                    <span className="text-xl text-900 ml-auto font-semibold">{win_rate}%</span>
                                </li>
                                <li className="flex align-items-center p-3 mb-3 border-bottom-1 surface-border">

                                    <div className="flex flex-column">
                                        <span className="text-xl font-medium text-900 mb-1">Avl. Balance</span>
                                    </div>
                                    <span className="text-xl text-900 ml-auto font-semibold">{formatCurrency(parseFloat(total))}</span>
                                </li>
                                <li className="flex align-items-center p-3 mb-3 border-bottom-1 surface-border">

                                    <div className="flex flex-column">
                                        <span className="text-xl font-medium text-900 mb-1">Used Balance</span>
                                    </div>
                                    <span className="text-xl text-900 ml-auto font-semibold">{formatCurrency(parseFloat(used))}</span>
                                </li>
                                <li className="flex align-items-center p-3 mb-3">

                                    <div className="flex flex-column">
                                        <span className="text-xl font-medium text-900 mb-1">Trades</span>
                                    </div>
                                    <span className="text-xl text-900 ml-auto font-semibold">{eq_trades.length}</span>
                                </li>
                            </ul>
                        </div>
                    }
                </div>
                {/*
                <div className="col-12 md:col-6 xl:col-4">
                    <div className="card">
                        <div class="grid">
                            <div class="col">
                                <SelectButton value={lev_type} onChange={(e) => setLevOption(e.value)} options={lev_types} size="small" />
                            </div>
                            <div class="col">
                                {lev}x
                                <Slider value={lev} onChange={(e) => setLev(e.value)} />
                            </div>
                            <div class="col">
                                <Button onClick={() => updateLev()} size="small">Update</Button>
                            </div>

                        </div>
                        <div class="grid mt-5">
                            <div class="col">
                                <Dropdown value={symbol} onChange={(e) => setSymbol(e.value)} options={symbols} optionLabel="name"
                                    placeholder="Select symbol" className="w-full" />
                            </div>
                        </div>
                        <div class="grid mt-5">
                            <div class="col">
                                {(total * (size / 100)).toFixed(2)} USDT ({size}%)
                                <Slider value={size} onChange={(e) => setSize(e.value)} />
                            </div>
                        </div>
                        <div class="grid mt-5">
                            <div class="col">
                                <p>Take Profit</p>
                            </div>
                            <div class="col">
                                <InputNumber value={tp} onValueChange={(e) => setTP(e.value)} suffix="%" />
                            </div>
                        </div>
                        <div class="grid">
                            <div class="col">
                                <p>Stop Loss</p>
                            </div>
                            <div class="col">
                                <InputNumber value={sl} onValueChange={(e) => setSL(e.value)} suffix="%" />
                            </div>
                        </div>
                        <div class="grid mt-5">
                            <div class="col">
                                <Button label="Buy/Long" severity="success" className="button-full" onClick={() => sendOrder('buy')} />
                            </div>
                            <div class="col">
                                <Button label="Sell/Short" severity="danger" className="button-full" onClick={() => sendOrder('sell')} />
                            </div>
                        </div>
                        <p>
                            &#123;'user': '{session.user.email}', 'action': 'open', 'symbol': '{symbol['code']}', 'side': 'buy', 'order_type': 'market', 'price': '', 'lev': '{lev}', 'lev_type': '{lev_type}', 'size': '{size}', 'tp': '{tp}', 'sl': '{sl}', 'ci': '', 'group_id': '' &#125;
                        </p>
                        <p>
                            Your webhook URL: <strong>https://flask-backend-btwjy6tira-uc.a.run.app/signal</strong>
                        </p>
                    </div>
                </div>
                */}

                <div className="col-12 md:col-6 xl:col-12">
                    <TabView>
                        <TabPanel header="Positions">
                            <div className="col-12 md:col-6 xl:col-12">
                                <DataTable ref={dt} value={positions} dataKey="id" paginator rows={5} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive" emptyMessage="No orders found." responsiveLayout="scroll">
                                    <Column field="symbol" header="Symbol" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="positionAmt" header="Size" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="entryPrice" header="Entry price" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="leverage" header="Leverage" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="marginType" header="Margin type" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="positionAmt" header="Side" body={PosSideBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="unRealizedProfit" header="Profit" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column body={actionPositionBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>

                                </DataTable>
                            </div>
                        </TabPanel>
                        <TabPanel header="Orders">
                            <div className="col-12 md:col-6 xl:col-12">
                                <DataTable ref={dt} value={orders} dataKey="id" paginator rows={5} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive" emptyMessage="No orders found." responsiveLayout="scroll">
                                    <Column field="symbol" header="Symbol" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="origType" header="Type" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="side" header="Side" body={sideBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="stopPrice" header="Stop Price" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column body={actionOrderBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>

                                </DataTable>
                            </div>
                        </TabPanel>
                        <TabPanel header="History">
                            <div className="col-12 md:col-6 xl:col-12">
                                <DataTable ref={dt} value={algo_trades} dataKey="id" paginator rows={5} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive" emptyMessage="No orders found." responsiveLayout="scroll">
                                    <Column field="symbol" header="Symbol" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="side" header="Side" body={sideBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="qty" header="Size" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="price" header="Price" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column header="Time" body={dateBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="commission" body={feesBodyTemplate} header="Fees" headerClassName="white-space-nowrap w-4"></Column>
                                    <Column field="realizedPnl" header="Profit" body={profitBodyTemplate} headerClassName="white-space-nowrap w-4"></Column>
                                </DataTable>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        );
    }
};

export default ClientDash;
