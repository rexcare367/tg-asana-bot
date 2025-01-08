"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axiosClient = (baseURL, token = null) => {
    const client = axios_1.default.create({
        baseURL,
        headers: {},
        timeout: 60000,
        withCredentials: false,
    });
    client.interceptors.request.use((config) => {
        config.headers = config.headers || {};
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
    client.interceptors.response.use((response) => {
        return response;
    }, (error) => {
        try {
            const { response } = error;
            if ((response === null || response === void 0 ? void 0 : response.status) === 401) {
                throw error;
            }
        }
        catch (e) {
            console.error(e);
        }
        throw error;
    });
    return client;
};
exports.default = axiosClient;
