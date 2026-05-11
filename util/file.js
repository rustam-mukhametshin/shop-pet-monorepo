import * as fs from "node:fs";

export const deleteFile = filePath => {
    fs.unlink(filePath, err => {
        if (err) throw err;
    })
}