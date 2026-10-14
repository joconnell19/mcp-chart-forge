/**
 * Builds the anonymous "Swedemom production bonus survey" Google Form (v3, branching).
 * How to run: script.google.com > New project, paste this file, Run createSurvey,
 * approve the Forms permission once. The log prints the edit and share links.
 * Questions mirror survey-draft.md. Branding (purple theme, header image) is set
 * in the Forms UI afterwards: Customize theme.
 *
 * Flow: everyone picks the kinds of work they do and their main job, sees ONE
 * stage page for their main job, then the shared pages. Negative or "rarely"
 * answers branch to a short follow-up that asks why.
 */
function createSurvey() {
  var form = FormApp.create('Swedemom production bonus survey');
  form.setDescription(
    "We're thinking about adding a production bonus on top of your hourly wage, and we want your honest take " +
    "before anything is decided, including criticism. This survey is anonymous: it does not collect your name or email, " +
    "and only overall results are shared. It takes about 8 to 10 minutes. Please read the proposal first " +
    "(it's attached to the email with this survey).");

  // Anonymity: no email, no sign-in, no one-response limit (that needs sign-in).
  form.setCollectEmail(false);
  try { form.setEmailCollectionType(FormApp.EmailCollectionType.DO_NOT_COLLECT); } catch (e) {}
  try { form.setRequireLogin(false); } catch (e) {} // Workspace only
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setPublishingSummary(false);
  form.setProgressBar(true);
  form.setConfirmationMessage("Thank you! Your answers are anonymous. We'll share what we heard, and the updated plan, before anything changes.");

  function mc(title, options, required, help) {
    var it = form.addMultipleChoiceItem().setTitle(title).setRequired(!!required);
    if (options) it.setChoiceValues(options);
    if (help) it.setHelpText(help);
    return it;
  }
  function checks(title, options, other, required, help) {
    var it = form.addCheckboxItem().setTitle(title).setChoiceValues(options).showOtherOption(!!other).setRequired(!!required);
    if (help) it.setHelpText(help);
    return it;
  }
  function scale(title, low, high, required) {
    return form.addScaleItem().setTitle(title).setBounds(1, 5).setLabels(low, high).setRequired(!!required);
  }
  function para(title, required, help) {
    var it = form.addParagraphTextItem().setTitle(title).setRequired(!!required);
    if (help) it.setHelpText(help);
    return it;
  }
  function page(title, help) {
    var p = form.addPageBreakItem().setTitle(title);
    if (help) p.setHelpText(help);
    return p;
  }
  // Set choices whose answers jump to a page. map: [[label, pageBreakItem], ...]
  function route(item, map) {
    item.setChoices(map.map(function (m) { return item.createChoice(m[0], m[1]); }));
  }

  var STAGES = ['Sorting', 'Intake + description', 'Imaging', 'Put-away', 'Fulfillment (pulling, packing, shipping)', 'Other work (store, truck, office, inventory checks)'];
  var METHODS = ['Camera intake with a phone', 'Camera intake with a webcam', 'Barcode scan', 'Exact match', 'Keyword search', 'Typing it in by hand'];

  // ---- Page 1: Your work --------------------------------------------------
  form.addSectionHeaderItem().setTitle('Your work')
    .setHelpText('These two questions decide which questions you see next, so you only get the ones about your work.');
  checks('Which kinds of work do you do? Select all that apply.', STAGES.concat(['Prefer not to say']), false, false);
  var mainJob = mc('Which one is your main job?', null, true, 'The one you spend the most time on. You will answer a few questions about it.');

  // ---- Stage pages ---------------------------------------------------------
  var pSort = page('Sorting', 'A few questions about sorting.');
  checks('What slows sorting down the most?', [
    'Deciding what is worth listing', 'The Sort tool is slow or awkward', 'Not enough space or carts',
    'Too many low-value items to get through', 'Clothing and textiles are hard to judge', 'Nothing much'], true, false);
  var sortUse = mc('How often do you use the Sort tool when you sort?', null, true);

  var pSortWhy = page('The Sort tool', 'Thanks for being honest. The Sort tool is how sorting gets credited, so we want to make it work for you.');
  checks('What keeps you from using the Sort tool more?', [
    "It's slower than eyeballing the box", 'Its price estimates feel wrong', "I don't have a phone or device handy",
    "I haven't been shown how", "I'm not sure it matters"], true, true);
  para('In your own words, why? What would get you to use it on most items?', true);

  var pIntake = page('Intake + description', 'A few questions about how you take items in.');
  checks('Which ways do you start an item? Select all you use.', METHODS, true, true);
  mc('Which one do you use most?', METHODS, true);
  checks("What's missing or not working at your intake station?", [
    'A dedicated phone or camera', 'A faster computer', 'Barcode scanner', 'Label printer or labels',
    'A scale', 'Ruler or measuring tape', 'Good lighting or a clean background', 'Nothing, my station is set up well'], true, false);
  var camUse = mc('How often do you use camera intake (phone or webcam) to start an item?', null, true,
    'Camera intake is usually the fastest way to start an item, but we know it does not fit every item or every station.');

  var pCamWhy = page('Camera intake', "Thanks for being honest. We want to know what's in the way, so we can fix it.");
  checks('What gets in the way of using camera intake more?', [
    'No dedicated phone or camera at my station', "I don't want to use my personal phone",
    'Photos come out blurry (webcam or lighting)', 'My computer is slow', 'The results are wrong too often',
    'Keywords or typing are faster for me', "I haven't been shown how", "It doesn't fit the items I usually get"], true, true);
  para('In your own words, why do you use the method you use most?', true);
  para('What would get you to use camera intake on most items?', false);

  var pImaging = page('Imaging', 'A few questions about imaging.');
  checks('What slows imaging down the most?', [
    'Getting items to and from my station', 'Lighting or backgrounds', 'Camera or phone problems',
    'Uploading or the Hub is slow', 'Items that need cleaning or unpacking first', 'Re-imaging items that came back', 'Nothing much'], true, false);
  mc('When one of your items is sent back for re-imaging, do you find out?',
    ['Yes, usually', 'Sometimes', 'Rarely or never', 'Not sure'], false);
  para('Anything about your imaging setup we should fix?', false);

  var pFulfill = page('Put-away and fulfillment', 'A few questions about put-away, pulling, packing and shipping.');
  checks('What slows this work down the most?', [
    'Finding the right bin or item', 'Items in the wrong bin', 'Carts or space', 'Packing supplies',
    'Fragile or oddly shaped items', 'Printing labels or the Hub is slow', 'Nothing much'], true, false);
  mc('Would a one-tap "fragile risk" flag (sends an item to a lead before it ships) help you?',
    ['Yes', 'Maybe', 'No', 'Not sure'], false);
  para('Anything about put-away or fulfillment we should fix?', false);

  var pOther = page('Other work', "Some work isn't part of the bonus yet.");
  para("What work do you do that the bonus plan doesn't cover yet?", false);
  checks("Some important work isn't part of the bonus yet, like checking that items are in the right bin and clearing out stale inventory. How should we reward it?",
    ['Standard minutes, like a production stage', 'A team goal for that work', 'Paid as normal, no bonus (like today)', 'Not sure'], true, false);

  // ---- Shared pages ----------------------------------------------------------
  var pOverall = page('Overall');
  scale('How clear was the proposal?', 'Very confusing', 'Very clear', true);
  checks('Which parts of the idea appeal to you most?', [
    'Earning more when I clear the bar', 'The weekly team goal', 'My wage never goes down',
    'Being measured against the bar, not coworkers', 'Seeing my progress live in the Hub',
    'Fast feedback on my work, with photos when something goes wrong',
    'Better tools and equipment before anything is paid', 'A practice run before real money'], true, false);
  var feel = mc('Overall, how do you feel about a production bonus like the one in the proposal?', null, true);

  var pFeelWhy = page('Tell us more', 'Thanks for being honest. Critical feedback is exactly what we need before anything is decided.');
  para('What would need to change for this to feel good to you?', true);

  var pHow = page('How it should work');
  mc('If we had a set amount to spend on bonuses, how should it be split?',
    ['Mostly individual bonuses', 'About half individual, half team', 'Mostly team bonuses', 'Not sure'], true);
  mc('How should we start?',
    ['Team goals and individual bonuses together', 'Team goals first, individual bonuses later', 'Not sure'], false);
  scale('How motivating would a weekly team goal for your stage be?', 'Not at all', 'Very', false);
  mc('If you work in more than one stage, your team bonus would follow your mix of work (for example 60% imaging, 40% intake). Does that seem fair?',
    ['Yes', 'No', 'Not sure', "Doesn't apply to me"], false);
  mc('How often would you like to see your progress?',
    ['Live in the Hub during the day', 'Once a day', 'Once a week', 'Only on payday'], false);
  var half = mc('Above the bar, you keep half of the time you save and Swedemom keeps half. How does that feel?', null, true);

  var pHalfWhy = page('Your share');
  para('What share would feel fair to you, and why?', true);

  var pTime = page('Tracking time',
    'To pay a bonus fairly, we need accurate production hours. That means clocking in and out, and a quick way to mark ' +
    'time spent on other work (truck runs, wrapping glass, meetings) so it never counts against your pace. Breaks are ' +
    'handled automatically. We want this to be as painless as possible.');
  mc('Where would clocking in and out be easiest for you?',
    ['In the Hub, with my production work', 'In Gusto, like now', 'No preference'], false);
  var timer = mc('How would a one-tap timer in the Hub for other work feel?', null, true);

  var pTimeWhy = page('Making time tracking painless',
    'Thanks for being honest. We do need some way to track time spent on other work, so help us make it as easy as possible.');
  para('What would make it less annoying, or how else could we track that time fairly?', true);

  var pWords = page('In your words');
  para('What would make a bonus like this feel fair to you?', false);
  para('What slows you down most at work that we could fix?', false);
  para('Anything else you want us to know?', false);

  // ---- Routing ---------------------------------------------------------------
  route(mainJob, [
    ['Sorting', pSort], ['Intake + description', pIntake], ['Imaging', pImaging],
    ['Put-away', pFulfill], ['Fulfillment (pulling, packing, shipping)', pFulfill],
    ['Other work (store, truck, office, inventory checks)', pOther], ['Prefer not to say', pOverall]]);
  route(sortUse, [['On almost every item', pOverall], ['Sometimes', pSortWhy], ['Rarely', pSortWhy], ['Never', pSortWhy]]);
  route(camUse, [['On almost every item', pOverall], ['Sometimes', pCamWhy], ['Rarely', pCamWhy], ['Never', pCamWhy]]);
  route(feel, [['Very positive', pHow], ['Somewhat positive', pHow], ['Neutral', pHow],
    ['Somewhat negative', pFeelWhy], ['Very negative', pFeelWhy]]);
  route(half, [['Fair', pTime], ['Too little for us', pHalfWhy], ['Not sure', pTime]]);
  route(timer, [['Easy, no problem', pWords], ['A little annoying', pTimeWhy], ['Very annoying', pTimeWhy], ['Not sure', pWords]]);

  // "After this section" jumps are set on the page break that FOLLOWS each section.
  pIntake.setGoToPage(pOverall);   // after the Sort tool follow-up
  pImaging.setGoToPage(pOverall);  // after the camera intake follow-up
  pFulfill.setGoToPage(pOverall);  // after Imaging
  pOther.setGoToPage(pOverall);    // after Put-away and fulfillment
  // Other work -> Overall, feel-why -> How, half-why -> Time, time-why -> Words run in order.

  Logger.log('Edit:  ' + form.getEditUrl());
  Logger.log('Share: ' + form.getPublishedUrl());
}
