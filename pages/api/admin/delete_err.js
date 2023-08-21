import clientPromise from "../../../lib/mongodb";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export default async (req, res) => {
    const session = await getServerSession(req, res, authOptions)

    let request = JSON.parse(req['body'])

    console.log('REQ: ', request['id'])
    
    if (session) {
        try {
            const client = await clientPromise;
            const db = client.db("jona");
            
            if (request['action'] == 'single') {
                await db
                    .collection("errors")
                    .deleteOne({id: request['id']})
            }

            if (request['action'] == 'all') {
                await db
                    .collection("errors")
                    .deleteMany()
            }
            
            
            res.send({data: 'Ok'})

        } catch (e) {
            console.error(e);
        }
    } else {
        res.send({
            error: "You must be signed"
        })
    }

};