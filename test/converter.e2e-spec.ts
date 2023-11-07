import {  readFileSync, writeFileSync } from "fs"
import * as path from "path"
import { markdownToDocx } from "../src/converter/markdown-to-docx/parser"
import * as unoconv from 'awesome-unoconv';

describe("Formatting", ()=>{
    it("should be able to have bold text in lists", async ()=>{
        const filePath = path.resolve(__dirname, "./converter", "formatting test.md")
        const text = readFileSync(filePath).toString()
        const docxResult = await markdownToDocx({name:"Random name", experience:text})
        const uniqueName = new Date().toISOString().split(".")[0].replaceAll(":", "-")
        const outputDocxPath = `./testing_output/${uniqueName}.docx`
        const outputPdfPath =  `./testing_output/${uniqueName}.pdf`
        // Create a docx file
        writeFileSync(outputDocxPath, docxResult)
    })
    it("should create full docx and pdfs according to template", async ()=>{
        const name = readFileSync(path.resolve(__dirname, "./converter/sections test/name.md")).toString()
        const experience = readFileSync(path.resolve(__dirname, "./converter/sections test/experience.md")).toString()
        const projects = readFileSync(path.resolve(__dirname, "./converter/sections test/projects.md")).toString()
        const languages = readFileSync(path.resolve(__dirname, "./converter/sections test/languages.md")).toString()
        const education = readFileSync(path.resolve(__dirname, "./converter/sections test/education.md")).toString()
        const docxResult = await markdownToDocx({name, experience, projects, languages, education})
        
        const uniqueName = new Date().toISOString().split(".")[0].replaceAll(":", "-")   
        const outputDocxPath = path.resolve(__dirname, "../testing_output/sections test",`${uniqueName}.docx`)
        const outputPdfPath =  path.resolve(__dirname, "../testing_output/sections test",`${uniqueName}.pdf`)
        writeFileSync(outputDocxPath, docxResult)
        const result = await unoconv.convert(
            outputDocxPath,
            outputPdfPath,
        );
    })
})