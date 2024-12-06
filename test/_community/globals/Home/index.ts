import type { GlobalConfig } from 'payload'

export const homeSlug = 'home'

export const HomeGlobal: GlobalConfig = {
  slug: homeSlug,
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'topPosts',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'post',
          type: 'relationship',
          relationTo: 'posts',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
