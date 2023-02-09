import GoogleStrategy from "passport-google-oauth20";
import AuthorsModel from "../../authors/model.js";
import { createAccessToken } from "../jwt-tools.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BE_URL}/authors/auth/google/callback`,
  },
  //verify callback:
  async (accessToken, refreshToken, profile, cb) => {
    console.log("Profile", profile);

    const { given_name, family_name, email, sub } = profile._json;

    const author = await AuthorsModel.findOne({ email });

    if (author) {
      const accessToken = await createAccessToken({
        _id: author._id,
        role: author.role,
      });

      cb(null, { accessToken });
      //cb(err, user); as default. so we are sending user object to next (which is /auth/google/callback)
      //null means we have not error
    } else {
      const newAuthor = new AuthorsModel({
        firstName: given_name,
        lastName: family_name,
        email,
        googleId: sub,
      });
      const createdAuthor = await newAuthor.save();

      const accessToken = await createAccessToken({
        _id: createdAuthor._id,
        role: createdAuthor.role,
      });
      cb(null, { accessToken }); //it works like (next) we send the informations to callback endpoint which is /auth/google/callback
    }
  }
);
export default googleStrategy;
