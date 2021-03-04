import express from 'express';
import bodyParser from 'body-parser';
import { databaseService } from '../shared/database_service';
import jwt from 'jsonwebtoken';
import { UserToClient } from '../models/user_to_client';
import { AuthConfig } from '../config/auth.config';
import { UserFromClient } from '../models/user_from_client';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log(`Time: ${Date.now()}`);

  // verify JWT

  const tokenFromHeader = req.headers["x-access-token"];

  if (!tokenFromHeader) {
    return res.sendStatus(403);
  }

  const token = Array.isArray(tokenFromHeader) ? tokenFromHeader[0] : tokenFromHeader;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jwt.verify(token, AuthConfig.secret, (err: any, decoded: any) => {
    if (err) {
      return res.sendStatus(401);
    }
    res.locals.userIdFromToken = decoded.id;
    res.locals.token = token;
    next();
  });
});

/**
 * Get user with userId in parameter - needs to be 24 length string (MongoDB ObjectId)
 */
router.get('/:userId([a-zA-Z0-9]{24})', async (req, res) => {
  const userId = req.params.userId;
  const token = res.locals.token;

  // authorize if userId from JWT is the same as in userId param
  if (!res.locals.userIdFromToken || !userId || !token) {
    return res.sendStatus(400);
  }

  if (res.locals.userIdFromToken !== userId) {
    return res.sendStatus(401);
  }

  const user = await databaseService.getUserById(userId);

  if (!user) {
    return res.sendStatus(404);
  }

  // no content 204, conflict 409, bad request 400, not found 404, unauthorized 401, forbidden 403
  res.send(new UserToClient(user, token));
});

/**
 * Updates user taken from body.user
 */
router.put('/:userId([a-zA-Z0-9]{24})', async (req, res) => {
  const userId = req.params.userId;
  const token = res.locals.token;

  // TODO validate UserFromClient class
  const userFromClient: UserFromClient = req.body.user;

  console.log(userFromClient);

  // authorize if userId from JWT is the same as in userId param
  if (!res.locals.userIdFromToken || !userId || !token || !userFromClient) {
    return res.sendStatus(400);
  }

  if (res.locals.userIdFromToken !== userId) {
    return res.sendStatus(401);
  }

  const user = await databaseService.getUserById(userId);

  if (!user) {
    return res.sendStatus(404);
  }

  // only these properties can be changed this way
  // user.configSyncJobDefinition = userFromClient.configSyncJobDefinition;
  // user.timeEntrySyncJobDefinition = userFromClient.timeEntrySyncJobDefinition;
  // user.serviceDefinitions = userFromClient.serviceDefinitions;

  const updatedUser = await databaseService.updateUser(user);

  if (updatedUser) {
    res.send(new UserToClient(updatedUser, token));
  } else {
    res.sendStatus(503);
  }
});

module.exports = router;