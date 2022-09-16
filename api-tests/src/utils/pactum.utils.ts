/* eslint-disable @typescript-eslint/no-explicit-any */

export function getResponse(spec: any) {
    return spec._response as {
        statusCode: number;
        headers: any;
        json: any;
    };
}
