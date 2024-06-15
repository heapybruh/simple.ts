import chalk from "chalk"

export class Console {
  private _prefix = `[ ${chalk.blue.bold("simple.ts")} ]`

  public print(message: any): void {
    console.log(`${this._prefix} ${message}`)
  }

  public debug(title: string, fields: (string | undefined)[]): void {
    var description = ``

    fields.map((value) => {
      if (value) description = description + `\n                    >> ${value}`
    })

    console.log(
      `${this._prefix} ${chalk.greenBright.bold("DEBUG >>")} ${chalk.bgGreenBright(` ${title} `)} ${description}`
    )
  }
}
