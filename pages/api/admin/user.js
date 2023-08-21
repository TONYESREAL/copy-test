import clientPromise from "../../../lib/mongodb";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import moment from 'moment'

export default async (req, res) => {
    const session = await getServerSession(req, res, authOptions)

    if (session) {
        let request = JSON.parse(req['body'])
        console.log('YEAR: ', request['year'])
        console.log('ID: ', request['user'])
        if (request['user'] == '') {
            request['user'] = session.user.email
        }
        console.log('ID: ', request['user'])

        let months_str = null
        let months = null
        let trades_arr = []
        let returns_str = null
        let returns = null
        let eq_str = null
        let eq = null
        let eq_trades_str = null
        let eq_trades = null
        let balance = 0
        let win_rate = 0
        let test = null
        let year_selection = []
        let year = null
        let wins = 0
        let currentYear = null

        //if (session) {
        if (2 == 2) {
            try {
                const client = await clientPromise;
                const db = client.db("jona");

                const strategy = await db
                    .collection("trades")
                    .find({ 'user': request['user'] })
                    .toArray();
            
                //let data = strategy
                let trades = strategy
                //console.log('NEW DATA: ', data)
                //let keys = ['month', 'year']

                /*
                test =
                    data.reduce((acc, val) => {
                        const name = keys.reduce((finalName, key) => finalName + val[key] + '/', '').slice(0, -1)
                        if (acc[name]) {
                            acc[name].values.push(parseFloat(val.profit));
                            acc[name].sum += parseFloat(val.profit);
                        } else {
                            acc[name] = {
                                name,
                                sum: parseFloat(val.profit),
                                year: val.year,
                                values: [parseFloat(val.profit)]
                            };
                        }
                        return acc;
                    }, {})
                
                */

                /*
                for (let t in test) {
                    if (currentYear != test[t]['year']) {
                        year_selection.push({
                            'name': test[t]['year'],
                            'code': test[t]['year']
                        })
                        
                        year_selection.push(test[t]['year'])
                        currentYear = test[t]['year']
                    }
                    if (test[t]['year'] == request['year']) {
                        months_str = months_str + ',' + test[t]['name']
                        returns_str = returns_str + ',' + test[t]['sum']
                    }
                }

                year = { 'name': currentYear, 'code': currentYear }
                */

                for (let i = 0; i < trades.length; i++) {
                    //console.log('DATE: ', moment(trades[i]['close_date']*1000).format('YYYY-MM-DD HH:mm:ss').toString())
                    //if (moment(trades[i]['close_date']*1000).format('YYYY-MM-DD HH:mm:ss').toString().includes(request['year'])) {
                    if (1==1) {
                    //if (trades[i]['closeTime'].includes(request['year'])) {
                        trades_arr.push(trades[i])
                        console.log('BALANCE BEFORE: ', balance)
                        console.log('PROFIT: ', trades[i]['realizedPnl'])
                        console.log('FEES: ', trades[i]['commission'])
                        balance = balance + (parseFloat(trades[i]['realizedPnl'])-parseFloat(trades[i]['commission']))
                        console.log('BALANCE AFTER: ', balance)
                        eq_str = eq_str + ',' + balance.toString()
                        eq_trades_str = eq_trades_str + ',' + moment(trades[i]['time']).format('YYYY-MM-DD HH:mm:ss')
                        //eq_trades_str = eq_trades_str + ',' + trades[i]['closeTime']
                        if (parseFloat(trades[i]['realizedPnl'])-parseFloat(trades[i]['commission']) > 0 && parseFloat(trades[i]['realizedPnl']) != 0) {
                            wins = wins + 1
                        }
                    }
                }

                win_rate = wins * 100 / trades_arr.length

                eq_str = eq_str.slice(5)
                eq_trades_str = eq_trades_str.slice(5)
                //months_str = months_str.slice(5)
                //returns_str = returns_str.slice(5)

                //months = months_str.split(',')
                //returns = returns_str.split(',')
                //months.shift()
                //returns.shift()
                eq = eq_str.split(',')
                eq_trades = eq_trades_str.split(',')

                const get_user = await db
                    .collection("users")
                    .findOne({ 'user': request['user'] })

                let output = {
                    win_rate: win_rate.toFixed(2),
                    trades: trades_arr,
                    profit: balance.toFixed(2),
                    eq: eq.reverse(),
                    eq_trades: eq_trades.reverse(),
                    //months: months,
                    //returns: returns,
                    //years: year_selection,
                }

                //console.log('OUTPUT: ', output)
                //-47.14 + (0.47 - 0.017)
                //-46.687
                res.json(output);
            } catch (e) {
                console.error(e);
            }
        } else {
            res.send({
                error: "You must be signed"
            })
        }
    }
};