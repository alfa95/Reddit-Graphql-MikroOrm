import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from 'cors';
import {createConnection} from 'typeorm';
import { Post } from "./entities/post";
import { User } from "./entities/User";
import path from "path";

declare module "express-session" {
  interface Session {
    userId: number;
  }
}

const main = async () => {
  const conn = await createConnection(
    {
      type: 'postgres',
      database: 'redditDB',
      username:'postgres',
      password: "1234",
      logging: true,
      synchronize: true,
      entities: [Post, User],
      migrations: [path.join(__dirname,'./migrations/*')]
    }
  );
  await conn.runMigrations();
  //await Post.delete({});
  const app = express();

  let RedisStore = connectRedis(session);
  let redis = new Redis();

  app.use(
    cors(
      {
        origin: "http://localhost:3000",
        credentials: true,
      }
    )
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__,
      },
      secret: "osdajdoasodajdj",
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
