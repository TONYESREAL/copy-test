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
            
            let settings = {
                'perc': request['perc'],
                'lev': request['lev'],
                'risk': request['risk']
            }
            await db
                .collection("settings")
                .updateOne({id: 'notrading'}, {$set: settings})
                
            res.json(settings);

        } catch (e) {
            console.error(e);
        }
    } else {
        res.send({
            error: "You must be signed"
        })
    }

};