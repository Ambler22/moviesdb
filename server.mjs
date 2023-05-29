import http from "http";
import fs from "fs/promises";
import url from "url";

import sqlite3 from "sqlite3";
import { open } from "sqlite";
import handlebars from "handlebars";

var db = await open({
  filename: "favorites.db",
  driver: sqlite3.Database,
});

var server = http.createServer(async function handler(request, response) {
  var parsedURL = url.parse(request.url);

  switch (parsedURL.pathname) {
    // case "/api/shows": {
    //   // TODO: make a db request
    //   // return a json response
    //   break;
    // }
    case "/": {
      let searchParams = new URLSearchParams(parsedURL.query);
      let search = searchParams.get("search");

      let shows;
      if (search == null) {
        shows = await db.all("SELECT title FROM shows");
      } else {
        shows = await db.all("SELECT title FROM shows WHERE title LIKE ?", [
          `%${search}%`,
        ]);
      }

      let html = await fs.readFile("index.html", "utf-8");
      let template = handlebars.compile(html);
      let str = template({ greeting: "Movies", shows, search });

      // html = html.replaceAll(
      // "{greeting}",
      // allShows.map((show) => `<li>${show.title}</li>`).join("")
      // );

      response.setHeader("Content-Type", "text/html");
      response.end(str);
      break;
    }
    // case "/index.js": {
    //   let text = await fs.readFile("index.js");
    //   response.end(text);
    //   break;
    // }
    default: {
      response.statusCode = 404;
      response.setHeader("Content-Type", "text/html");
      response.end("<h1>Sorry, we were unable to find this page.</h1>");
      break;
    }
  }
});

server.listen(8000);
