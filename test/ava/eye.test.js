import test from 'ava'
import debug from '@watchmen/debug'
import Eye from '../../src/index.js'

const dbg = debug(import.meta.url)

test('section', async (t) => {
  const eye = new Eye(dbg)
  await eye.section({head: 'whut?'}, async () => {
    // dbg('inside section')
    eye.log('inside section')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    eye.log('inside section again')
  })
  t.pass()
})

test('input', async (t) => {
  const eye = new Eye(dbg)
  await eye.section({head: 'whut?', input: ['in-1', 'in-2']}, async () => {
    await eye.sub('inside', async () => {
      eye.log('inside section')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      eye.log('inside section again')
    })
  })
  t.pass()
})

test('output', async (t) => {
  const eye = new Eye(dbg)
  await eye.section({head: 'whut?'}, async () => {
    return ['out-1', 'out-2']
  })
  t.pass()
})

test('io', async (t) => {
  const eye = new Eye(dbg)
  await eye.section({head: 'whut?', input: ['in-1', 'out-1']}, async () => {
    return ['out-1', 'out-2']
  })
  t.pass()
})

test('nest', async (t) => {
  const eye = new Eye(dbg)
  await eye.section({head: 'nest-1'}, async () => {
    eye.log('inside 1')
    await eye.section({head: 'nest-2'}, async () => {
      eye.log('inside 2')
      await eye.section({head: 'nest-3'}, async () => {
        eye.log('inside 3')
        await eye.section({head: 'nest-4'}, async () => {
          eye.log('inside 4')
          await eye.section({head: 'nest-5'}, async () => {
            eye.log('inside 5')
            await eye.section({head: 'nest-6'}, async () => {
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
  const eye = new Eye(dbg)
  eye.banner({head: 'whut?'})
  t.pass()
})

test('hr', (t) => {
  const eye = new Eye(dbg)
  console.log(eye.hr)
  t.pass()
})

test('colored', (t) => {
  console.log(Eye.colored({msg: 'who?'}))
  t.pass()
})

test('sub-nest', async (t) => {
  const eye = new Eye(dbg)
  await eye.section({head: 'section'}, async () => {
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
  const eye = new Eye(dbg)
  await eye.sub('sub-1', () => {
    eye.log('log-1')
  })
  t.pass()
})
