# Jobly
## Tor Kingdon
### Springboard Software Engineering Career Track
#### Unit 37: Cumulative Project 2

## Backend
### This is the Express backend for Jobly, version 2.
*Starter code and instructions by Colt Steel and/or Rithm School and/or Springboard*
*Completed by Tor Kingdon*

To install production and test databases and to seed production database (in postgres):

    postgres@[local_path]/jobly$ psql < jobly.sql

To run this:

    node server.js
    
To run the tests:

    jest -i

### RESTful API routes:
 | endpoint | verb | description | requirements | body format | full schema path |
 | :---- | :----- | :-------- | :------ | :--- | :--- |
 | `/users` | POST | create a new user | logged-in user token or admin token (admin required to create new admins) | { username, password, first_name, last_name, email, is_admin } | `../schemas/userNew.json` |
 | `/users` | GET | retrieve a list of all users | logged-in user token | | |
 | `/users/:username` | GET | show all user information | matching user token or admin token | | |
 | `/users/:username` | PATCH | edit user information | matching user token or admin token | { username, password, first_name, last_name, email, is_admin } | `../schemas/userUpdate.json` |
 | `/users/:username/jobs/:jobId` | POST | apply for a job | matching user token or admin token | *all in params* | |
 | `/users/:username` | DELETE | delete a user | matching user token or admin token | | |
 | :---- | :----- | :-------- | :------ |
 | `/companies` | POST | create new company | admin token | { name, handle, description, numEmployees, logoUrl } | `../schemas/companyNew.json` | 
 | `/companies` | GET | list all companies | | | |
 | `/companies` | GET | search for companies | | { name, minEmployees, maxEmployees } | `../schemas/companySearch.json` |
 | `/companies/:handle` | GET | get information on a specific company | | |
 | `/companies/:handle` | PATCH | edit company information | admin token | { name, description, numEmployees, logoUrl } | `../schemas/companyUpdate.json` |
 | `/companies/:handle` | DELETE | delete a company | admin token | | |
 | :---- | :----- | :-------- | :------ |
 | `/jobs` | POST | create new job | admin token | { title, salary, equity, companyHandle } | `../schemas/jobNew.json` | 
 | `/jobs` | GET | list all jobs | | | |
 | `/jobs` | GET | search for jobs | | { title, salaryMin, salaryMax, equityMin, equityMax, companyHandle } | `../schemas/jobSearch.json` |
 | `/jobs/:id` | GET | get information on a specific job | | |
 | `/jobs/:id` | PATCH | edit job information | admin token | { title, salary, equity, companyHandle } | `../schemas/jobUpdate.json` |
 | `/jobs/:id` | DELETE | delete a job | admin token | | |
