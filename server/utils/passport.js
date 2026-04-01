const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();

        let user = await User.findOne({ email });

        if (!user) return done(null, false);

        // 🔥 THIS IS THE MOST IMPORTANT PART
        if (refreshToken) {
          user.googleRefreshToken = refreshToken;
        }

        user.googleAccessToken = accessToken;
        await user.save();

        return done(null, user);
      } catch (e) {
        return done(e, null);
      }
    }
  )
);

module.exports = passport;
