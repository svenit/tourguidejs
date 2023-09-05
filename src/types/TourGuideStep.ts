// Step type def
class TourGuideStep {
  title?: string;
  content!: string | HTMLElement | Element;
  target?: HTMLElement | Element | HTMLInputElement | string | null = null;
  fixed?: boolean = false;
  order?: number = 999;
  group?: string = 'tour';
  hideHeader?: boolean = false;
  hideStep?: boolean = false;
  hidePrev?: boolean = false;
  hideNext?: boolean = false;
  nextLabel?: string | undefined = undefined;
  prevLabel?: string | undefined = undefined;
  // Enter events
  beforeEnter?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => void | Promise<unknown>;
  afterEnter?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => void | Promise<unknown>;
  // Leave events
  beforeLeave?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => void | Promise<unknown>;
  afterLeave?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => void | Promise<unknown>;
}

export { TourGuideStep };
