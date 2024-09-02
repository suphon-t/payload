import type { CollectionConfig } from '../../../../packages/payload/src/collections/config/types'

import { BlocksFeature, lexicalEditor } from '../../../../packages/richtext-lexical/src'
import { MediaBlock } from '../../blocks/MediaBlock'

export const postsSlug = 'posts'

export const PostsCollection: CollectionConfig = {
  defaultSort: 'title',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => {
          return [...defaultFeatures, BlocksFeature({ blocks: [MediaBlock] })]
        },
      }),
    },
  ],
  slug: postsSlug,
}
