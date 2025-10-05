import test from 'ava'
import debug from '@watchmen/debug'
import Eye, {sectionIf} from '../../src/index.js'

const dbg = debug(import.meta.url)

test('section', async (t) => {
  const eye = new Eye()
  await eye.section({string: 'whut?'}, async () => {
    eye.log('inside section')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    eye.log('inside section again')
  })
  t.pass()
})

test('input', async (t) => {
  const eye = new Eye()
  await eye.section({string: 'whut?', input: ['in-1', 'in-2']}, async () => {
    await eye.sub('inside', async () => {
      eye.log('inside section')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      eye.log('inside section again')
    })
  })
  t.pass()
})

test('output', async (t) => {
  const eye = new Eye()
  await eye.section('whut?', async () => {
    return ['out-1', 'out-2']
  })
  t.pass()
})

test('io', async (t) => {
  const eye = new Eye()
  await eye.section({string: 'whut?', input: ['in-1', 'in-2']}, async () => {
    return ['out-1', 'out-2']
  })
  t.pass()
})

test('nest', async (t) => {
  const eye = new Eye()
  await eye.section('nest-1', async () => {
    eye.log('inside 1')
    await eye.section('nest-2', async () => {
      eye.log('inside 2')
      await eye.section('nest-3', async () => {
        eye.log('inside 3')
        await eye.section('nest-4', async () => {
          eye.log('inside 4')
          await eye.section('nest-5', async () => {
            eye.log('inside 5')
            await eye.section('nest-6', async () => {
              eye.log('inside 6')
              await new Promise((resolve) => setTimeout(resolve, 100))
            })
            await new Promise((resolve) => setTimeout(resolve, 100))
          })
          await new Promise((resolve) => setTimeout(resolve, 100))
        })
        await new Promise((resolve) => setTimeout(resolve, 100))
      })
      await new Promise((resolve) => setTimeout(resolve, 100))
    })
    await new Promise((resolve) => setTimeout(resolve, 100))
  })
  t.pass()
})

test('banner', (t) => {
  const eye = new Eye()
  eye.banner({string: 'who?'})
  eye.banner('whut?')

  t.pass()
})

test('hr', (t) => {
  const eye = new Eye()
  console.log(eye.hr)
  t.pass()
})

test('colored', (t) => {
  const eye = new Eye()
  console.log(eye.colored({string: 'who?'}))
  console.log(eye.colored('whut?'))

  t.pass()
})

test('sub-nest', async (t) => {
  const eye = new Eye()
  await eye.section('section', async () => {
    await eye.sub('sub-1', async () => {
      eye.log('log-1')
      await eye.sub('sub-2', () => {
        eye.log('log-2')
      })
    })
    await eye.sub('sub-3', () => {
      eye.log('log-3')
    })
    await new Promise((resolve) => setTimeout(resolve, 100))
  })
  t.pass()
})

test('sub', async (t) => {
  const eye = new Eye()
  await eye.sub('sub-1', () => {
    eye.log('log-1')
  })
  t.pass()
})

test('section-if', (t) => {
  const eye = new Eye()
  let input = 'some-input'

  sectionIf({eye, string: 'some-string', input}, () => {
    dbg('section-if: input=%o', input)
  })

  input = 'other-input'

  sectionIf({string: 'some-string', input}, () => {
    dbg('section-if-nope: input=%o', input)
  })

  t.pass()
})
