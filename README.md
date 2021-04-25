# Timer2Ticket

Timer2Ticket is an app that synchronizes time entries as well as objects like projects and issues across user's project management system (like [Redmine](https://www.redmine.org/)) and time tracking applications (like [Toggl Track](https://toggl.com/track/)).

The project is split into three separated repositories. Links to the GitHub:

* [Core](https://github.com/vitstefan/timer2ticket-core) is server-side app, that runs jobs to synchronize all needed objects. 
* [API](https://github.com/vitstefan/timer2ticket-api) serves as a bridge between Core and Client. 
* [Client](https://github.com/vitstefan/timer2ticket-client) is client-side app where user can register and configure the service.
