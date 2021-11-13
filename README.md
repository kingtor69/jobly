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
 | `/users` | GET | retrieve a list of all users | logged-in user token | | |
 | `/users/:username` | GET | show all user information | matching user token or admin token | | |
 | `/users` | POST | create a new user | logged-in user token or admin token (admin required to create new admins) | { username, password, first_name, last_name, email, is_admin } | `../schemas/userNew.json` |
 | `/users/:username` | PATCH | edit user information | matching user token or admin token | { username, password, first_name, last_name, email, is_admin } | `../schemas/userUpdate.json` |
 | `/users/:username/jobs/:jobId` | POST | apply for a job | matching user token or admin token | *all in params* | |
 | `/users/:username` | DELETE | delete a user | matching user token or admin token | | |
 | :---- | :----- | :-------- | :------ |
 | `/companies` | GET | list all companies | | | |
 | `/companies` | GET | search for companies | | { name, minEmployees, maxEmployees } | `../schemas/companyNew.json` |
 | `/companies/:handle` | GET | get information on a specific company | | |
 | `/companies` | POST | create new company | admin token | { name, handle, description, numEmployees, logoUrl } | `../schemas/companyNew.json` | 
 | `/companies/:handle` | PATCH | edit company information | admin token | { name, description, numEmployees, logoUrl } | `../schemas/companyUpdate.json` |
 | :---- | :----- | :-------- | :------ |
 | `/jobs` | GET | list all jobs | | | |
 | `/jobs` | GET | search for jobs | | { title, minEmployees, maxEmployees } | `../schemas/companyNew.json` |
 | `/jobs/:handle` | GET | get information on a specific company | | |
 | `/jobs` | POST | create new company | admin token | { name, handle, description, numEmployees, logoUrl } | `../schemas/companyNew.json` | 
 | `/jobs/:handle` | PATCH | edit company information | admin token | { name, description, numEmployees, logoUrl } | `../schemas/companyUpdate.json` |
