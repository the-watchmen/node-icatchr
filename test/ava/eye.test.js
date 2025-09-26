import test from 'ava'
import debug from '@watchmen/debug'
import Eye from '../../src/index.js'

const dbg = debug(import.meta.url)

test('section', async (t) => {
  const eye = new Eye(dbg)
  await eye.section({msg: 'whut?'}, async () => {
    // dbg('inside section')
    eye.log('inside section')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    eye.log('inside section again')
  })
  t.pass()
})

test('nested', async (t) => {
  const eye = new Eye(dbg)
  await eye.section({msg: 'nest-1'}, async () => {
    eye.log('inside 1')
    await eye.section({msg: 'nest-2'}, async () => {
      eye.log('inside 2')
      await eye.section({msg: 'nest-3'}, async () => {
        eye.log('inside 3')
        await eye.section({msg: 'nest-4'}, async () => {
          eye.log('inside 4')
          await eye.section({msg: 'nest-5'}, async () => {
            eye.log('inside 5')
            await eye.section({msg: 'nest-6'}, async () => {
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
  eye.banner({msg: 'whut?'})
  // eye.log('ya')
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
