import assert from 'node:assert'
import chalk from 'chalk'
// import debug from '@watchmen/debug'
import {parseBoolean, pretty} from '@watchmen/helpr'
import {getEnvAsArray} from '@watchmen/configr/env'
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
  #enabled

  static color() {
    const rand = Math.floor(Math.random() * (Eye.colors.length - 1))
    return Eye.colors[rand]
  }

  constructor(namespace) {
    this.#namespace = namespace ?? import.meta.url
    // eslint-disable-next-line n/prefer-global/process
    this.#enabled = !parseBoolean(process.env.ICATCHR_DISABLED)
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
    return this.#enabled
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
    if (!this.enabled) return

    const {string = args, hr = this.hr, color = this.color} = args
    assert.ok(_.isString(string))

    const _hr = this.colored({string: hr, color})
    const _leader = this.colored({string: Eye.bannerLeader, color})
    console.log(this.line(_hr))
    console.log(this.line(`${_leader}${Eye.space}${string}`))
    console.log(this.line(_hr))
  }

  log(value) {
    if (!this.enabled) return

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
      const {hr} = this

      this.banner({
        string: isTrace ? `begin: ${string}` : string,
        color,
        hr,
      })

      await this.#dent(1)
      const start = Date.now()

      if (!_.isEmpty(input)) {
        await this.sub('input', () => {
          this.log(input)
        })
      }

      try {
        result = await closure({input})
      } catch (error) {
        await this.sub(`exception ${this.#elapsed({start})}`, () => {
          for (const line of this.getErrorLines(error)) {
            this.log(line)
          }
        })
        this.log(this.colored(this.hr))
        throw error
      }

      if (isLog && !_.isEmpty(result)) {
        await this.sub('output', () => {
          this.log(result)
        })
      }

      await this.#dent(-1)
      // dbg('section: indent=%s, duration=%s', this.#indent, duration)

      if (isTrace) {
        this.banner({
          string: `end: ${string} ${this.#elapsed({start})}`,
          color,
          hr,
        })
      }
    } else {
      result = await closure()
    }

    return result
  }

  getErrorLines(error) {
    const props = getEnvAsArray({
      name: 'ICATCHR_ERROR_PROPERTIES',
      dflt: ['stderr', 'stdout'],
    })

    let lines = _.reduce(
      props,
      (memo, v) => {
        let _v = error[v] ?? []

        if (!_.isEmpty(memo) && !_.isEmpty(_v)) {
          memo.push(this.colored(this.hr))
        }

        if (!_.isArray(_v)) {
          if (_.isString(v)) {
            _v = v.split('\n')
          } else {
            _v = pretty(_v).split('\n')
          }
        }

        return [...memo, ..._v]
      },
      [],
    )
    if (_.isEmpty(lines)) {
      lines = error.stack.split('\n')
    }

    return lines
  }

  #elapsed({start}) {
    return `(elapsed=${this.#duration({start})})`
  }

  #duration({start}) {
    return Date.now() - start
  }
}
