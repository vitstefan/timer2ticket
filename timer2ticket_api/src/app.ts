import express from 'express';
import cors from 'cors';
import { databaseService } from './shared/database_service';
import { Constants } from './shared/constants';

/* eslint-disable @typescript-eslint/no-var-requires */
const registrationRoutes = require('./routes/registration');
const authenticationRoutes = require('./routes/authentication');
const usersRoutes = require('./routes/users');
const jobsRoutes = require('./routes/jobs');
const syncedServicesConfigRoutes = require('./routes/synced_services_config');

const app = express();

// enable cors 9mazbe in the future replace with only t2t client's ip
app.use(cors());

app.use('/api/registration', registrationRoutes);
app.use('/api/authentication', authenticationRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/synced_services_config', syncedServicesConfigRoutes);

app.listen(Constants.appPort, async () => {
  await databaseService.init();

  return console.log(`Server is listening on ${Constants.appPort}`);
});