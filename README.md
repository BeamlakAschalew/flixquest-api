
# FlixQuest API

REST API that fetches streaming links of movies and TV shows based on TMDB id


Hosted instance: https://flixquest-api.vercel.app

## API Reference

#### List of available providers:
| Name         | Id            |
| :--------    | :-------      |
| ShowBox      | `showbox`     |
| FlixHQ       | `flixhq`      |
| ZoeChip      | `zoe`         |
| SmashyStream | `smashystream`|
| RemoteStream | `remotestream`|
| Gomovies     | `gomovies`    |


### Get all links and subtitles for a movie

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `tmdbId`  | `string` | **Required**. TMDB id of the movie|

```http
  GET /{provider ID}/watch-movie?tmdbId=tmdbId
```

#### Example
Get streaming link and subtitles for the movie 'The Hangover' from 'ShowBox' provider

```http
  GET /showbox/watch-movie?tmdbId=18785
```

### Get all links and subtitles for an episode

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `tmdbId`  | `string` | **Required**. TMDB id of the TV show|
| `season`  | `string` | **Required**. The season number of the episode |
| `episode`  | `string` | **Required**. The episode number of the episode |

```http
  GET /{provider ID}watch-tv?tmdbId=tmdbId&season=season&episode=episode
```

#### Example
Get streaming link and subtitles for the TV show 'The Office' from 'ShowBox' provider

```http
  GET /showbox/watch-tv?tmdbId=2316&season=1&episode=1
```




## Installation
### Locally
Installation is simple.

Run the following command to clone the repository, and install the dependencies.

```sh
$ git clone https://github.com/BeamlakAschalew/flixquest-api.git
$ cd flixquest-api
$ npm install
```

start the server!

```sh
$ npm start
```



### Vercel
Host your own instance of FlixQUest API on Vercel using the button below.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%BeamlakAschalew%2Fflixquest-api)

### Render
Host your own instance of FlixQuest API on Render using the button below.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/BeamlakAschalew/flixquest-api)


## Environment Variables

To run this project you need a Cloudflare workers running, you will need to add your workers URL and a TMDB API key to your .env file



`TMDB_KEY`

`WORKERS_URL`

