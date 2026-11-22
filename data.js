const sources = {
  uc: ['UC deadlines','https://admission.universityofcalifornia.edu/how-to-apply/applying-as-a-first-year/dates-and-deadlines.html'],
  uctest: ['UC testing policy','https://admission.universityofcalifornia.edu/how-to-apply/applying-as-a-first-year/filling-out-the-application.html'],
  ucas: ['UCAS deadlines','https://www.ucas.com/applying/applying-to-university/dates-and-deadlines-for-uni-applications'],
  fafsa: ['FAFSA deadlines','https://studentaid.gov/apply-for-aid/fafsa/fafsa-deadlines'],
  css: ['CSS Profile','https://cssprofile.collegeboard.org/'],
  sat: ['SAT dates','https://satsuite.collegeboard.org/sat/dates-deadlines'],
  common: ['Common App guide','https://www.commonapp.org/apply/first-year-students'],
  dofe: ['DofE award levels','https://www.dofe.org/do/'],
  mit: ['MIT testing','https://mitadmissions.org/apply/firstyear/tests-scores/']
};

const milestones = [
  ['counsellor','2026-12-15','Profile','Meet the school counsellor','Ask about the US application process, predicted grades and award options. Start an activities log with dates and evidence.'],
  ['bronze','2027-01-31','Profile','Decide on DofE Bronze','Ask what the school can support and confirm progression and time requirements before committing.','dofe'],
  ['math','2027-04-30','Academics','Keep building the maths track','Continue competition practice and record what you learned from a problem or project.'],
  ['ome','2028-01-31','Academics','Check OME entry and selection','Confirm eligibility, regional registration and progression with the organiser and school.'],
  ['levels','2028-03-31','Academics','Choose A-Level subjects','Discuss Maths, Further Maths and Physics. Add Economics only if the workload supports strong predicted grades.'],
  ['igcse','2028-06-30','Academics','Complete IGCSE exams','Use the school exam timetable. Save results for application reporting.'],
  ['satprep','2028-07-31','Testing','Take an SAT diagnostic','Use the results to plan preparation. Treat 1550+ as a planning target.','sat'],
  ['satsit','2028-11-30','Testing','Sit the SAT','Check Madrid-area seats, registration and score release dates.','sat'],
  ['summer','2029-01-31','Academics','Apply to maths summer programmes','Research RSI, PROMYS, Ross, SUMaC and Mathcamp. Check each programme’s deadline, eligibility, prerequisites and aid.'],
  ['project','2029-04-30','Profile','Finish a maths or Python project','Write up the question, method, limitations and results. For a backtest, avoid look-ahead bias and compare with a baseline.'],
  ['retest','2029-05-31','Testing','Decide whether to retake the SAT','Check school testing rules. Ask about IELTS evidence and English proficiency exemptions individually.','mit'],
  ['transcript','2029-06-30','Applications','Request records and recommendations','Ask for transcripts, IGCSE results, predicted A-Levels and recommendations before the application term.'],
  ['shortlist','2029-07-31','Applications','Build an affordable shortlist','Compare admission odds, course fit and estimated net price. Include options with realistic admission and manageable costs.'],
  ['draft','2029-08-31','Applications','Draft the personal essay and activities list','Choose one story and write it in your own voice. Record the impact and scope of key activities.','common'],
  ['rules','2029-09-15','Applications','Verify Fall 2030 requirements','Confirm each round, exact deadline and time zone, testing, English evidence, supplement and recommendations.'],
  ['aidprep','2029-09-30','Financial aid','Prepare financial aid documents','Verify the FAFSA cycle, required tax year, each college’s CSS Profile or other forms and any translation requirements.','fafsa'],
  ['uk','2029-10-08','Applications','Prepare any early UCAS submission','Confirm the course deadline, any admissions tests, school cutoffs, fee status and visa considerations.','ucas'],
  ['early','2029-10-25','Applications','Review early applications and aid','Check school-specific rules and portal status. Compare likely costs before a binding Early Decision choice.','css'],
  ['uc','2029-11-20','Applications','Prepare any UC applications','Verify the filing window and campus-specific requirements.','uc'],
  ['regular','2029-12-20','Applications','Prepare Regular Decision applications','Confirm each deadline and financial aid priority date. Track portal checklists after submission.'],
  ['offers','2030-04-20','Financial aid','Compare offers and net costs','Compare grants, loans, travel and four-year costs. Verify deposit and reply dates separately.'],
  ['final','2030-06-30','Academics','Complete A-Levels and send results','Check conditional offers, final document deadlines and enrolment steps.']
];

const seedSchools = [
  ['Princeton','Operations research & financial engineering','https://admission.princeton.edu/'],
  ['MIT','Mathematics and computation','https://mitadmissions.org/'],
  ['Stanford','Management science & engineering','https://admission.stanford.edu/'],
  ['Carnegie Mellon','Computational finance','https://www.cmu.edu/admission/'],
  ['Columbia','Operations research & engineering','https://undergrad.admissions.columbia.edu/'],
  ['NYU','Mathematics at Courant','https://www.nyu.edu/admissions/undergraduate-admissions.html'],
  ['UC Berkeley','Applied mathematics','https://admissions.berkeley.edu/'],
  ['Imperial','Mathematics • UK route','https://www.imperial.ac.uk/study/courses/undergraduate/mathematics-bsc/']
];
