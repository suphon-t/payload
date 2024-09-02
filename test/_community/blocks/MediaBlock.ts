import type { Block } from '../../../packages/payload/src/fields/config/types'

import { mediaSlug } from '../collections/Media'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: mediaSlug,
      required: true,
    },
  ],
}
