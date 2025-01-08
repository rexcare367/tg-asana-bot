import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

const axiosClient = (baseURL: string, token: string | null = null): AxiosInstance => {
    const client = axios.create({
        baseURL,
        headers: {},
        timeout: 60000,
        withCredentials: false,
    });

    client.interceptors.request.use((config: any) => {
        config.headers = config.headers || {};
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    client.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error: AxiosError) => {
            try {
                const { response } = error;
                if (response?.status === 401) {
                    throw error;
                }
            } catch (e) {
                console.error(e);
            }
            throw error;
        }
    );

    return client;
};

export default axiosClient;
