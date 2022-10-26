export type QueryParams = Record<string, any>;

export interface RequestOptions<RequestBody, RequestParams extends QueryParams> {
    params?: RequestParams;
    body?: RequestBody;
    headers?: Record<string, any>;
    parseResponse?: boolean;
    withCredentials?: boolean;
    validateAuthentication?: boolean;
}

type RequestBodyHttpMethod = <
    ResponseBody = any,
    RequestBody = any,
    RequestQueryParams extends QueryParams = QueryParams
>(
    url: string,
    requestOptions?: RequestOptions<RequestBody, RequestQueryParams>
) => Promise<ResponseBody>;

export interface Http {
    doGet<ResponseBody = any, RequestQueryParams extends QueryParams = QueryParams>(
        url: string,
        requestOptions?: Omit<RequestOptions<never, RequestQueryParams>, 'body'>
    ): Promise<ResponseBody>;

    doPost: RequestBodyHttpMethod;

    doDelete: RequestBodyHttpMethod;

    doPut: RequestBodyHttpMethod;

    doPatch: RequestBodyHttpMethod;
}

export type Manager = Http;

export type Callback = (...args: any[]) => void;

export interface EventBus {
    on(event: string, callback: Callback, context?: any): void;

    trigger(event: string, ...args: any[]): EventBus;

    off(event: string, offCallback: Callback): void;
}

export type DrilldownHandler = (
    pageId: string,
    drilldownContext: Record<string, any>,
    drilldownPageTitle: string
) => void;
