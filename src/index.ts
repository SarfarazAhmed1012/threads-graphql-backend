import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import createApolloGraphqlServer from "./graphql";

async function init() {
  const app = express();
  const PORT = process.env.PORT || 8000;

  app.use(express.json());

  app.get("/", (req, res) => {
    // console.log("server is running");
    res.json({ message: "hello" });
  });

  const gqlServer = await createApolloGraphqlServer();
  app.use("/graphql", expressMiddleware(gqlServer));

  app.listen(PORT, () => {
    console.log("server is running on port", PORT);
  });
}

init();
