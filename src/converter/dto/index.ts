import { IsNotEmpty, IsOptional } from "class-validator";

export class DetailsDTO{
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    experience?: string;
}