import axios from "axios";
import makeHttp from "./http";
import config from "../Config";

const instance = axios.create({
  baseURL: config.baseUrl,
  timeout: 5000,
});

const http = makeHttp(instance);

export default http;
