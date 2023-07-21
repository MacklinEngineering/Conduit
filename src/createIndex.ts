import {ensureIndexes} from './app';
import {delay} from './delay';

const defaultDelay = parseInt(process.env.DELAY || '') || 10;

const initializeIndex = async () => {
  await ensureIndexes();
  await delay(defaultDelay);
  console.log('## init-test-index script end ##');
};

initializeIndex().then(() => process.exit());
