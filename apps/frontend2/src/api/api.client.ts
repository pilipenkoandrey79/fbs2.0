import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  HttpStatusCode,
  Method,
} from "axios";
import { ApiEntities, JWTTokensPair } from "@fbs2.0/types";

import backendUrl from "./backend-url";
import { getApiToken, saveApiToken } from "../utils/api-token";
import { getRefreshToken, saveRefreshToken } from "../utils/refresh-token";

const getHeaders = (customHeaders?: AxiosHeaders) => {
  const headers = new AxiosHeaders(customHeaders);

  headers.setAccept("application/json");
  headers.setContentType("application/json");

  return headers;
};

const REFRESH_URL = `${backendUrl}${ApiEntities.Auth}/refresh`;

export default class ApiClient {
  static instance: ApiClient;
  private api?: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${backendUrl}`,
      headers: getHeaders(),
    });

    this.api.interceptors.request.use(
      (config) => {
        if (!this.api) {
          throw new Error();
        }

        if (config.url === REFRESH_URL) {
          return config;
        }

        const token = getApiToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalConfig = error.config;

        if (error.response) {
          if (
            error.response.status === HttpStatusCode.Unauthorized &&
            !originalConfig._retry
          ) {
            originalConfig._retry = true;

            try {
              if (!this.api) {
                return Promise.reject();
              }

              await this.refreshToken();

              return this.api(originalConfig);
            } catch (_error) {
              const { response } = _error as AxiosError;

              if (response && response.data) {
                return Promise.reject(response.data);
              }

              return Promise.reject(_error);
            }
          }

          if (
            error.response.status === HttpStatusCode.Forbidden &&
            error.response.data
          ) {
            return Promise.reject(error.response.data);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async refreshToken() {
    if (!this.api) {
      return Promise.reject();
    }

    const tokenToRefresh = getRefreshToken();
    const headers = new AxiosHeaders();
    headers.setAuthorization(`Bearer ${tokenToRefresh}`);

    const {
      data: { accessToken, refreshToken },
    } = await this.api.request<JWTTokensPair>({
      method: "GET",
      url: REFRESH_URL,
      headers,
    });

    saveApiToken(accessToken);
    saveRefreshToken(refreshToken);

    return true;
  }

  static getInstance() {
    if (ApiClient.instance) {
      return ApiClient.instance;
    }

    return new ApiClient();
  }

  private async request<R, T = unknown, D = unknown>(
    method: Method,
    requestUrl: string,
    params?: T,
    axiosConfig: Partial<AxiosRequestConfig<D>> = {}
  ) {
    if (!this.api) {
      return Promise.reject();
    }

    const isGet = method.toUpperCase() === "GET";

    const { data } = await this.api.request<R>({
      method,
      url: requestUrl,
      ...(!isGet ? { data: params ?? {} } : { params }),
      ...axiosConfig,
    });

    return data;
  }

  get<R, T = undefined, D = undefined>(
    requestUrl: string,
    params?: T,
    axiosConfig?: Partial<AxiosRequestConfig<D>>
  ) {
    return this.request<R, T, D>("GET", requestUrl, params, axiosConfig);
  }

  post<R, T = undefined>(requestUrl: string, params?: T) {
    return this.request<R, T>("POST", requestUrl, params);
  }

  put<R, T = undefined>(requestUrl: string, params?: T) {
    return this.request<R, T>("PUT", requestUrl, params);
  }

  patch<R, T = undefined>(requestUrl: string, params?: T) {
    return this.request<R, T>("PATCH", requestUrl, params);
  }

  delete<R, T = undefined>(requestUrl: string, params?: T) {
    return this.request<R, T>("DELETE", requestUrl, params);
  }
}
