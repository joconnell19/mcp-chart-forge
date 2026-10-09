/**
 * Builds the anonymous "Production bonus survey" Google Form in your Drive.
 * How to run: go to https://script.google.com > New project, paste this file,
 * click Run (function: createSurvey), approve the Forms permission once.
 * The log prints the edit link and the link to share with staff.
 * Questions mirror survey-draft.md.
 */
function createSurvey() {
  var form = FormApp.create('Production bonus survey');
  form.setDescription(
    "We're thinking about adding a production bonus on top of your hourly wage, and we want your honest take " +
    "before anything is decided. This survey is anonymous: it does not collect your name or email, and only " +
    "overall results are shared. It takes about 5 to 7 minutes. Please read the proposal first (it's attached to the email with this survey).");

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

  function choice(title, options, required) {
    return form.addMultipleChoiceItem().setTitle(title).setChoiceValues(options).setRequired(!!required);
  }
  function checks(title, options, other) {
    return form.addCheckboxItem().setTitle(title).setChoiceValues(options).showOtherOption(!!other).setRequired(false);
  }
  function scale(title, low, high, required) {
    return form.addScaleItem().setTitle(title).setBounds(1, 5).setLabels(low, high).setRequired(!!required);
  }
  function para(title) {
    return form.addParagraphTextItem().setTitle(title).setRequired(false);
  }

  // Section 1
  form.addSectionHeaderItem().setTitle('About your work (optional)');
  choice('Which best describes most of your work?',
    ['Intake, description or imaging', 'Sorting', 'Put-away or fulfillment', 'A mix of several jobs', 'Prefer not to say']);

  // Section 2
  form.addPageBreakItem().setTitle('Overall');
  scale('Overall, how do you feel about a production bonus like the one in the proposal?', 'Very negative', 'Very positive', true);
  scale('How clear was the proposal?', 'Very confusing', 'Very clear', true);
  checks('Which parts of the idea appeal to you most?', [
    'Earning more when I clear the bar',
    'The weekly team goal',
    'My wage never goes down',
    'Being measured against the bar, not coworkers',
    'Seeing my progress live in the Hub',
    'Fast feedback on my work, with photos when something goes wrong',
    'Better tools before anything is paid',
    'A practice run before real money'], true);

  // Section 3
  form.addPageBreakItem().setTitle('How it should work');
  choice('If we had a set amount to spend on bonuses, how should it be split?',
    ['Mostly individual bonuses', 'About half individual, half team', 'Mostly team bonuses', 'Not sure'], true);
  choice('Above the bar, you keep half of the time you save and Swedemom keeps half. How does that feel?',
    ['Fair', 'Too little for us', 'Not sure']);
  scale('How motivating would a weekly team goal for your stage be?', 'Not at all', 'Very', false);
  choice('If you work in more than one stage, your team bonus would follow your mix of work (for example 60% imaging, 40% intake). Does that seem fair?',
    ['Yes', 'No', 'Not sure', "Doesn't apply to me"]);
  choice('How often would you like to see your progress?',
    ['Live in the Hub during the day', 'Once a day', 'Once a week', 'Only on payday']);
  choice('Where would you rather clock in and out?',
    ['In the Hub, with my production work', 'In Gusto, like now', 'No preference']);
  choice('How would you feel about tapping a timer in the Hub for other work (truck runs, wrapping glass, meetings)?',
    ['Easy, no problem', 'A little annoying', 'Very annoying', 'Not sure']);
  checks("Some important work isn't part of the bonus yet, like checking that items are in the right bin and clearing out stale inventory. How should we reward it?",
    ['Standard minutes, like a production stage', 'A team goal for that work', 'Paid as normal, no bonus (like today)', 'Not sure'], true);

  // Section 4
  form.addPageBreakItem().setTitle('In your words');
  para('What would make a bonus like this feel fair to you?');
  para('What slows you down most at work that we could fix?');
  para('Anything else you want us to know?');

  Logger.log('Edit:  ' + form.getEditUrl());
  Logger.log('Share: ' + form.getPublishedUrl());
}
