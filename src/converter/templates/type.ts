import { Document } from "docx";
import { DetailsDTO } from "../dto";

export type DocxTemplate= (details: DetailsDTO)=>Document;