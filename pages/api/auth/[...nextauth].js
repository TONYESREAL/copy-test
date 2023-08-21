import NextAuth from "next-auth"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongodb"
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcrypt'
import connectDB from "../../../lib/connectDB";
import Users from '../../../models/userModel'
connectDB();

export const authOptions = {
  // Configure one or more authentication providers
  adapter: MongoDBAdapter(clientPromise),
  session: {
    jwt: true,
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      name: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const email = credentials.email;
        const password = credentials.password;
        const user = await Users.findOne({ email })
        //const client = await clientPromise;
        //const db = client.db("tsx");
        //const user = await db.collection("users").findOne({ email: email })
        if (!user) {
          throw new Error("You haven't registered yet")
        }
        if (user) {
          return signInUser({ password, user })
        }
      }
    })
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/login"
  },
  database: process.env.MONGODB_URI,
  callbacks: {
    async redirect() {
      return 'https://jona.vercel.app/login'
    },
    async signIn({ user }) {
      console.log('USER: ', user)
      const client = await clientPromise;
      const db = client.db("jona");
      const findUser = await db.collection("users").findOne({ email: user.email })
      let exist = false
      try {
        console.log(findUser.customer_id)
        exist = true
      } catch {
        exist = false
      }
      console.log('Exist ', exist)
      if (exist) {
        console.log('FOUND')
      } else {
        console.log('CREATE USER')
        const proxies = await db.collection("proxies").findOne()
        await db.collection("users").insertOne({
          email: user.email,
          fees: '30',
          user: user.email,
          name: user.name,
          id: user.id,
          assigned_proxy: proxies.address,
          assigned_proxy_port: proxies.port,
          assigned_proxy_username: proxies.username,
          assigned_proxy_password: proxies.password,
          plan: 'Free',
          expiration: '',
          balance: 0,
          risk: 0,
          pass: '',
          following: {}
        })
      }
      console.log(user)
      return true
    }
  }
}

const signInUser = async ({ password, user }) => {
  if (!user.password) {
    throw new Error("Please enter password")
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error("Password or username not correct")
  }
  return user
}

export default NextAuth(authOptions)