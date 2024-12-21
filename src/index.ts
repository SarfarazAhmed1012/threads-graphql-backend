import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

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
    }`,
    resolvers: {
      Query: {
        hello: () => {
          return "hello, world";
        },
        say: (_, { name }: { name: string }) => `Hey ${name}, how are you?`,
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
