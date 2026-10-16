/** Stage builds are always noindex; production flips this on at launch. */
export const isStage = import.meta.env.DEPLOY_ENV === 'stage';

/**
 * TODO(launch): set to true when the real page ships and the client approves
 * indexing. Also remove `skipAudits` from lighthouserc.json.
 */
export const indexable = false;

export const noindex = isStage || !indexable;
