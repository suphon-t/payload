import { GraphQLClient } from 'graphql-request'

import payload from '../../packages/payload/src'
import { devUser } from '../credentials'
import { initPayloadTest } from '../helpers/configHelpers'
import { postsSlug } from './collections/Posts'

require('isomorphic-fetch')

let apiUrl
let jwt
let graphQLClient: GraphQLClient
let postId: string

const headers = {
  'Content-Type': 'application/json',
}
const { email, password } = devUser
describe('_Community Tests', () => {
  // --__--__--__--__--__--__--__--__--__
  // Boilerplate test setup/teardown
  // --__--__--__--__--__--__--__--__--__
  beforeAll(async () => {
    const { serverURL } = await initPayloadTest({ __dirname, init: { local: false } })
    apiUrl = `${serverURL}/api`

    const response = await fetch(`${apiUrl}/users/login`, {
      body: JSON.stringify({
        email,
        password,
      }),
      headers,
      method: 'post',
    })

    const data = await response.json()
    jwt = data.token

    const graphQLURL = `${apiUrl}/graphql`
    graphQLClient = new GraphQLClient(graphQLURL)

    const posts = await payload.find({
      collection: postsSlug,
      where: {
        title: {
          equals: 'title1',
        },
      },
    })
    postId = posts.docs[0].id as string
  })

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy(payload)
    }
  })

  // --__--__--__--__--__--__--__--__--__
  // You can run tests against the local API or the REST API
  // use the tests below as a guide
  // --__--__--__--__--__--__--__--__--__

  it('rest API example', async () => {
    const post = await fetch(`${apiUrl}/${postsSlug}/${postId}`, {
      headers: {
        ...headers,
        Authorization: `JWT ${jwt}`,
      },
    }).then((res) => res.json())

    const block = post.content.root.children[0].fields
    expect(block).toMatchObject(
      expect.objectContaining({
        media: expect.objectContaining({
          id: expect.any(String),
          filename: expect.any(String),
        }),
      }),
    )
  })

  it('graphql API example', async () => {
    const result = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `JWT ${jwt}`,
      },
      body: JSON.stringify({
        query: `
          {
            Posts {
              docs {
                content
              }
            }
          }
        `,
      }),
    }).then((res) => res.json())
    const post = result.data.Posts.docs[0]
    const block = post.content.root.children[0].fields
    expect(block).toMatchObject(
      expect.objectContaining({
        media: expect.objectContaining({
          id: expect.any(String),
          filename: expect.any(String),
        }),
      }),
    )
  })
})
