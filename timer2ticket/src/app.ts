import express from 'express';
import { Queue } from 'typescript-collections';
import cron from 'node-cron';
import bodyParser from 'body-parser';
import { ConfigSyncJob } from './jobs/config_sync_job';
import { SyncJob } from './jobs/sync_job';
import { TimeEntriesSyncJob } from './jobs/time_entries_sync_job';
import { Constants } from './shared/constants';
import { databaseService } from './shared/database_service';
import { User } from './models/user';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// queue for ConfigSyncJobs (CSJs) or TimeEntriesSyncJobs (TESJs)
const jobQueue = new Queue<SyncJob>();

// maps containing tasks to stop them if needed
// currently using when request comes from the client app (see below)
const activeUsersScheduledConfigSyncTasks = new Map<string, cron.ScheduledTask>();
const activeUsersScheduledTimeEntriesSyncTasks = new Map<string, cron.ScheduledTask>();

// every second check if jobQueue is not empty
cron.schedule('0-59 * * * * *', () => {
  while (!jobQueue.isEmpty()) {
    const job = jobQueue.dequeue();

    if (job) {
      console.log(' -> Do the job');
      job.doTheJob().then(res => {
        if (!res) {
          // not successful, try to add again to the queue
          console.log(' -> Added job again');
          jobQueue.enqueue(job);
        }
      });
    }
  }
});

app.get('/', async (req, res) => {
  res.send('OK.');
});

app.post('/api/config', async (req, res) => {
  const username = req.body['username'];
  // config probably changed 
  // => stop all scheduled cron tasks 
  // => get updated user from DB 
  // => start jobs again

  const configTask = activeUsersScheduledConfigSyncTasks.get(username);
  if (configTask) {
    configTask.destroy();
  }

  const timeEntriesTask = activeUsersScheduledTimeEntriesSyncTasks.get(username);
  if (timeEntriesTask) {
    timeEntriesTask.destroy();
  }

  const user = await databaseService.getUser(username);
  if (user) {
    // schedule CSJ right now
    jobQueue.enqueue(new ConfigSyncJob(user));
    // and schedule next CSJs and TESJs by the user's normal schedule
    scheduleJobs(user);
  }

  return res.send('User\'s jobs restarted successfully.');
});

app.listen(Constants.appPort, async () => {
  await databaseService.init();

  const activeUsers = await databaseService.getActiveUsers();

  activeUsers.forEach(user => {
    scheduleJobs(user);
  });

  return console.log(`Server is listening on ${Constants.appPort}`);
});

function scheduleJobs(user: User) {
  if (cron.validate(user.configSyncJobDefinition.schedule)) {
    const task = cron.schedule(user.configSyncJobDefinition.schedule, () => {
      console.log(' -> Added ConfigSyncJob');
      jobQueue.enqueue(new ConfigSyncJob(user));
    });
    activeUsersScheduledConfigSyncTasks.set(user.username, task);
  }

  if (cron.validate(user.timeEntrySyncJobDefinition.schedule)) {
    const task = cron.schedule(user.timeEntrySyncJobDefinition.schedule, () => {
      console.log(' -> Added TESyncJob');
      jobQueue.enqueue(new TimeEntriesSyncJob(user));
    });
    activeUsersScheduledTimeEntriesSyncTasks.set(user.username, task);
  }
}