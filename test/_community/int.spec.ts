import type { Payload } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import type { NextRESTClient } from '../helpers/NextRESTClient.js'

import { devUser } from '../credentials.js'
import { initPayloadInt } from '../helpers/initPayloadInt.js'
import { postsSlug } from './collections/Posts/index.js'

let payload: Payload
let token: string
let restClient: NextRESTClient

const { email, password } = devUser
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

describe('_Community Tests', () => {
  // --__--__--__--__--__--__--__--__--__
  // Boilerplate test setup/teardown
  // --__--__--__--__--__--__--__--__--__
  beforeAll(async () => {
    const initialized = await initPayloadInt(dirname)
    ;({ payload, restClient } = initialized)

    const data = await restClient
      .POST('/users/login', {
        body: JSON.stringify({
          email,
          password,
        }),
      })
      .then((res) => res.json())

    token = data.token
  })

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  })

  // --__--__--__--__--__--__--__--__--__
  // You can run tests against the local API or the REST API
  // use the tests below as a guide
  // --__--__--__--__--__--__--__--__--__

  it('deleting relation causes GraphQL error on later get', async () => {
    const post1 = await payload.create({
      collection: postsSlug,
      data: {
        title: 'Post 1',
      },
      context: {},
    })
    await payload.updateGlobal({
      slug: 'home',
      data: {
        topPosts: [
          {
            post: post1.id,
            caption: 'The best post out there',
          },
        ],
      },
      depth: 1,
    })

    const query = `query {
      Home {
        topPosts {
          post {
            title
          }
        }
      }
    }`
    const beforeDelete = await restClient
      .GRAPHQL_POST({ body: JSON.stringify({ query }) })
      .then((res) => res.json())
    expect(beforeDelete.errors).toBeUndefined()
    expect(beforeDelete.data.Home.topPosts).toEqual([
      expect.objectContaining({ post: { title: 'Post 1' } }),
    ])

    await payload.delete({
      collection: postsSlug,
      id: post1.id,
    })

    const afterDelete = await restClient
      .GRAPHQL_POST({ body: JSON.stringify({ query }) })
      .then((res) => res.json())
    expect(afterDelete.errors).toBeUndefined()
  })
})
