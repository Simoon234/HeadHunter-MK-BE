<div align="center">
  <img src="https://user-images.githubusercontent.com/83337792/184535023-957f5f76-fad5-4f3e-bdf0-8f1357648d9e.png" width="400" height="auto" />
</div>

<br />

<!-- Table of Contents -->
# :notebook_with_decorative_cover: Table of Contents

- [About the Project](#star2-about-the-project)
    * [Tech Stack](#space_invader-tech-stack)
    * [Features](#dart-features)
    * [Environment Variables](#key-environment-variables)
- [Getting Started](#toolbox-getting-started)
    * [Prerequisites](#bangbang-prerequisites)
    * [Installation](#gear-installation)
    * [Run Locally](#running-run-locally)
- [Routes](#eyes-routes)
- [FAQ](#grey_question-faq)
- [Contact](#handshake-contact)



<!-- About the Project -->
## :star2: About the Project
API for the application that allows you to easily connect people from HR departments of companies, including Headhunters [HR], with people looking for a job in IT.


<!-- TechStack -->
### :space_invader: Tech Stack

  <summary>Server</summary>
  <ul>
    <li><a href="https://www.typescriptlang.org/">Typescript</a></li>
    <li><a href="https://nestjs.com/">Nest.js</a></li>
   
  </ul>

<summary>Database</summary>
  <ul>
    <li><a href="https://www.mongodb.com/">MongoDB</a></li>
  </ul>
  
  <summary>Utils</summary>
  <ul>
    <li><a href="https://sendgrid.com/">SendGrid</a></li>
  </ul>

<!-- Features -->
### :dart: Features

<h2> General </h2>

- Pagination 

- Filtration 

- CRUD 

- JWT

- Passport

1) <h3>Admin</h3>

- Admin upload files with HR's and User's. When everything is ok, all of them are getting emails with registration. [YOU] must register, because app working only when your account is active,
- Admin can update his/her profile. 

2) <h3>User/Candidate</h3>

- Candidate account is active when he register succesfuly. 
- He/She can update profile. 
- He/She can set job status [🔥HIRED🔥]. (In this moment his account disactive, and he can't log again.)

3) <h3> HR </h3>

- When User is active, HR has view with all of the participant's.
- HR add interested users. If he is not interested any more, he can remove it from the list.
- HR is allowed to see candidates CV's. (Only when he/she add them as interested one.)
- HR, after call or meeting can hire user. After clicking a button, he mark student as hired.  

<!-- Env Variables -->
### :key: Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`TOKEN_ADDED_USER_HR`

`CONNECTION_DB`

`REGISTER_TOKEN_USER`

`LOG_TOKEN`

`REFRESH_TOKEN_REMINDER`

`ADMIN_EMAIL`

`HOST`

`PORT`

`MAIL_HOST`

`MAIL_USER`

`MAIL_PASS`

<!-- Getting Started -->
## 	:toolbox: Getting Started

<!-- Prerequisites -->
### :bangbang: Prerequisites

This project uses Yarn as package manager

```bash
 npm install --global yarn
```

<!-- Installation -->
### :gear: Installation

Install be_hr with npm

```bash
  yarn install be_hr
  cd be_hr
```

<!-- Run Locally -->
### :running: Run Locally

Clone the project

```bash
  git clone https://github.com/Simoon234/be_hr.git
```

Go to the project directory

```bash
  cd be_hr
```

Install dependencies

```bash
  yarn
```

Start the server

```bash
  nest start --watch
```

Folder structure


```
be_hr
|- dist
|- node_modules
|- src
|    |-----------------|
|                      | - admin
|                            |dto - |
|                            | - admin.controller.ts
|                            | - admin.module.ts
|                            | - admin.service.ts
|                        -auth
|                            |dto - |
|                            | - guards
|                            | - auth.controller.ts
|                            | - auth.module.ts
|                            | - auth.service.ts
|                            | - jwt.startegy.ts
|                        -decorators
|                            | - object.decorator.ts
|                            | - roles.decorator.ts
|                        -email
|                            | - email.module.ts
|                            | - email.service.ts
|                        -hr
|                            |dto - | 
|                            | - hr.controller.ts
|                            | - hr.module.ts
|                            | - hr.service.ts
|                       -schemas
|                            | - admin.schema.ts
|                            | - hr.schema.ts
|                            | - user.schema.ts
|                        -templates |
|                                   |email |
|                                          | - passwordReset.ts
|                                          | - registration.ts
|                        -types
|                            | - index.ts
|                            | - types.ts
|                        -user
|                            |dto - |
|                            | - user.controller.ts
|                            | - user.module.ts
|                            | - user.service.ts
|                        utils
|                            | - checkQueryUrl.ts
|                            | - hashPassword.ts
|                            | - sendError.ts
|                            | - usersResponseAvailable.ts
|                            | - usersResponseToTalk.ts
|                        app.module.ts
|                        config.ts
|                        mail-config.ts
|                        main.ts
|- .env
|- .eslintrc.js
|- .gitignore
|- .prettierrc
|- nest-cli.json
|- package.json
|- package-lock.json
|- tsconfig.build.json
|- tsconfig.json
|- yarn.lock
```

<!-- Routes -->
### :eyes: Routes
 Admin 
| Route `/admin`  |
| ------------ | 
|`/:id`        | 
|`/add/hr`    | 
|`/add/students`    |
|`/register`  |

 HR 
| Route `/hr`  |
| ------------ | 
|`/interested/:id/:itemsOnPage/:page`        | 
|`/not-interested/:hrId/:userId`    | 
|`/add-to-talk/:id/:userId`    |
|`/update/:id`  |
|`/all/active/:id/:itemsOnPage/:page`  |
|`/hired/:id`  |
|`/filter-available/:page/:itemsOnPage/:id`  |
|`/filter-to-talk/:page/:itemsOnPage/:id`  |

 Student 
| Route `/user`  |
| ------------ | 
|`/details/:id`        | 
|`/hired/:id`    | 
|`/update/:id`    |
|`/delete-account/:id`  |

Auth 
| Route `/auth`  |
| ------------ | 
|`/check`        | 
|`/login`    | 
|`/register-hr/:id/:registerToken`    |
|`/register-student/:id/:registerToken`  |
|`/logout`    |
|`/reset-password`  |
|`/change-password/:id/:refreshToken`  |


<!-- FAQ -->
## :grey_question: FAQ

- <p> Why can I only add 20 user's/admin's/hr's? </p> 

    + This is because of server limit imposed by MongoDB. In this project we used free plan.  

- <p> How many emails can I send? Are there any limits? </p>

    + Yes, there is a limit 100 emails per day. 
  
- <p> Why I have error while sending email? </p> 
 
    + Please make sure to add user and pass (API_KEY). Whole application is using SendGrind library. Sign in there, and get your own API_KEY.  


<!-- Contact -->
## :handshake: Contact

Szymon - simongetbug@gmail.com
