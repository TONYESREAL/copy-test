import clientPromise from "../../lib/mongodb";
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

export default async (req, res) => {
    const session = await getServerSession(req, res, authOptions)

    if (session) {
        console.log(session.user.email)
        try {
            const client = await clientPromise;
            const db = client.db("jona");

            let user = ''
            if (req['user'] != null) {
                user = await db
                    .collection("users")
                    .find({ user: req['user'] })
                    .toArray();
            } else {
                user = await db
                    .collection("users")
                    .find({ user: session.user.email })
                    .toArray();
            }

            res.json(user)

        } catch (e) {
            console.error(e);
        }
    } else {
        res.send({
            error: "You must be signed"
        })
    }

};