import express from 'express';
import cors from 'cors';
import { databaseService } from './shared/database_service';
import { Constants } from './shared/constants';

/* eslint-disable @typescript-eslint/no-var-requires */
const registrationRoutes = require('./routes/registration');
const authenticationRoutes = require('./routes/authentication');
const usersRoutes = require('./routes/users');
const jobsRoutes = require('./routes/jobs');

const app = express();

const corsOptions = {
  // TODO is this required? 3000 as t2t core port
  origin: `http://localhost:3000`
};

app.use(cors(corsOptions));

app.use('/api/registration', registrationRoutes);
app.use('/api/authentication', authenticationRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/jobs', jobsRoutes);

app.listen(Constants.appPort, async () => {
  await databaseService.init();

  return console.log(`Server is listening on ${Constants.appPort}`);
});