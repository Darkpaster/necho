declare class ApiService {
    private baseURL;
    private token;
    constructor(baseURL?: string);
    setToken(token: string): void;
    removeToken(): void;
    private getHeaders;
    request<T>(endpoint: string, options?: RequestInit): Promise<T>;
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data?: any): Promise<T>;
    put<T>(endpoint: string, data?: any): Promise<T>;
    patch<T>(endpoint: string, data?: any): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}
export declare const apiService: ApiService;
export {};
