import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { AuthConfig } from '../config/auth.config';
import superagent from 'superagent';

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
 * Gets TE activities from Redmine to show the user (on client) which activity would be default (user decides)
 * Also requests user detail (via provided redmine api key) to extract Redmine userId and send to user with activities as well (needed for sync Redmine requests, but can be hidden from the user)
 */
router.get('/redmine_time_entry_activities', async (req, res) => {
  console.log('3');
  // those 2 are filled by user in the client form
  const redmineApiKey: string | undefined = req.query['api_key']?.toString();
  let redmineApiPoint: string | undefined = req.query['api_point']?.toString();
  // should validate too...

  if (!redmineApiKey || !redmineApiPoint) {
    return res.sendStatus(400);
  }

  // add last / if not provided by user
  redmineApiPoint = redmineApiPoint.endsWith('/') ? redmineApiPoint : `${redmineApiPoint}/`;
  // add https:// if not provided by user
  redmineApiPoint = (redmineApiPoint.startsWith('https://') || redmineApiPoint.startsWith('http://')) ? redmineApiPoint : `https://${redmineApiPoint}`;

  const responseTimeEntryActivities = await superagent
    .get(`${redmineApiPoint}enumerations/time_entry_activities.json`)
    .accept('application/json')
    .type('application/json')
    .set('X-Redmine-API-Key', redmineApiKey)
    .on('error', (err) => {
      // on error, response with status from Redmine
      let statusCode = 503;
      if (err && err.status) {
        statusCode = err.status
      }

      return res.sendStatus(statusCode);
    });

  // need to grab userId (determined by api key provided)
  // https://projects.jagu.cz/users/current.json {user: {id: 144}}

  const responseUserDetail = await superagent
    .get(`${redmineApiPoint}users/current.json`)
    .accept('application/json')
    .type('application/json')
    .set('X-Redmine-API-Key', redmineApiKey)
    .on('error', (err) => {
      // on error, response with status from Redmine
      let statusCode = 503;
      if (err && err.status) {
        statusCode = err.status
      }

      return res.sendStatus(statusCode);
    });

  try {
    // extract TE activities
    const timeEntryActivities: Record<string, unknown>[] = [];
    responseTimeEntryActivities.body['time_entry_activities'].forEach((timeEntryActivity: never) => {
      timeEntryActivities.push(
        {
          id: timeEntryActivity['id'],
          name: timeEntryActivity['name'],
        }
      );
    });

    // extract userId
    const userId = responseUserDetail.body['user']['id'];

    return res.send({
      user_id: userId,
      time_entry_activities: timeEntryActivities,
    });
  } catch (ex) {
    return res.sendStatus(503);
  }
});

/**
 * Gets Toggl Track workspaces to client
 */
router.get('/toggl_track_workspaces', async (req, res) => {
  const togglTrackApiKey: string | undefined = req.query['api_key']?.toString();

  if (!togglTrackApiKey) {
    return res.sendStatus(400);
  }

  const response = await superagent
    .get('https://api.track.toggl.com/api/v8/me')
    .auth(togglTrackApiKey, 'api_token')
    .on('error', (err) => {
      // on error, response with status from Redmine
      let statusCode = 503;
      if (err && err.status) {
        statusCode = err.status
      }

      return res.sendStatus(statusCode);
    });

  try {
    // extract workspaces
    const workspaces: Record<string, unknown>[] = [];
    response.body['data']['workspaces'].forEach((workspace: never) => {
      workspaces.push(
        {
          id: workspace['id'],
          name: workspace['name'],
        }
      );
    });

    return res.send(workspaces);
  } catch (ex) {
    return res.sendStatus(503);
  }
});

module.exports = router;