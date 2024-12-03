import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { initPageConsoleErrorCatch, saveDocAndAssert } from '../helpers'
import { AdminUrlUtil } from '../helpers/adminUrlUtil'
import { initPayloadE2E } from '../helpers/configHelpers'

const { beforeAll, describe } = test

describe('Admin Panel', () => {
  let page: Page
  let url: AdminUrlUtil

  beforeAll(async ({ browser }) => {
    const { serverURL } = await initPayloadE2E(__dirname)
    url = new AdminUrlUtil(serverURL, 'posts')

    const context = await browser.newContext()
    page = await context.newPage()
    initPageConsoleErrorCatch(page)
  })

  test('create page -> save draft', async () => {
    await page.goto(url.create)

    await page.getByLabel('Title').fill('new post')
    await saveDocAndAssert(page, '#action-save-draft')

    const slugField = page.getByLabel('Slug')
    await expect(slugField).toHaveValue('new-post')
  })

  test('create page -> publish', async () => {
    await page.goto(url.create)

    await page.getByLabel('Title').fill('new post')
    await saveDocAndAssert(page, '#action-save')

    const slugField = page.getByLabel('Slug')
    await expect(slugField).toHaveValue('new-post')
  })

  test('edit page -> save draft', async () => {
    await page.goto(url.create)
    // create an empty document
    await page.getByLabel('Title').fill('old title')
    await saveDocAndAssert(page, '#action-save-draft')

    const slugField = page.getByLabel('Slug')
    await expect(slugField).toHaveValue('old-title')

    // fill the title field and save
    const titleField = page.getByLabel('Title')
    await titleField.fill('new title')
    await saveDocAndAssert(page, '#action-save-draft')

    // slug should be populated by the beforeChange hook
    await expect(slugField).toHaveValue('new-title')
  })

  test('edit page -> publish', async () => {
    await page.goto(url.create)
    // create an empty document
    await page.getByLabel('Title').fill('old title')
    await saveDocAndAssert(page, '#action-save')

    const slugField = page.getByLabel('Slug')
    await expect(slugField).toHaveValue('old-title')

    // fill the title field and save
    const titleField = page.getByLabel('Title')
    await titleField.fill('new title')
    await saveDocAndAssert(page, '#action-save')

    // slug should be populated by the beforeChange hook
    await expect(slugField).toHaveValue('new-title')
  })
})
