import {Request} from "express";

type stringNullable = string | null | undefined;

export const authToken = "access-token";

export class RequestHeadersDto {
    public "access-token": stringNullable;

    constructor(request: Request) {
        this[authToken] = request.header(authToken);
    }
}