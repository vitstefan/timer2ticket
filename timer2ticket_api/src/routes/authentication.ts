import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import { databaseService } from '../shared/database_service';
import jwt from 'jsonwebtoken';
import { UserAuthentication } from '../models/user_authentication';
import { UserToClient } from '../models/user_to_client';
import { AuthConfig } from '../config/auth.config';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * Authenticate user + send him JWT
 * In req.body, there should be object { username, password }.
 */
router.post('/', async (req, res) => {
  // TODO validate input data

  const user = new UserAuthentication(
    req.body['username'],
    req.body['password'],
  );

  const userFromDB = await databaseService.getUserByUsername(user.username);

  if (!userFromDB) {
    return res.sendStatus(404);
  }

  try {
    // Compare password
    const isValid = await bcrypt.compare(user.password, userFromDB.passwordHash);

    if (!isValid) {
      return res.sendStatus(401);
    }

    const token = jwt.sign(
      {
        id: userFromDB._id,
      },
      AuthConfig.secret,
      {
        expiresIn: 21600, // 6 hours
      });

    res.send(new UserToClient(userFromDB, token));
  } catch (error) {
    console.log(error);
    res.sendStatus(503);
  }
});

module.exports = router;