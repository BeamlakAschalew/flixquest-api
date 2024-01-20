<p align="center">
    <img alt="Consumet" src="https://raw.githubusercontent.com/BeamlakAschalew/beamlakaschalew.github.io/main/cinemax/res/assets/images/logo.png" width="150">
</p>
<h1 align="center">FlixQuest API</h1>

<p align="center">REST API that fetches streaming links of movies and TV shows based on TMDB id using @movie-web/providers package</p>

<p align="center"><a src="https://github.com/BeamlakAschalew/flixquest-api/actions/workflows/node.js.yml"><img src="https://github.com/BeamlakAschalew/flixquest-api/actions/workflows/node.js.yml/badge.svg" alt="Node build badge"></a>
<a src="https://github.com/BeamlakAschalew/flixquest-api/blob/main/LICENSE"><img src="https://img.shields.io/github/license/BeamlakAschalew/flixquest-api"></img></a>
</p>

Hosted instance: https://flixquest-api.vercel.app

## API Reference

#### List of available providers:

| Name         | Id             | Status                               |
| :----------- | :------------- | :----------------------------------- |
| ShowBox      | `showbox`      | 🟢 200 <br>(without CloudFlare proxy) |
| FlixHQ       | `flixhq`       | 🟢 200                                |
| ZoeChip      | `zoe`          | 🟢 200                                |
| SmashyStream | `smashystream` | 🟢 200                                |
| RemoteStream | `remotestream` | 🔴 500                                |
| Gomovies     | `gomovies`     | 🟢 200                                |
| VidSrc       | `vidsrc`       | 🔴 500                                |

### Get all links and subtitles for a movie

| Parameter | Type   | Description                                                                                                                                                                                                                                                  |
| :-------- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tmdbId`  | `int`  | **Required**. TMDB id of the movie                                                                                                                                                                                                                           |
| `proxied` | `bool` | Optional. `true` or `false` value.<br><br>If set `true` or `proxied` parameter is left empty, the script uses the proxy URL that is found in the environment variable.<br/>Otherwise if set `false` the script will make a raw request towards the provider. |

```http
  GET /{provider ID}/watch-movie?tmdbId=tmdbId
```

#### Example

Get streaming link and subtitles for the movie 'The Hangover 1' from the 'FlixHQ' provider

```http
  GET /flixhq/watch-movie?tmdbId=18785
```

### Get all links and subtitles for an episode

| Parameter | Type   | Description                                                                                                                                                                                                                                                  |
| :-------- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tmdbId`  | `int`  | **Required**. TMDB id of the TV show                                                                                                                                                                                                                         |
| `season`  | `int`  | **Required**. The season number of the episode                                                                                                                                                                                                               |
| `episode` | `int`  | **Required**. The episode number of the episode                                                                                                                                                                                                              |
| `proxied` | `bool` | Optional. `true` or `false` value.<br><br>If set `true` or `proxied` parameter is left empty, the script uses the proxy URL that is found in the environment variable.<br/>Otherwise if set `false` the script will make a raw request towards the provider. |

```http
  GET /{provider ID}/watch-tv?tmdbId=tmdbId&season=season&episode=episode
```

#### Example

Get streaming link and subtitles for the TV show 'The Office' from the 'FlixHQ' provider

```http
  GET /flixhq/watch-tv?tmdbId=2316&season=1&episode=1
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
or

```sh
$ nodemon
```

### Vercel

Host your own instance of FlixQuest API on Vercel using the button below.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%BeamlakAschalew%2Fflixquest-api)

### Render

Host your own instance of FlixQuest API on Render using the button below.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/BeamlakAschalew/flixquest-api)

## Environment Variables

`TMDB_KEY` (**Required**) : TMDB API key, used to get the metadata of a movie or TV show, can be found at https://www.themoviedb.org/settings/api

`WORKERS_URL` (Optional) : A proxy URL that'll be used while making a GET request (used only if `proxied` is true or if `proxied` is left unprovided).

You can get Cloudflare proxy at https://workers.cloudflare.com/<br>
Or deploy your own custom proxy from [here](https://github.com/movie-web/simple-proxy) and place the endpoint in `WORKERS_URL` 


## Credits
Most of the code of this script is based on [Consumet API](https://github.com/consumet/api.consumet.org/)<br>
The script uses [@movie-web/providers](https://www.npmjs.com/package/@movie-web/providers) package
## Contributors
<a href="https://github.com/beamlakaschalew/flixquest-api/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=beamlakaschalew/flixquest-api" />
</a>


