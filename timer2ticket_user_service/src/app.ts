import express from 'express';
import bodyParser from 'body-parser';
import { User } from './models/user';
import { databaseService } from './shared/database_service';
import { Constants } from './shared/constants';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// TODO cleanUpJob - removes old projects, issues etc.
// TODO test project config

app.get('/', async (req, res) => {
  res.send('OK.');
});

app.post('/api/config', async (req, res) => {
  const username = req.body['username'];
  // config probably changed 
  // => stop all scheduled cron tasks 
  // => get updated user from DB 
  // => start jobs again

  // const configTask = activeUsersScheduledConfigSyncTasks.get(username);
  // if (configTask) {
  //   configTask.destroy();
  // }

  // const timeEntriesTask = activeUsersScheduledTimeEntriesSyncTasks.get(username);
  // if (timeEntriesTask) {
  //   timeEntriesTask.destroy();
  // }

  // const user = await databaseService.getUser(username);
  // if (user) {
  //   // schedule CSJ right now
  //   jobQueue.enqueue(new ConfigSyncJob(user));
  //   // and schedule next CSJs and TESJs by the user's normal schedule
  //   scheduleJobs(user);
  // }

  // return res.send('User\'s jobs restarted successfully.');
});

app.listen(Constants.appPort, async () => {
  await databaseService.init();

  return console.log(`Server is listening on ${Constants.appPort}`);
});