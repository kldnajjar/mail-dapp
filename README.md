## Running the app

### express server setup

```bash
$ yarn
$ yarn start
```

the server runs on port 8765. to start with file watching and server reload enabled:

```bash
$ yarn watch
# instead of yarn start
```

### react client setup

Select the needed peers

start the client app:

```bash
$ yarn
$ yarn start
```

your default browser should open http://localhost:8081 in a new tab. updating any of the files in client/src will hot reload the page.

### Stuff I learned

- Webpack doesn't love the gun package. Add `noParse: /(\/gun|gun\/sea)\.js$/` to webpack.config.js to suppress warnings
- gun only supports `sessionStorage`, which means users need to log in to each tab/window they open. I'm using `BroadcastChannel` to get around this

### Open questions

~~What's the best way of keeping a list of users in the db? gun superuser?~~

Create server app as super user and having it give out certificates to end users seems to be working, although certificates won't expire and block lists don't work as of `v^0.2020.1235`.

### Forked Repo

https://github.com/SuaYoo/gundb-react-express-auth-example
