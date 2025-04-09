import {IsOptional, IsString } from "class-validator";

export class SearchTermDto {
    @IsOptional()
    @IsString()
    searchTerm: string;
}