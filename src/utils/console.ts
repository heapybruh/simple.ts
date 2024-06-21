import chalk from "chalk"

export class Console {
  private _prefix = `[ ${chalk.blue.bold("simple.ts")} ]`

  public print(message: any): void {
    console.log(`${this._prefix} ${message}`)
  }

  public debug(title: string, fields?: (string | undefined)[]): void {
    var description = ``

    if (fields)
      fields.map((value) => {
        if (value)
          description = description + `\n                    >> ${value}`
      })

    console.log(
      `${this._prefix} ${chalk.green.bold("DEBUG >>")} ${chalk.bgGreen(` ${title} `)} ${description}`
    )
  }

  public error(title: string, fields?: (string | undefined)[]): void {
    var description = ``

    if (fields)
      fields.map((value) => {
        if (value)
          description = description + `\n                    >> ${value}`
      })

    console.log(
      `${this._prefix} ${chalk.red.bold("ERROR >>")} ${chalk.bgRed(` ${title} `)} ${description}`
    )
  }
}
