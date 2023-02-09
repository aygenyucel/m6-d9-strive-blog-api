import express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import cors from "cors";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import filesRouter from "./api/files/index.js";
import mongoose from "mongoose";
import meRouter from "./api/me/index.js";
import passport from "passport";
import googleStrategy from "./api/lib/auth/googleStrategy.js";

const server = express();
const port = process.env.PORT || 3001;

passport.use("google", googleStrategy);

// ************************* MIDDLEWARES ****************************

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(
  cors({
    origin: (origin, corsNext) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(
            400,
            `Cors Error! Your origin ${origin} is not in the list!`
          )
        );
      }
    },
  })
);

server.use(express.json());

server.use(passport.initialize());

// ************************** ENDPOINTS *****************************
server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);
server.use("/files", filesRouter);
server.use("/me", meRouter);

// ************************** ERROR HANDLERS ************************
server.use(notFoundHandler);
server.use(badRequestHandler);
server.use(genericErrorHandler);

// **************************************************

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log("Server is running on port:", port);
  });
});
