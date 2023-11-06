import {  readFileSync, writeFileSync } from "fs"
import * as path from "path"
import { markdownToDocx } from "../src/converter/markdown-to-docx/parser"

describe("Formatting", ()=>{
    it("should be able to have bold text in lists", async ()=>{
        const filePath = path.resolve(__dirname, "./converter", "formatted_in_lists.md")
        const text = readFileSync(filePath).toString()
        const docxResult = await markdownToDocx("Random name", text)
        const uniqueName = new Date().toISOString().split(".")[0].replaceAll(":", "-")
        const outputDocxPath = `./testing_output/${uniqueName}.docx`
        const outputPdfPath =  `./testing_output/${uniqueName}.pdf`
        // Create a docx file
        writeFileSync(outputDocxPath, docxResult)
    })
})