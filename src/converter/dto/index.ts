import { IsNotEmpty } from 'class-validator';

export class DetailsDTO{
    name?: string;
    experience?: string;
    education?: string;
    skillset?: string;
    projects?: string;
    languages?: string;
    tagline?: string;
}
export class CreationRequestDTO{
    @IsNotEmpty()
    details: DetailsDTO;
    @IsNotEmpty()
    getDocx: boolean;
    @IsNotEmpty()
    templateId:number=0;
}