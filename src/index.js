import chalk from 'chalk'
import debug from '@watchmen/debug'

const dbg = debug(import.meta.url)

export default class Eye {
  static space = '  '
  static bannerLeader = '>'
  // grabbing good colors from https://github.com/debug-js/debug/blob/master/src/node.js
  //
  static colors = [
    20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68,
    69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134,
    135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171,
    172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204,
    205, 206, 207, 208, 209, 214, 215, 220, 221,
  ]
  static chars = ['=', '-', '~', '*', '+']
  #indent = 0

  // #dbg

  constructor(_dbg) {
    // this.#dbg = _dbg
    dbg('ctor: ns=%s', _dbg.namespace)
  }

  static color() {
    const rand = Math.floor(Math.random() * (Eye.colors.length - 1))
    return Eye.colors[rand]
  }

  get hr() {
    return Eye.chars[this.#indent % Eye.chars.length].repeat(80)
  }

  static colored({msg, color = Eye.color()}) {
    return chalk.ansi256(color)(msg)
  }

  #leader() {
    return Eye.space.repeat(this.#indent)
  }

  #line(message) {
    return `${this.#leader()}${message}`
  }

  banner({msg, hr = this.hr, color = Eye.color()}) {
    const _hr = Eye.colored({msg: hr, color})
    const _leader = Eye.colored({msg: Eye.bannerLeader, color})
    console.log(this.#line(_hr))
    console.log(this.#line(`${_leader}${Eye.space}${msg}`))
    console.log(this.#line(_hr))
  }

  get enabled() {
    // to-do: enable/disable/level?
    return true
  }

  must(args) {
    return args.must === true
  }

  log(message) {
    if (this.enabled) {
      console.log(this.#line(message))
    }
  }

  async #dent(value) {
    // dbg('dent: indent=%s, value=%s', this.#indent, value)
    this.#indent += value
  }

  async section(args = {}, closure) {
    let result
    const message = args.msg || '?'
    const must = this.must(args)
    const {enabled} = this

    if (!must && !enabled) {
      return
    }

    if (enabled) {
      const trace = new Date().toLocaleTimeString()

      const color = Eye.color()
      const {hr} = this

      this.banner({msg: `begin: ${message} (${trace})`, color, hr})
      await this.#dent(1)
      const start = Date.now()
      result = await closure(args)
      const end = Date.now()
      await this.#dent(-1)
      const duration = end - start
      // dbg('section: indent=%s, duration=%s', this.#indent, duration)

      this.banner({
        msg: `end: ${message} (elapsed=${duration})`,
        color,
        hr,
      })
    } else {
      result = await closure(args)
    }

    return result
  }
}
