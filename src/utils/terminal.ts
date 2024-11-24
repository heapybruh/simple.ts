import chalk from "npm:chalk"

const prefix = `[ ${chalk.blue.bold("simple.ts")} ]`

export class Terminal {
  static print(message: any): void {
    console.log(`${prefix} ${message}`)
  }

  static error(title: any, fields?: (string | undefined)[]): void {
    var description = ``

    if (fields)
      fields.map((value) => {
        if (value)
          description = description + `\n                    >> ${value}`
      })

    console.log(
      `${prefix} ${chalk.red.bold("ERROR >>")} ${chalk.bgRed(
        ` ${title} `
      )} ${description}`
    )
  }
}
