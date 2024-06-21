import chalk from "chalk"

const prefix = `[ ${chalk.blue.bold("simple.ts")} ]`

export class Terminal {
  static print(message: any): void {
    console.log(`${prefix} ${message}`)
  }

  static debug(title: string, fields?: (string | undefined)[]): void {
    var description = ``

    if (fields)
      fields.map((value) => {
        if (value)
          description = description + `\n                    >> ${value}`
      })

    console.log(
      `${prefix} ${chalk.green.bold("DEBUG >>")} ${chalk.bgGreen(` ${title} `)} ${description}`
    )
  }

  static error(title: string, fields?: (string | undefined)[]): void {
    var description = ``

    if (fields)
      fields.map((value) => {
        if (value)
          description = description + `\n                    >> ${value}`
      })

    console.log(
      `${prefix} ${chalk.red.bold("ERROR >>")} ${chalk.bgRed(` ${title} `)} ${description}`
    )
  }
}
