import { FirstTemplate } from "./first_template"
import { SecondTemplate } from "./second_template"

export const getTemplateFromId_stub = (id)=>{
    switch (id){
        case 0:
            return FirstTemplate
        default:
            return SecondTemplate
    }
}