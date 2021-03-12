import fs from 'fs'

export const read = (path: string) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, (err, res) => {
      if (err) {
        reject(err)
        return
      }
      resolve(JSON.parse(res.toString()))
    })
  })

export const write = (path: string, content: string) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve(null)
    })
  })
