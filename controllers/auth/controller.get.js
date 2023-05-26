const { User } = require('../../models');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function generateEmailToken() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const EMAIL_TOKEN_EXPIRATION_MINUTES = 100000;

module.exports = {
  emailToken: async (req, res, next) => {
    const { email } = req.params;
    console.log('creating email token');
    try {
      const userData = await prisma.user.findUnique({
        where: { email },
      });

      if (!userData) {
        const error = new Error('No user found with that email');
        error.status = 500;
        throw error;
      }

      const emailToken = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      // const emailToken = generateEmailToken();
      // const now = new Date();
      // const tokenExpiration = new Date(
      //   now.getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES
      // );

      console.log(emailToken);
      // const createdToken = await prisma.token.create({
      //   data: {
      //     emailToken,
      //     type: 'EMAIL',
      //     expirationDate: tokenExpiration,
      //     userId: userData.id,
      //     expiration: 10,
      //   },
      // });

      // console.log(createdToken);

      res.status(200).json({
        userData,
        token: emailToken,
      });
    } catch (err) {
      next(err);
    }
  },

  sessionToken: async (req, res, next) => {
    const { emailToken, email } = req.params;
    // console.log(emailToken);
    try {
      console.log('checking email token');
      const userData = await prisma.user.findUnique({
        where: { email },
      });

      if (!userData) {
        const error = new Error('No user found with that email');
        error.status = 500;
        throw error;
      }

      console.log(userData);
      try {
        const isValidToken = jwt.verify(emailToken, process.env.JWT_SECRET);
        if (isValidToken.email !== email) {
          const error = new Error('Invalid JWT: info does not match');
          error.status = 500;
          throw error;
        }
      } catch (e) {
        const error = new Error('Invalid JWT');
        error.status = 500;
        throw error;
      }

      // const allTokens = await prisma.token.findMany({});
      // console.log(allTokens);
      // const storedToken = await prisma.token.findUnique({
      //   where: { id: 1 },
      // });

      // const storedToken = allTokens.filter(
      //   (token) => token.emailToken === emailToken
      // );
      // console.log('storedToken', storedToken);
      // if (!storedToken) {
      //   const error = new Error('No matching token found');
      //   error.status = 500;
      //   throw error;
      // }

      const authToken = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: '100h',
      });

      console.log('authToken', authToken);

      // await prisma.token.delete({
      //   where: { emailToken },
      // });

      res.status(200).json({
        userData,
        authToken,
      });
    } catch (err) {
      next(err);
    }
  },
};
