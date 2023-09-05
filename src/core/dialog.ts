import { TourGuideClient } from '../Tour';
import { computeDots, dotsWrapperHtmlString } from './dots';
import { arrow, autoPlacement, computePosition, offset, Placement, shift } from '@floating-ui/dom';

/**
 * createTourGuideDialog
 */
async function createTourGuideDialog(this: TourGuideClient) {
  // Create base tour dialog element
  this.dialog = document.createElement('div');
  this.dialog.classList.add('tg-dialog');

  // Render HTML content
  await renderDialogHtml(this).then(html => {
    this.dialog.innerHTML = html;
  });

  document.body.append(this.dialog);

  return true;
}

/**
 * renderDialogHtml
 * @param tgInstance
 */
async function renderDialogHtml(tgInstance: TourGuideClient) {
  /** Update dialog options **/
  if (tgInstance.options.dialogClass) {
    tgInstance.dialog.classList.add(tgInstance.options.dialogClass);
  }

  if (tgInstance.options.dialogZ) {
    tgInstance.dialog.style.zIndex = String(tgInstance.options.dialogZ);
  }

  tgInstance.dialog.style.width = tgInstance.options.dialogWidth
    ? tgInstance.options.dialogWidth + 'px'
    : 'auto';
  if (tgInstance.options.dialogMaxWidth) {
    tgInstance.dialog.style.maxWidth = tgInstance.options.dialogMaxWidth + 'px';
  }

  /** Create dialog HTML **/
  let htmlRes = '';
  htmlRes += `<div class='tg-dialog-header'>`; // Open header
  htmlRes += `<div class="tg-dialog-title" id="tg-dialog-title"><!-- JS rendered --></div>`; // Title
  if (tgInstance.options.closeButton) {
    htmlRes += `<div class="tg-dialog-close-btn" id="tg-dialog-close-btn">`;
    htmlRes += `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.7273 3.3335L8.00065 7.06016L4.27398 3.3335L3.33398 4.2735L7.06065 8.00016L3.33398 11.7268L4.27398 12.6668L8.00065 8.94016L11.7273 12.6668L12.6673 11.7268L8.94065 8.00016L12.6673 4.2735L11.7273 3.3335Z" fill="#081708"/>
    </svg>
    `;
    htmlRes += `</div>`; // Close button
  } // end close button

  htmlRes += `</div>`; // Close header
  if (tgInstance.options.progressBar) {
    htmlRes += `<div class="tg-dialog-progress-bar"><span class="tg-bar" id="tg-dialog-progbar"></span></div>`; // Progress bar
  }

  htmlRes += `<div class="tg-dialog-body" id="tg-dialog-body"><!-- JS rendered --></div>`; // Body
  // Append dots if enabled for body as separate element
  if (tgInstance.options.showStepDots && tgInstance.options.stepDotsPlacement === 'body') {
    const dotsWrapperHtml = dotsWrapperHtmlString();
    if (dotsWrapperHtml) htmlRes += dotsWrapperHtml;
  }

  htmlRes += `<div class="tg-dialog-footer">`; // Start footer

  // Append prev button if enabled
  let prevBtnClass = 'tg-dialog-btn';
  let prevDisabled = 'false';
  if (tgInstance.activeStep === 0) {
    prevDisabled = 'true';
    prevBtnClass += ' disabled';
  }

  htmlRes += '<div class="tg-dialog-footer-sup">';

  // Append dots if enabled for FOOTER
  if (tgInstance.options.showStepDots && tgInstance.options.stepDotsPlacement === 'footer') {
    const dotsWrapperHtml = dotsWrapperHtmlString();
    if (dotsWrapperHtml) htmlRes += dotsWrapperHtml;
  }

  // Show step progress if enabled
  if (tgInstance.options.showStepProgress) {
    htmlRes += `<span class="tg-step-progress" id="tg-step-progress"><!-- JS rendered --></span>`;
  }

  htmlRes += '</div>';

  htmlRes += '<div class="tg-footer-btn">';

  if (tgInstance.options.showButtons && !tgInstance.options.hidePrev) {
    htmlRes +=
      `<button type="button" class="` +
      prevBtnClass +
      `" id="tg-dialog-prev-btn" disabled="` +
      prevDisabled +
      `">${tgInstance.options.prevLabel}</button>`;
  }

  // Append next button if enabled
  if (tgInstance.options.showButtons && !tgInstance.options.hideNext) {
    htmlRes += `<button type="button" class="tg-dialog-btn tg-dialog-btn-next" id="tg-dialog-next-btn">${tgInstance.options.nextLabel}</button>`;
  }

  htmlRes += '</div>';

  htmlRes += `</div>`; // End footer

  htmlRes += `<div id="tg-arrow" class="tg-arrow"></div><!-- end tour arrow -->`;

  return htmlRes;
}

/**
 * updateDialogHtml
 * @param tgInstance
 */
function updateDialogHtml(tgInstance: TourGuideClient) {
  return new Promise((resolve, reject) => {
    // Check step data
    const stepData = tgInstance.tourSteps[tgInstance.activeStep];
    if (!stepData) reject('No active step data');

    // Header
    const tgHeader = document.querySelector('.tg-dialog-header') as HTMLElement;
    if (tgHeader) tgHeader.style.display = stepData.hideHeader ? 'none' : '';
    // Title
    const tgTitle = document.getElementById('tg-dialog-title');
    if (tgTitle) tgTitle.innerHTML = stepData.title ? stepData.title : '';

    // Body
    const tgBody = document.getElementById('tg-dialog-body');
    if (tgBody && stepData) {
      if (typeof stepData.content === 'string') {
        tgBody.innerHTML = stepData.content ? stepData.content : '';
      } else {
        tgBody.innerHTML = '';
        tgBody.append(stepData.content);
      }
    }

    // Dots - use computeDots()
    const tgDots = document.getElementById('tg-dialog-dots');
    if (tgDots && tgInstance.options.showStepDots && computeDots(tgInstance))
      tgDots.innerHTML = computeDots(tgInstance);

    // Back button
    const backBtn = document.getElementById('tg-dialog-prev-btn');
    if (backBtn) {
      if (tgInstance.activeStep === 0) {
        backBtn.classList.add('disabled');
        backBtn.setAttribute('disabled', 'true');
      } else {
        backBtn.classList.remove('disabled');
        backBtn.removeAttribute('disabled');
      }
      backBtn.innerHTML = (
        stepData.prevLabel != undefined ? stepData.prevLabel : tgInstance.options.prevLabel
      ) as string;
      backBtn.style.visibility = stepData.hidePrev ? 'hidden' : 'visible';
    }

    // Next/Finish button
    const nextBtn = document.getElementById('tg-dialog-next-btn');
    if (nextBtn) {
      nextBtn.innerHTML = (
        stepData.nextLabel != undefined
          ? stepData.nextLabel
          : tgInstance.activeStep + 1 >= tgInstance.tourSteps.length
          ? tgInstance.options.finishLabel
          : tgInstance.options.nextLabel
      ) as string;
      nextBtn.style.visibility = stepData.hideNext ? 'hidden' : 'visible';
    }

    // Step progress
    const tgProgress = document.getElementById('tg-step-progress');
    if (tgProgress && tgInstance.options.stepFomat) {
      tgProgress.innerHTML = tgInstance.options.stepFomat
        .replace('$currentStep', (tgInstance.activeStep + 1).toString())
        .replace('$stepLength', tgInstance.tourSteps.length.toString());
      tgProgress.style.visibility = stepData.hideStep ? 'hidden' : 'visible';
    }

    // Progress bar
    const tgProgBar = document.getElementById('tg-dialog-progbar');
    if (tgProgBar) {
      if (tgInstance.options.progressBar)
        tgProgBar.style.backgroundColor = tgInstance.options.progressBar;
      tgProgBar.style.width =
        ((tgInstance.activeStep + 1) / tgInstance.tourSteps.length) * 100 + '%';
    }

    resolve(true);
  });
}

/**
 * computeDialogPosition
 * @param tgInstance
 */
function computeDialogPosition(tgInstance: TourGuideClient) {
  return new Promise(async resolve => {
    const arrowElement: HTMLElement | null = document.querySelector('#tg-arrow');

    let targetElem = tgInstance.tourSteps[tgInstance.activeStep].target as HTMLElement;

    // Center position if body
    if (targetElem === document.body) {
      // apply positioning
      Object.assign(tgInstance.dialog.style, {
        top: `${window.innerHeight / 2.25 - tgInstance.dialog.clientHeight / 2}px`,
        left: `${window.innerWidth / 2 - tgInstance.dialog.clientWidth / 2}px`,
        position: 'fixed',
      });
      // Add fixed class
      tgInstance.dialog.classList.add('tg-dialog-fixed');
      // hide arrow
      if (arrowElement) arrowElement.style.display = 'none';
      return resolve(true);
    }

    // Affirm positioning method and arrow visibility
    tgInstance.dialog.style.position = 'absolute';
    // Remove fixed class
    tgInstance.dialog.classList.remove('tg-dialog-fixed');
    // Display arrow
    if (arrowElement) arrowElement.style.display = 'inline-block';

    // Apply floating-ui positioning
    computePosition(targetElem, tgInstance.dialog, {
      placement: tgInstance.options.dialogPlacement as Placement,
      middleware: [
        autoPlacement({
          autoAlignment: true,
        }),
        shift({ padding: 15 }),
        arrow({ element: arrowElement as HTMLElement }),
        offset(20),
      ],
    }).then(({ x, y, placement, middlewareData }) => {
      // apply positioning
      Object.assign(tgInstance.dialog.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      // Arrow data
      if (middlewareData.arrow) {
        const arrowX = middlewareData.arrow.x;
        const arrowY = middlewareData.arrow.y;
        const placeSide = placement.split('-')[0];

        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[placeSide];

        const isHorizontal = ['left', 'right'].includes(staticSide as string);

        // Position arrow
        if (arrowElement)
          Object.assign(arrowElement.style, {
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY + (isHorizontal ? 6 : 0)}px` : '',
            [staticSide as string]: '-4px',
          });
      }
      return resolve(true);
    });
  });
}

export { createTourGuideDialog, renderDialogHtml, updateDialogHtml, computeDialogPosition };
