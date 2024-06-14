import chalk from "chalk"

export class Console {
  _prefix = `[ ${chalk.blue.bold("simple.ts")} ]`

  public print(message: any): void {
    console.log(`${this._prefix} ${message}`)
  }

  public debug(title: string, info: (string | undefined)[]): void {
    var description = ``

    info.map((value) => {
      if (value) description = description + `\n                    >> ${value}`
    })

    console.log(
      `${this._prefix} ${chalk.greenBright.bold("DEBUG >>")} ${chalk.bgGreenBright(` ${title} `)} ${description}`
    )
  }
}
