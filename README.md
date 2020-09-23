# webaudit

## How to use
1. Clone repo `git clone git@github.com:akmittal/webaudit.git` 
2. Goto main repo `cd webaudit`
3. Run `npm i` in all directries 
    `cd server && npm i`
    `cd client && npm i`
    `cd cli && npm i`
4. Goto cli/config and onboard all URLs you want
5. Goto cli and run `npm run build:exec`, It should create `cli/public` directry will executables for windows, Mac and Linux
6. There utilities can be run from command line `cli-linux project1 module1 env`
7. Run server `cd server && npm run start:prod`
8. Run client build `cd client && npm start`

Screenshots

![Home](/screenshot/1.png?raw=true "Home")
![Detail](/screenshot/2.pngs?raw=true "Detail")
