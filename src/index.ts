import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { prismaClient } from "./lib/db";

async function init() {
  const app = express();
  const PORT = process.env.PORT || 8000;

  app.use(express.json());

  // graphql server
  const gqlServer = new ApolloServer({
    typeDefs: `
    type Query{
        hello: String
        say(name: String): String
    }
    type Mutation{
        createUser(firstName: String!, lastName: String!, email: String!, password: String!): Boolean
      }
        `,
    resolvers: {
      Query: {
        hello: () => {
          return "hello, world";
        },
        say: (_, { name }: { name: string }) => `Hey ${name}, how are you?`,
      },
      Mutation: {
        createUser: async (
          _,
          {
            firstName,
            lastName,
            email,
            password,
          }: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          await prismaClient.user.create({
            data: {
              firstName,
              lastName,
              email,
              password,
              salt: "some_random_salt",
            },
          });

          return true;
        },
      },
    },
  });

  await gqlServer.start();

  app.get("/", (req, res) => {
    // console.log("server is running");
    res.json({ message: "hello" });
  });

  app.use("/graphql", expressMiddleware(gqlServer));

  app.listen(PORT, () => {
    console.log("server is running on port", PORT);
  });
}

init();
