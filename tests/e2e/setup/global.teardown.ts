import { test as teardown } from '@playwright/test';
import { makeRepositoryHarness } from '../../utils/makeRepositoryHarness.ts';

teardown('Clear database after tests', async () => {
  const { cleanAll } = makeRepositoryHarness();

  await cleanAll();

  console.log('✅ Test database completely cleared after all E2E tests.');
});
