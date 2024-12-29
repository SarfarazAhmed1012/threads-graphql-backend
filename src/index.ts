import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import createApolloGraphqlServer from "./graphql";
import UserService from "./services/user";

async function init() {
  const app = express();
  const PORT = process.env.PORT || 8000;

  app.use(express.json());

  app.get("/", (req, res) => {
    // console.log("server is running");
    res.json({ message: "hello" });
  });

  const gqlServer = await createApolloGraphqlServer();
  app.use(
    "/graphql",
    expressMiddleware(gqlServer, {
      context: async ({ req }) => {
        // @ts-ignore
        const token = req.headers["authorization"];
        console.log({ token });
        if (!token) {
          return {};
        }
        try {
          const user = UserService.decodedToken(token);
          console.log({ user });
          return { user };
        } catch (e) {
          console.log(e);
          return {};
        }
      },
    })
  );

  app.listen(PORT, () => {
    console.log("server is running on port", PORT);
  });
}

init();
