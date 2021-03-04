import express from 'express';
import bodyParser from 'body-parser';
import { databaseService } from '../shared/database_service';
import jwt from 'jsonwebtoken';
import { AuthConfig } from '../config/auth.config';
import superagent from 'superagent';
import { Constants } from '../shared/constants';

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

router.post('/start/:userId([a-zA-Z0-9]{24})', async (req, res) => {
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

  const response = await superagent
    .post(`${Constants.t2tCoreApiUrl}start/${user._id}`)
    .send({})
    .on('error', (err) => {
      let statusCode = 503;
      if (err && err.status) {
        statusCode = err.status
      }

      res.status(statusCode).send({ started: false });
    });

  if (response.ok) {
    // + change status => 'active'
    user.status = 'active';
    databaseService.updateUser(user);
    res.send({ started: true });
  } else {
    res.send({ started: false });
  }
});

router.post('/stop/:userId([a-zA-Z0-9]{24})', async (req, res) => {
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

  try {
    const response = await superagent
      .post(`${Constants.t2tCoreApiUrl}stop/${user._id}`)
      .send({})
      .on('error', (err) => {
        let statusCode = 503;
        if (err && err.status) {
          statusCode = err.status
        }

        res.status(statusCode).send({ stopped: false });
      });

    if (response.ok) {
      // + change status => 'inactive'
      user.status = 'inactive';
      databaseService.updateUser(user);
      res.send({ stopped: true });
    } else {
      res.send({ stopped: false });
    }
  } catch (ex) {
    // already handled in .on callback above
  }
});

router.post('/scheduled/:userId([a-zA-Z0-9]{24})', async (req, res) => {
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

  try {
    const response = await superagent
      .post(`${Constants.t2tCoreApiUrl}scheduled/${user._id}`)
      .send({})
      .on('error', (err) => {
        let statusCode = 503;
        if (err && err.status) {
          statusCode = err.status
        }

        res.status(statusCode).send({ scheduled: false });
      });


    if (response.ok && response.body.scheduled === true) {
      res.send({ scheduled: true });
    } else if (response.ok && response.body.scheduled === false) {
      res.send({ scheduled: false });
    } else {
      // something went wrong
      res.sendStatus(503);
    }
  } catch (ex) {
    // already handled in .on callback above
  }
});

module.exports = router;