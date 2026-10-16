import { indexable } from './launch';

/** Stage builds are always noindex; production flips on at launch (launch.ts). */
export const isStage = import.meta.env.DEPLOY_ENV === 'stage';

export { indexable };

export const noindex = isStage || !indexable;
