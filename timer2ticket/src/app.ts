import express from 'express';
import { ConfigSyncJob } from './jobs/config_sync_job';
import { TimeEntriesSyncJob } from './jobs/time_entries_sync_job';
import { Constants } from './shared/constants';
import { databaseService } from './shared/database_service';

const app = express();

app.get('/', async (req, res) => {
  res.send('OK.');
});

app.listen(Constants.appPort, async () => {
  await databaseService.init();

  const user = await databaseService.getUser('vitstefan.dev@gmail.com');
  // console.log(user);
  if (!user) return;

  // const configSyncJob = new ConfigSyncJob();
  // const isConfigJobDone = await configSyncJob.doTheJob(user);

  // if (isConfigJobDone) {
  //   console.log('Config job done.');
  // } else {
  //   console.log('Config job not done.');
  // }

  const timeEntriesSyncJob = new TimeEntriesSyncJob();
  const isTimeEntrisJobDone = await timeEntriesSyncJob.doTheJob(user);

  if (isTimeEntrisJobDone) {
    console.log('Time entries job done.');
  } else {
    console.log('Time entries job not done.');
  }

  return console.log(`Server is listening on ${Constants.appPort}`);
});