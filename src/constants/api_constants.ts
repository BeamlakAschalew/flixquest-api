import dotenv from "dotenv";
dotenv.config();

export const tmdbBaseUrl = "https://api.themoviedb.org";
export const tmdbKey = process.env.TMDB_KEY;
