import clientPromise from "../../../lib/mongodb";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export default async (req, res) => {
    const session = await getServerSession(req, res, authOptions)
    
    if (session) {
        try {
            const client = await clientPromise;
            const db = client.db("jona");

            const users = await db
                .collection("users")
                .find({})
                .toArray();

            res.json(users);

        } catch (e) {
            console.error(e);
        }
    } else {
        res.send({
            error: "You must be signed"
        })
    }

};