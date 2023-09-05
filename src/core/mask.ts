import { TourGuideClient } from '../Tour';

function createTourGuideMask(this: TourGuideClient) {
  this.mask = document.createElement('div');
  this.computeMaskAttributes();
  document.body.append(this.mask);
}

function computeMaskAttributes(this: TourGuideClient) {
  this.mask.className = 'tg-mask';
  if (this.options.dialogZ) {
    this.mask.style.zIndex = (this.options.dialogZ - 1).toString();
  }
}

export { createTourGuideMask, computeMaskAttributes };
