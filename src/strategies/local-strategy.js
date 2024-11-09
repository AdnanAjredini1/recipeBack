import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import { db } from "../storage/db.js";

passport.serializeUser((user, cb) => {
    console.log("User serialized", user);
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
  console.log("deserialized user", user);
  cb(null, user);
});
  
export default passport.use(
    "local",
    new Strategy(async function verify(username, password, cb) {
      console.log(username, password);
      try {
        const checkResult = await db.query(
          "SELECT * FROM users WHERE email = $1 ",
          [username]
        );
        if (checkResult.rows.length > 0) {
          const user = checkResult.rows[0];
          const storedHashedPassword = user.password;
          bcrypt.compare(
            password,
            storedHashedPassword,
            async function (err, result) {
              if (err) {
                return cb(err);
              } else {
                if (result) {
                  return cb(null, user);
                } else {
                  return cb(null, false, { message: "Incorrect password" });
                }
              }
            }
          );
        } else {
          return cb(null, false, { message: "User not found" });
        }
      } catch (err) {
        return cb(err);
      }
    })
  );
