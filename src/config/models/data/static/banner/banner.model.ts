import { model } from 'mongoose';

import bannerSchema from './banner.schema';
import { IBannerDocument } from './banner.types';

/** Interactive mongoose banner model. */
export const bannerModel = model<IBannerDocument>('banner', bannerSchema);