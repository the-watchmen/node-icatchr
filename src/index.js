import assert from 'node:assert'
import chalk from 'chalk'
// import debug from '@watchmen/debug'
import {parseBoolean, pretty} from '@watchmen/helpr'
import _ from 'lodash'

// const dbg = debug(import.meta.url)

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
  //
  #indent = 0
  #namespace
  #colors = {}

  static color() {
    const rand = Math.floor(Math.random() * (Eye.colors.length - 1))
    return Eye.colors[rand]
  }

  constructor(namespace) {
    this.#namespace = namespace ?? import.meta.url
  }

  get namespace() {
    return this.#namespace
  }

  get hr() {
    return Eye.chars[this.#indent % Eye.chars.length].repeat(80)
  }

  get leader() {
    return Eye.space.repeat(this.#indent)
  }

  get enabled() {
    // eslint-disable-next-line n/prefer-global/process
    return !parseBoolean(process.env.ICATCHR_DISABLED)
  }

  get color() {
    let color = this.#colors[this.#indent]
    if (!color) {
      color = Eye.color()
      this.#colors[this.#indent] = color
    }

    return color
  }

  colored(args) {
    const {string = args, color = this.color} = args
    return chalk.ansi256(color)(string)
  }

  line(string) {
    return `${this.leader}${string}`
  }

  banner(args) {
    const {string = args, hr = this.hr, color = this.color} = args
    assert.ok(_.isString(string))

    const _hr = this.colored({string: hr, color})
    const _leader = this.colored({string: Eye.bannerLeader, color})
    console.log(this.line(_hr))
    console.log(this.line(`${_leader}${Eye.space}${string}`))
    console.log(this.line(_hr))
  }

  log(value) {
    let array
    if (Array.isArray(value)) {
      array = value
    } else if (_.isObject(value)) {
      array = pretty(value).split('\n')
    } else {
      array = [value]
    }

    for (const elt of array) {
      console.log(this.line(elt))
    }
  }

  #dent(value) {
    // dbg('dent: indent=%s, value=%s', this.#indent, value)
    this.#indent += value
  }

  sub(string, closure) {
    return this.section({string, isTrace: false}, closure)
  }

  async section(args, closure) {
    const {
      string = args,
      must,
      input,
      isLog = true,
      isTrace = true,
      color = this.color,
    } = args

    const {enabled} = this

    if (!must && !enabled) {
      return
    }

    let result

    if (enabled) {
      const trace = new Date().toLocaleTimeString()

      const {hr} = this

      const _head = isTrace ? `begin: ${string} (${trace})` : string
      this.banner({string, color, hr})
      await this.#dent(1)
      const start = isTrace && Date.now()

      if (!_.isEmpty(input)) {
        await this.sub('input', () => {
          this.log(input)
        })
      }

      result = await closure()

      if (isLog && !_.isEmpty(result)) {
        await this.sub('output', () => {
          this.log(result)
        })
      }

      const end = isTrace && Date.now()
      await this.#dent(-1)
      const duration = isTrace && end - start
      // dbg('section: indent=%s, duration=%s', this.#indent, duration)

      if (isTrace) {
        this.banner({
          string: `end: ${string} (elapsed=${duration})`,
          color,
          hr,
        })
      }
    } else {
      result = await closure()
    }

    return result
  }
}

export function sectionIf({eye, string, input, isLog}, closure) {
  return eye ? eye.section({string, input, isLog}, closure) : closure()
}
