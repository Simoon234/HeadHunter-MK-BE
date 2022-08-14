<div align="center">
  <img src="https://user-images.githubusercontent.com/83337792/184535023-957f5f76-fad5-4f3e-bdf0-8f1357648d9e.png" width="400" height="auto" />
</div>

<br />

<!-- Table of Contents -->
# :notebook_with_decorative_cover: Table of Contents

- [About the Project](#star2-about-the-project)
    * [Screenshots](#camera-screenshots)
    * [Tech Stack](#space_invader-tech-stack)
    * [Features](#dart-features)
    * [Environment Variables](#key-environment-variables)
- [Getting Started](#toolbox-getting-started)
    * [Prerequisites](#bangbang-prerequisites)
    * [Installation](#gear-installation)
    * [Run Locally](#running-run-locally)
- [Usage](#eyes-usage)
- [Contributing](#wave-contributing)
    * [Code of Conduct](#scroll-code-of-conduct)
- [FAQ](#grey_question-faq)
- [Contact](#handshake-contact)



<!-- About the Project -->
## :star2: About the Project
Head Hunter MegaK applications was built 

<!-- Screenshots -->
### :camera: Screenshots

<div align="center"> 
  <img src="https://placehold.co/600x400?text=Your+Screenshot+here" alt="screenshot" />
</div>


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

<!-- Usage -->
## :eyes: Usage

Use this space to tell a little more about your project and how it can be used. Show additional screenshots, code samples, demos or link to other resources.


```javascript
import Component from 'my-project'

function App() {
  return <Component />
}
```

<!-- Contributing -->
## :wave: Contributing

<div align="center">
<h3>Szymon [Me] </h3>
<a href="https://github.com/Simoon234">
  <img src="https://avatars.githubusercontent.com/u/83337792?v=4" />
</a>
<h3>Tomasz</h3>
<a href="https://github.com/tomaszburas">
  <img src="https://avatars.githubusercontent.com/u/91786940?v=4" />
</a>
</div>

<!-- FAQ -->
## :grey_question: FAQ

- <p>Why can I only add 20 users/admins/hr? </p> 

    + This is because of server limit imposed by MongoDB. In this project we used free plan.  

- <p> How many emails can I send? Are there any limits? </p>

    + Yes, there is a limit 100 emails per day. 


<!-- Contact -->
## :handshake: Contact

Szymon - simongetbug@gmail.com
