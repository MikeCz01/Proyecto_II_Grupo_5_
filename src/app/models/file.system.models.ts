import { BCPMemory } from "./process.model"

export interface OkResponse{
    ok: boolean
};

export interface GetFirstResponse{
    ok: boolean
    process?: BCPMemory
};

export interface FileRequest{
    filename: string
}

export interface AppendRequest{
    filename: string
    process: BCPMemory
};