/**
 *
 * ████████╗ ██████╗ ██╗   ██╗██████╗  ██████╗ ██╗   ██╗██╗██████╗ ███████╗         ██╗███████╗
 * ╚══██╔══╝██╔═══██╗██║   ██║██╔══██╗██╔════╝ ██║   ██║██║██╔══██╗██╔════╝         ██║██╔════╝
 *    ██║   ██║   ██║██║   ██║██████╔╝██║  ███╗██║   ██║██║██║  ██║█████╗           ██║███████╗
 *    ██║   ██║   ██║██║   ██║██╔══██╗██║   ██║██║   ██║██║██║  ██║██╔══╝      ██   ██║╚════██║
 *    ██║   ╚██████╔╝╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║██████╔╝███████╗    ╚█████╔╝███████║
 *    ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝╚═════╝ ╚══════╝     ╚════╝ ╚══════╝
 *
 */

// CORE
import TourGuideOptions from './core/options';
import { createTourGuideDialog } from './core/dialog';
import computeTourPositions from './core/positioning';
import { computeBackdropAttributes, createTourGuideBackdrop } from './core/backdrop';
import {
  handleOnAfterExit,
  handleOnAfterStepChange,
  handleOnBeforeExit,
  handleOnBeforeStepChange,
  handleOnFinish,
} from './core/callbacks';
import {
  clickOutsideHandler,
  handleDestroyListeners,
  handleInitListeners,
  keyPressHandler,
} from './core/listeners';
// Step Type
import { TourGuideStep } from './types/TourGuideStep';
// HANDLERS
import handleVisitStep, {
  handleVisitNextStep,
  handleVisitPrevStep,
} from './handlers/handleVisitStep';
import handleAddStep from './handlers/handleAddStep';
import handleTourStart from './handlers/handleTourStart';
import handleSetOptions from './handlers/handleSetOptions';
import handleClose from './handlers/handleClose';
import handleRefreshTour, { handleRefreshDialog } from './handlers/handleRefresh';
import handleFinishTour, { delFinishedTour, getIsFinished } from './handlers/handleFinishTour';
import handleCreateElement from './handlers/handleCreateElement';
// UTIL
import defaultOptions from './util/util_default_options';
import { computeMaskAttributes, createTourGuideMask } from './core/mask';

// Tour
class TourGuideClient {
  /**
   * Primary elements
   */
  backdrop: HTMLElement;
  dialog: HTMLElement;
  mask: HTMLElement;

  /**
   * Default Attributes
   */
  group: string = '';
  isVisible: boolean = false;
  activeStep: number = 0;
  tourSteps: TourGuideStep[] = [];
  options: TourGuideOptions = defaultOptions;
  public isFinished = getIsFinished;

  /**
   * Constructor
   * @param options
   */
  constructor(options?: TourGuideOptions) {
    this.dialog = document.createElement('div');
    this.backdrop = document.createElement('div');
    this.mask = document.createElement('div');
    this.options = defaultOptions;
    if (options) Object.assign(this.options, options); // overwrite default options
    this.createTourGuideDialog().catch(e => {
      if (this.options.debug) console.warn(e);
    });
    this.createTourGuideBackdrop();
  }

  /**
   * Backdrop / Target highlighter
   */
  public createTourGuideBackdrop = createTourGuideBackdrop;
  public computeBackdropAttributes = computeBackdropAttributes;

  /**
   * Dialog
   */
  public createTourGuideDialog = createTourGuideDialog;

  /**
   * Mask
   */
  public createTourGuideMask = createTourGuideMask;
  public computeMaskAttributes = computeMaskAttributes;

  /**
   * Methods
   */
  public start = handleTourStart; // Start the tour - compute steps -> goToStep (checks -> update dialog html, dialog & backdrop) -> initListeners()
  public visitStep = handleVisitStep; // visit step by stepIndex or `next` | `prev`
  public addSteps = handleAddStep; // Push new steps to the tour
  public reset = () => {
    this.isVisible = false;
    this.activeStep = 0;
    this.options.steps = [];
    this._globalFinishCallback = () => {};
    this._globalBeforeChangeCallback = () => {};
    this._globalAfterChangeCallback = () => {};
    this._globalBeforeExitCallback = () => {};
    this._globalAfterExitCallback = () => {};
    this.destroyListeners();
  };
  public nextStep = handleVisitNextStep; // navigate to next step - also handles calling finishTour() on final step
  public prevStep = handleVisitPrevStep; // navigate to previous step
  public exit = handleClose; // exit the tour
  public refresh = handleRefreshTour; // Recompute everything including tour guide steps
  public refreshDialog = handleRefreshDialog; // Recompute the dialog content & backdrop only
  public finishTour = handleFinishTour; // Set tour as complete in localStorage & exit - pass group key
  public updatePositions = computeTourPositions; // Set tour as complete in localStorage & exit - pass group key
  public deleteFinishedTour = delFinishedTour; // Remove a completed tour from localStorage. Pass group key or `all` to clear.
  public setOptions = handleSetOptions; // Update tour options & refresh dialog + backdrop
  public createEl = handleCreateElement;

  /**
   * Listeners
   */
  // Init
  public initListeners = handleInitListeners;
  // Destroy
  public destroyListeners = handleDestroyListeners;
  // Track initialised eventListeners
  public _trackedEvents = {
    nextBtnClickEvent: {
      initialized: false,
      fn: this.nextStep.bind(this),
    },
    prevBtnClickEvent: {
      initialized: false,
      fn: this.prevStep.bind(this),
    },
    closeBtnClickEvent: {
      initialized: false,
      fn: this.exit.bind(this),
    },
    keyPressEvent: {
      initialized: false,
      fn: keyPressHandler.bind(this),
    },
    outsideClickEvent: {
      initialized: false,
      fn: clickOutsideHandler.bind(this),
    },
  };

  /**
   * Callbacks
   */
  public _globalFinishCallback!: () => void | Promise<unknown>;
  public _globalBeforeExitCallback!: () => void | Promise<unknown>;
  public _globalAfterExitCallback!: Function;
  public _globalBeforeChangeCallback!: () => void | Promise<unknown>;
  public _globalAfterChangeCallback!: () => void | Promise<unknown>;

  // ON CLICK OUTSIDE
  public onClickOutside!: (tour: TourGuideClient) => void | Promise<unknown>;
  // FINISH
  readonly onFinish = handleOnFinish;
  // EXIT
  readonly onBeforeExit = handleOnBeforeExit;
  readonly onAfterExit = handleOnAfterExit;
  // STEP CHANGE
  readonly onBeforeStepChange = handleOnBeforeStepChange;
  readonly onAfterStepChange = handleOnAfterStepChange;
}

export { TourGuideClient };
