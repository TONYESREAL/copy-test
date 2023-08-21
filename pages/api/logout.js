import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
    const session = await getServerSession(req, res, authOptions)
    
    if (session) {
        try {
            const client = await clientPromise;
            const db = client.db("test");

            const user = await db
                .collection("users")
                .find({'email': session.user.email})
                .toArray();
            
            console.log('USER: ', user[0])
            await db
                .collection('sessions')
                .deleteOne({'userId': user[0]['_id']})
            
            res.json('', 200);

        } catch (e) {
            console.error(e);
        }
    } else {
        res.json('public')
        /*res.send({
            error: "You must be signed"
        })
        */
    }

};