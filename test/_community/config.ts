import { buildConfigWithDefaults } from '../buildConfigWithDefaults'
import { devUser } from '../credentials'
import { MediaCollection, mediaSlug } from './collections/Media'
import { PostsCollection, postsSlug } from './collections/Posts'
import { UsersCollection } from './collections/Users'
import { MenuGlobal } from './globals/Menu'

export default buildConfigWithDefaults({
  // ...extend config here
  collections: [
    UsersCollection,
    PostsCollection,
    MediaCollection,
    // ...add more collections here
  ],
  globals: [
    MenuGlobal,
    // ...add more globals here
  ],
  graphQL: {
    schemaOutputFile: './test/_community/schema.graphql',
  },

  onInit: async (payload) => {
    await payload.create({
      collection: 'users',
      data: {
        email: devUser.email,
        password: devUser.password,
      },
    })

    const { id: mediaId } = await payload.create({
      collection: mediaSlug,
      file: {
        data: Buffer.from(''),
        mimetype: '',
        name: 'test-file',
        size: 0,
      },
      data: {},
    })

    await payload.create({
      collection: postsSlug,
      data: {
        text: 'example post',
        title: 'title1',
        content: JSON.stringify({
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                format: '',
                type: 'block',
                version: 2,
                fields: {
                  id: '66d56d021346e1a11780ec78',
                  blockName: '',
                  blockType: 'mediaBlock',
                  media: mediaId,
                },
              },
            ],
          },
        }),
      },
    })
  },
})
