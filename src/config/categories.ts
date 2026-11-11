import { FootBall } from './football';
import { SPORTS } from './sports';
import { EVENTS } from './events';
import { RssCategory } from '../types/types';

export { FootBall } from './football';
export { SPORTS } from './sports';
export { EVENTS } from './events';

export const ALL_CATEGORIES: RssCategory[] = [
    ...FootBall,
    ...SPORTS,
    ...EVENTS
];

export const CATEGORY_GROUPS = {
    football: {
        title: "Bóng đá",
        items: FootBall
    },
    sports: {
        title: "Các môn thể thao",
        items: SPORTS
    },
    events: {
        title: "Sự kiện & Công nghệ",
        items: EVENTS
    }
};

