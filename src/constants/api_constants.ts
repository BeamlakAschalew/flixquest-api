import dotenv from "dotenv";
dotenv.config();

export const tmdbBaseUrl = "https://api.themoviedb.org";
export const tmdbKey = process.env.TMDB_KEY;
export const daddyliveReferrer = "https://olalivehdplay.ru/z.m3u8";
export const daddyliveUserAgent = "MXPlayer/1.50.1 (Linux; Android 13; en-GB; SM-M127G Build/TP1A.220624.014.M127GXXU6DWJ1)";
export const daddyliveStreamBaseUrl = "https://webudit.webhd.ru/lb/premium"
export const daddyliveTrailingUrl = `/index.m3u8?|referer=${daddyliveReferrer}`;
export const daddylive247Url = "https://dlhd.sx/24-7-channels.php";
