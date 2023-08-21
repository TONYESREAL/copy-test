import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

export default async (req, res) => {
    const session = await getServerSession(req, res, authOptions)

    if (session) {
        try {
            res.json(session.user.email, 200);

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