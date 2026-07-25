import {ApolloServer} from "@apollo/server";
import {UserModel} from "../models/user.model";

/**
 * SCHEMA
 * /todo add name
 */
const typeDefs = `#graphql
 type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: String!
    createdAt: String!
    updatedAt: String!
 }
 
 type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    status: String!
    posts: [Post!]!
 }
 
 input UserInput {
    email: String!
    name: String!
    password: String!
 }
 
 type Query {
    user(id: ID!): User
 }
  
 type Mutation {
    createUser(userInput: UserInput): User
 }
`

/**
 * DATA
 */

/**
 * RESOLVERS
 */
const resolvers = {
  Query: {
    user: async (parent: any, args: { id: string }) => {
      return UserModel.findById(args.id);
    },
  },
  Mutation: {
    createUser: async (parent: any, args: {
      userInput: {
        email: string,
        password: string,
        name: string
      }
    }) => {
      const email = args.userInput.email;
      const name = args.userInput.name;
      const password = args.userInput.password;
      const existingUser = await UserModel.findOne({email: email})
      if (existingUser) {
        throw new Error(`User already exists with email: ${email}`);
      }
      // Hash password
      const user = new UserModel({
        email: email,
        name: name,
        password: password,
      })
      const createdUser = await user.save();
      return {
        ...createdUser._doc,
        _id: createdUser._id.toString(),
      }
    },
  }
}

export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
})
