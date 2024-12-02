import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { ensureCompilationIsDone, initPageConsoleErrorCatch } from '../helpers.js'
import { AdminUrlUtil } from '../helpers/adminUrlUtil.js'
import { initPayloadE2ENoConfig } from '../helpers/initPayloadE2ENoConfig.js'
import { TEST_TIMEOUT_LONG } from '../playwright.config.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

test.describe('Admin Panel', () => {
  let page: Page
  let url: AdminUrlUtil

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(TEST_TIMEOUT_LONG)

    const { payload, serverURL } = await initPayloadE2ENoConfig({ dirname })
    url = new AdminUrlUtil(serverURL, 'posts')

    const context = await browser.newContext()
    page = await context.newPage()
    initPageConsoleErrorCatch(page)
    await ensureCompilationIsDone({ page, serverURL })
  })

  test('document status should not be published after publishing an invalid draft', async () => {
    await page.goto(url.list)

    // create a new post and save draft
    await page.getByLabel('Create new Post').click()
    await page.getByRole('button', { name: 'Save Draft' }).click()

    // wait for the draft to be created
    const status = page.getByTitle('Status: ')
    await status.waitFor()
    await expect(status).toHaveText(/Draft/)

    // don't fill the title field and click publish
    await page.getByRole('button', { name: 'Publish changes' }).click()
    // the title field is required, so wait for the validation to fail
    await page.getByText('This field is required.').waitFor()

    // because the validation has failed, the post should stay in draft state
    await expect(status).not.toHaveText(/Published/)
  })

  test('document status should change to draft after being unpublished', async () => {
    await page.goto(url.list)

    // create a new post and publish it
    await page.getByLabel('Create new Post').click()
    await page.getByLabel('Title*').fill('my new post')
    await page.getByRole('button', { name: 'Publish changes' }).click()

    // wait for the post to be published
    const status = page.getByTitle('Status: ')
    await status.waitFor()
    await expect(status).toHaveText(/Published/)

    // click unpublish
    await page.getByRole('button', { name: 'Unpublish' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    // the status should change to draft
    await expect(status).toHaveText(/Draft/)
  })
})
