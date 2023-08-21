import clientPromise from "../../../lib/mongodb";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export default async (req, res) => {
    const session = await getServerSession(req, res, authOptions)
    
    let request = JSON.parse(req['body'])

    if (session) {
        try {
            const client = await clientPromise;
            const db = client.db("jona");

            const open_trades = await db
                .collection("trades")
                .find({'user': request['user'], 'status': 'Open'})
                .toArray();

            console.log('OPEN TRADES: ', open_trades)
            res.json(open_trades);
        } catch (e) {
            console.error(e);
        }
    } else {
        res.send({
            error: "You must be signed"
        })
    }

};