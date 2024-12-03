import type { CollectionConfig } from '../../../../packages/payload/src/collections/config/types'

export const postsSlug = 'posts'

export const PostsCollection: CollectionConfig = {
  defaultSort: 'title',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'slug',
      type: 'text',
      hooks: {
        beforeChange: [({ data }) => (data.title ? data.title.replace(/\s/g, '-') : null)],
      },
    },
  ],
  slug: postsSlug,
  versions: {
    drafts: true,
  },
}
