'use strict';
/* Public editorial data, not a record of customer testimonials.
 * Persona names identify educational scenarios. Only the first five persona
 * ages have a production-source reference; all unknown ages/cities stay null.
 * Text summaries are not transcripts of the associated role-avatar videos.
 * Relative media URLs are project-root-relative, not script-relative.
 */
(() => {
  const roleLabels = Object.freeze({
    'a-prepod': "Tutors and teachers",
    'a-psiholog': "Psychologists and coaches",
    'a-novichok': "Experts and novices",
    'a-marketolog': "Marketers and producers",
    'a-magazin': "Shops and services"
  });

  const cases = [
    {
      id: 'student_01', roleId: 'a-prepod', name: "Elena", age: 34, city: null,
      specialty: "English tutor",
      headline: "Educational review · reminder instead of repeated explanation",
      quote: "The educational example shows a reminder for a short introduction in English. Instead of a success story, a sample answer, an assignment for the student, and a test by the teacher are discussed here.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: create a handout with a model answer, an exercise and a self-check. The teacher reviews the vocabulary and saves the approved version.",
      routineBefore: "In the original scenario, the teacher explains the structure of the short introduction anew each time. Sample answers remain in different notes, so you have to search for a suitable example manually.",
      resultAfter: "Target Build Artifact: One tested cheat sheet with exercise and sample. On a test request, you need to check the output of the desired version, and not promise an increase in ratings.",
      videoSrc: 'assets/videos/student_01_a-prepod.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "LESSON",
      nextStep: "In the training route, send the word LESSON and check the issuance of the reminder on a test request."
    },
    {
      id: 'student_02', roleId: 'a-psiholog', name: "Marina", age: 41, city: null,
      specialty: "Psychologist",
      headline: "Training session · rules for the first meeting",
      quote: "The case study concerns an organizational memo before the first meeting. It checks the format, time zone and transfer order, and does not use personal customer stories.",
      taskBuiltIn3Evenings: "Study task for three evenings for $19: collect a memo from the approved recording rules. The specialist clarifies unknown conditions independently before allowing the text to be issued.",
      routineBefore: "In the original scenario, the same organizational questions come in different correspondence. The specialist manually checks the appointment time and repeats the agreed rules for scheduling and rescheduling.",
      resultAfter: "Target build artifact: agreed text with answers to organizational questions. Review concerns the accuracy of rules and privacy, not diagnosis or therapeutic outcome.",
      videoSrc: 'assets/videos/student_02_a-psiholog.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "MEETING",
      nextStep: "In the training route, ask for the word MEETING and check the memo with the approved rules of the specialist."
    },
    {
      id: 'student_03', roleId: 'a-novichok', name: "Igor", age: 44, city: null,
      specialty: "Expert, first content project",
      headline: "Educational analysis · post from a voice note",
      quote: "The case study begins with an explanation written down by the expert in his own words. A draft of one post is prepared from the note, and the facts and wording remain to be checked by the author.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: transcribe your own voice note and draft a post. The author checks every claim against the source and saves only approved copy.",
      routineBefore: "In the original scenario, helpful explanations remain in the phone's voice notes. Before publication, the expert retypes the text and manually removes repetitive thoughts from the draft.",
      resultAfter: "Target build artifact: original note and reviewed post with the same topic. Publication remains an individual decision of the author, and income and reach were not measured here.",
      videoSrc: 'assets/videos/student_03_a-novichok.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "NOTE",
      nextStep: "In the study route, ask for the word NOTE and compare each post statement to the original post."
    },
    {
      id: 'student_04', roleId: 'a-marketolog', name: "Alina", age: 25, city: null,
      specialty: "Marketer",
      headline: "Training analysis · content from the agreed brief",
      quote: "A case study links one agreed brief to draft publications. The editor checks the meaning and restrictions, so text generation does not replace agreement with the customer.",
      taskBuiltIn3Evenings: "Training task for three evenings for $19: collect a project card and drafts according to the brief. Each post needs to be weighed against the underlying facts and brand limitations.",
      routineBefore: "In the original scenario, customer requirements are scattered across messages and documents. Before each text, the marketer manually collects product facts, the tone of communication and a list of prohibitions.",
      resultAfter: "Target artifact of the assembly: a single brief and associated draft publications. Acceptance checks compliance with the source code, and not a fictitious cost reduction or sales increase.",
      videoSrc: 'assets/videos/student_04_a-marketolog.mp4', duration: '0:10', durationSeconds: 9.990083,
      codeword: "BRIF",
      nextStep: "In the training route, ask for the word BRIF and check that the draft has not added unconfirmed product properties."
    },
    {
      id: 'student_05', roleId: 'a-magazin', name: "Svetlana", age: 29, city: null,
      specialty: "Flower workshop",
      headline: "Educational analysis · answers about ordering a bouquet",
      quote: "This tutorial focuses on answering recurring questions in a flower workshop. The composition of the bouquet, the availability of flowers and the possibility of delivery are confirmed by an employee, and the template helps to format the response.",
      taskBuiltIn3Evenings: "Study task for three evenings for $19: collect an order reminder and answer templates. The check separately notes information that depends on the availability of flowers and the delivery schedule.",
      routineBefore: "In the original scenario, the employee repeats the terms of the order in each new correspondence. The actual availability of flowers must be clarified separately so that the ready answer does not promise too much.",
      resultAfter: "Target assembly artifact: order memo with mandatory confirmation of availability and delivery. This is a verifiable response structure, not proof of sales or live checkout operation.",
      videoSrc: 'assets/videos/student_05_a-magazin.mp4', duration: '0:10', durationSeconds: 9.999083,
      codeword: "BOUQUET",
      nextStep: "In the training route, ask for the word BOUQUET and check the answer for a product that is out of stock."
    },
    {
      id: 'student_06', roleId: 'a-prepod', name: "Olga", age: null, city: null,
      specialty: "Math tutor",
      headline: "Educational analysis · tasks with proven solutions",
      quote: "A tutorial example examines the preparation of a flashcard on one mathematical topic. The teacher solves the tasks independently and checks the answers before giving the card to the student.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: prepare exercises at different difficulty levels with answer keys. The teacher checks every solution and saves a worksheet with clear self-assessment criteria.",
      routineBefore: "In the original script, tasks and answers are stored in separate files. When preparing a lesson, the teacher manually collects the required selection and re-checks the answer keys.",
      resultAfter: "Target build artifact: task card with proven solutions and explanations. Acceptance involves an independent decision by the teacher, and changes in academic performance require separate observation.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "TASK",
      nextStep: "In the training route, ask for the word TASK and check the solution to each task, regardless of the generator."
    },
    {
      id: 'student_07', roleId: 'a-psiholog', name: "Pavel", age: null, city: null,
      specialty: "Coach",
      headline: "Training review · confirmation of entry without personal stories",
      quote: "The tutorial shows a template for confirming an appointment for a work meeting. To prepare it, the approved terms of service are sufficient, and sensitive information about the person is not needed.",
      taskBuiltIn3Evenings: "Training task for three evenings for $19: collect confirmation of registration and transfer procedure. The meeting format, cost and available dates are taken only from the confirmed conditions of the specialist.",
      routineBefore: "In the original scenario, acknowledgment records are manually compiled from multiple messages. When rescheduling a meeting, it's easy to forget to check the time zone or update outdated terms.",
      resultAfter: "Build target artifact: verifiable confirmation template and separate record migration script. The test uses fictitious data and does not make clinical recommendations or promise results.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "RECORD",
      nextStep: "In the training route, ask for the word APPOINTMENT and check to reschedule the appointment without sharing the client's personal history."
    },
    {
      id: 'student_08', roleId: 'a-novichok', name: "Nadezhda", age: null, city: null,
      specialty: "Novice consultant",
      headline: "Educational analysis · description of one clear service",
      quote: "A case study helps describe one service without listing all competencies. The text outlines the client’s task, the scope of the work and the boundaries of responsibility, but does not promise guaranteed earnings.",
      taskBuiltIn3Evenings: "Training task for three evenings for $19: issue a card for one service. It needs to indicate the input data, the specific result of the work and the conditions that require clarification.",
      routineBefore: "In the original scenario, the service description changes from conversation to conversation. Each time a novice expert explains the composition of the work anew and answers the same clarifying questions.",
      resultAfter: "Target artifact of the assembly: a service card with clear composition and boundaries. The test determines whether the reader can explain the next step, but does not prove demand.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "SERVICE",
      nextStep: "In the study route, ask for the word SERVICE and ask the test reader to name the composition and limitations of the work."
    },
    {
      id: 'student_09', roleId: 'a-marketolog', name: "Kirill", age: null, city: null,
      specialty: "Short video producer",
      headline: "Training analysis · scenarios from one source",
      quote: "The tutorial turns one approved material into several scripted corners. Each video has its own thesis checked, so a set of paraphrased takes is not considered a finished episode.",
      taskBuiltIn3Evenings: "Training task for three evenings for $19: create scripts for short videos based on the source code. Each scenario is accompanied by a link to a proven fact and a clear next step.",
      routineBefore: "In the initial script, the themes of the videos are invented separately from the finished project materials. The producer manually searches for the original facts and notices repetitions only after the scripts are written.",
      resultAfter: "Target artifact of the assembly: a scenario table with different theses and sources of statements. Validation is about meaning and repetition, and audience retention can only be assessed after publication.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "SCENARIO",
      nextStep: "In the learning route, ask for the word SCENARIO and check that different videos cover different questions."
    },
    {
      id: 'student_10', roleId: 'a-magazin', name: "Vera", age: null, city: null,
      specialty: "Repair workshop",
      headline: "Training review · repair request card",
      quote: "The tutorial example assembles a clear pre-repair request card. The cost and deadline are confirmed after the estimate by the master, and the form does not give away a guess as a ready-made estimate.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: prepare a service-request form and an acknowledgement. Review the problem description separately from pricing and timing, which require a technician’s assessment.",
      routineBefore: "In the original scenario, the description of the fault is lost among short messages from the client. The employee manually specifies the product model, the nature of the problem and a convenient method for further communication.",
      resultAfter: "Target build artifact: structured request and response with correct next step. The test checks the completeness of the description, but does not replace technical diagnostics or approval of estimates.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "REPAIR",
      nextStep: "In the training route, ask for the word REPAIR and check that the template does not assign a cost without a master."
    },
    {
      id: 'student_11', roleId: 'a-prepod', name: "Andrey", age: null, city: null,
      specialty: "Professional Course Teacher",
      headline: "Educational analysis checklist for one practical lesson",
      quote: "The case study links a practical task with clear readiness criteria. The teacher checks the work itself using a checklist, so beautiful design does not replace the content of the lesson.",
      taskBuiltIn3Evenings: "Training task for three evenings for $19: collect instructions and acceptance checklist. For each item, an observable sign is needed by which the student will check his work.",
      routineBefore: "In the original scenario, task criteria are explained verbally at the beginning of class. When checking the work, the teacher again writes the same comments and clarifies the requirements for each student.",
      resultAfter: "Target build artifact: instructions with an example and verifiable criteria for completing the task. Acceptance uses trial work, and promises of accelerated learning are not included in this analysis.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "PRACTICE",
      nextStep: "In the training route, ask for the word PRACTICE and check the checklist on the obviously incomplete trial work."
    },
    {
      id: 'student_12', roleId: 'a-psiholog', name: "Irina", age: null, city: null,
      specialty: "Career coach",
      headline: "Training session · working meeting agenda",
      quote: "The case study draws up a meeting agenda for a pre-agreed work task. It contains a discussion question and an expected document, but no personality diagnosis or promise of employment.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: prepare an agenda and a follow-up note template. The practitioner checks the service boundaries and does not share the client’s personal information with the generator.",
      routineBefore: "In the original scenario, questions for the meeting are collected in different work notes. After the conversation, the specialist manually reconstructs the agreed actions and separates them from unconfirmed assumptions.",
      resultAfter: "Build Target Artifact: An agenda and template for capturing agreed upon next actions. The test concerns the structure of the document, and career or psychological results are not stated here.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "AGENDA",
      nextStep: "In the training route, ask for the word AGENDA and test the template on a completely fictitious work situation."
    },
    {
      id: 'student_13', roleId: 'a-novichok', name: "Maxim", age: null, city: null,
      specialty: "Independent expert",
      headline: "Educational analysis · answers based on your own materials",
      quote: "The training example collects answers to questions from the expert's own materials. Each statement is associated with a specific source, and the spaces remain questions for the author instead of a fictitious answer.",
      taskBuiltIn3Evenings: "Study task for three evenings for $19: collect a small reference book based on the author’s materials. For each answer, you need to save the source and check for any unconfirmed additions.",
      routineBefore: "In the original script, the necessary explanations are scattered throughout documents and notes. The expert manually searches for the previous answer and re-checks the relevance of the wording before sending.",
      resultAfter: "Target Build Artifact: A guide to answers with source materials and limitations. An unsourced test question should reveal a gap, not generate a convincing fiction.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "ANSWER",
      nextStep: "In the learning route, ask for the word ANSWER and check the question that is not in the source materials."
    },
    {
      id: 'student_14', roleId: 'a-marketolog', name: "Olesya", age: null, city: null,
      specialty: "Producer of an educational project",
      headline: "Educational analysis · queue of approved publications",
      quote: "The case study separates the drafting, approval and readiness of the material for publication. The person responsible and the current version are visible on the card, and the readiness mark is not issued as the fact of placement.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: build an editorial queue with explicit statuses. Record the source, responsible editor and separate publication approval for every piece.",
      routineBefore: "In the original script, edits and final texts are mixed in work correspondence. The producer manually figures out which version is approved and who should review the next material.",
      resultAfter: "Target build artifact: a queue with versions, statuses and reconciliators. The check catches the unconfirmed status, but does not prove that automatic placement in channels works.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "QUEUE",
      nextStep: "In the training route, ask for the word QUEUE and make sure that the inconsistent text cannot be called published."
    },
    {
      id: 'student_15', roleId: 'a-magazin', name: "Roman", age: null, city: null,
      specialty: "Small bakery",
      headline: "Tutorial · pre-order reminder",
      quote: "The case study creates a pre-order reminder for a small bakery. The range, composition and information about allergens is confirmed by an employee, and the generator does not invent the properties of the baked goods.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: assemble a bakery information sheet from verified data. Check ingredients, order-confirmation rules and current collection arrangements separately.",
      routineBefore: "In the original scenario, customers ask the same questions about assortment and order receipt. An employee manually recounts the conditions and checks the composition of each product using work cards.",
      resultAfter: "Target build artifact: a memo with the source of information and mandatory order confirmation. The check includes questions about allergens, but does not replace the control of the composition by a responsible employee.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "PRE-ORDER",
      nextStep: "In the training route, ask for the word PRE-ORDER and check the question about the composition against the approved product card."
    },
    {
      id: 'student_16', roleId: 'a-prepod', name: "Anna", age: null, city: null,
      specialty: "Additional education teacher",
      headline: "Educational analysis · note to parents on the facts of the lesson",
      quote: "The teaching example turns impersonal lesson notes into an easy-to-understand draft message to parents. The teacher checks each formulation with observation and does not add assessments of the child’s personality.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: create a lesson follow-up message template. Test it with fictional notes containing no children’s names, photographs or personal information.",
      routineBefore: "In the original scenario, the teacher manually composes similar messages to parents after class. You need to separately remember the completed task, the student’s difficulty and the agreed step for home practice.",
      resultAfter: "Target artifact of the build: a draft message with the fact of the lesson and the following exercise. The teacher checks the facts before sending, but the template does not draw conclusions about the child’s abilities.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "ACTIVITY",
      nextStep: "In the study route, request the word ACTIVITY and check that the draft saved only the specified observations."
    },
    {
      id: 'student_17', roleId: 'a-psiholog', name: "Sergey", age: null, city: null,
      specialty: "Psychologist in private practice",
      headline: "Training review · public answers about the work format",
      quote: "The case study collects public responses about the specialist's work format. The questions relate to the organization of meetings and the boundaries of the service, so personal correspondence and clinical cases are not included in the collection.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: prepare an administrative FAQ from approved policies. The practitioner reviews the wording and clearly distinguishes routine appointments from requests for emergency help.",
      routineBefore: "In the original scenario, a description of the work format is found in several outdated publications. The specialist manually answers repeated questions and ensures that the answers match the current rules.",
      resultAfter: "Target Build Artifact: Validated section of questions about work organization and communication boundaries. Reception eliminates diagnoses and treatment recommendations, and directs sensitive requests to an agreed process.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "FORMAT",
      nextStep: "In the training route, ask for the word FORMAT and check that the answer does not replace professional help."
    },
    {
      id: 'student_18', roleId: 'a-novichok', name: "Julia", age: null, city: null,
      specialty: "Author of a small practical product",
      headline: "Training analysis · instructions for the first template",
      quote: "The tutorial example is devoted to instructions for a small working template. The test reader must understand the input data and verify the result, and fancy promises are not a substitute for clear procedures.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: document how to use one of your own templates. Include a completed example, limitations and observable acceptance criteria.",
      routineBefore: "In the original script, the author explains the use of the pattern to each reader separately. Questions about filling out the fields, the procedure and checking the received working document are repeated.",
      resultAfter: "Target build artifact: instructions with completed example and self-test criteria. Testing with a new reader will reveal unclear parts, but will not be evidence of future sales.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "TEMPLATE",
      nextStep: "In the training route, ask for the word PATTERN and go through the instructions on the demo data without prompting from the author."
    },
    {
      id: 'student_19', roleId: 'a-marketolog', name: "Polina", age: null, city: null,
      specialty: "Content Marketer",
      headline: "Educational analysis · case without fictitious numbers",
      quote: "A training example shows an editorial review of material about completed work. The draft identifies confirmed facts and unknown results separately, so missing metrics are not replaced with fancy numbers.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: outline a case study using authorized materials. Link each claim to its source and exclude unverified metrics.",
      routineBefore: "In the original scenario, information about the project is collected from disparate working documents. The editor manually verifies which claims are verified and which materials are allowed to be shown publicly.",
      resultAfter: "Target artifact of the assembly: a draft case with sources and clear boundaries of what has been proven. Verification removes unverified indicators, and the right to publish remains a separate mandatory condition.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "CASE",
      nextStep: "In the learning route, ask for the word CASE and check that not a single figure is left without a source."
    },
    {
      id: 'student_20', roleId: 'a-magazin', name: "Mikhail", age: null, city: null,
      specialty: "Local service studio",
      headline: "Educational analysis · answers about recording and transferring",
      quote: "The case study describes the responses to writing to a local service studio. Free time and transfer conditions are confirmed by the administrator, and the template does not create a non-existent reservation.",
      taskBuiltIn3Evenings: "A three-evening practice task in the $19 workshop: draft replies about appointments and rescheduling. Distinguish a customer request from a confirmed appointment; do not promise automatic booking without an integration.",
      routineBefore: "In the original scenario, the administrator manually repeats the entry conditions to new visitors. When transferring, you need to recheck the schedule and confirm that the change was actually made to the production system.",
      resultAfter: "Build Target Artifact: Response templates with separate confirmation of schedule change. The test verifies the absence of false bookings, and the operation of the real integration is confirmed by a separate check.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "TIME",
      nextStep: "In the training route, ask for the word TIME and check that the unconfirmed request is not called a reservation."
    }
  ];

  const disclosure = "A training example with a fictitious character, not a review from a real client. A practical assembly plan is described, not a verified student result.";
  window.COLIBRIOS_REVIEWS_20 = Object.freeze(cases.map(item => Object.freeze({
    ...item,
    roleLabel: roleLabels[item.roleId],
    posterSrc: 'assets/portraits/' + item.id + '.webp',
    audioSrc: null,
    mediaType: item.videoSrc ? 'role-avatar-video' : 'text-case',
    caseType: 'illustrative-educational-scenario',
    disclosure,
    identityStatus: 'persona-label-not-verified-customer',
    ageProvenance: item.age === null ? 'not-provided' : 'existing-voice-persona-production-brief',
    cityProvenance: 'not-provided',
    quoteKind: 'editorial-summary-not-verbatim-testimonial',
    isVerifiedTestimonial: false,
    completionVerified: false,
    resultStatus: 'acceptance-target-not-measured-outcome',
    codewordStatus: 'proposed-training-trigger-not-live-verified',
    videoTranscriptVerified: false,
    publicationStatus: 'draft-pending-editorial-and-media-approval',
    priceRUB: 990,
    evenings: 3
  })));

  window.COLIBRIOS_BROLL_SHOWCASE = Object.freeze([
    {
      id: 'broll_01', title: "Denys Viet by the pool",
      caption: "A vertical fragment to get acquainted with the visual presentation of the project. This video does not endorse student performance or speed of completion of work tasks.",
      videoSrc: 'assets/videos/broll_01_dennis_pool_29s.mp4',
      posterSrc: 'assets/videos/broll_01_dennis_pool_29s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:29', durationSeconds: 28.6
    },
    {
      id: 'broll_02', title: "Tatiana Colibri · balcony",
      caption: "Vertical fragment with Tatiana Colibri for the block about the project. The clip is a visual presentation, not proof of revenue or client results.",
      videoSrc: 'assets/videos/broll_02_tatiana_balcony_10s.mp4',
      posterSrc: 'assets/videos/broll_02_tatiana_balcony_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_03', title: "Denys Viet · kitchen",
      caption: "A short vertical fragment from the project's home series. It can be used as an interruption, but cannot be passed off as a recording of proven automation.",
      videoSrc: 'assets/videos/broll_03_dennis_kitchen_10s.mp4',
      posterSrc: 'assets/videos/broll_03_dennis_kitchen_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_04', title: "Tatiana Colibri · home frame",
      caption: "A short vertical fragment with Tatiana Colibri from the home series. It complements the story about the project without promises of earnings or unconfirmed performance indicators.",
      videoSrc: 'assets/videos/broll_04_tatiana_sofa_10s.mp4',
      posterSrc: 'assets/videos/broll_04_tatiana_sofa_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_05', title: "Live carousel · first option",
      caption: "An animated fragment shows one of the carousel feed options. This is a sample format and not an endorsement of coverage, applications, or payment route operation.",
      videoSrc: 'assets/videos/broll_05_living_carousel_s1.mp4',
      posterSrc: 'assets/videos/broll_05_living_carousel_s1.jpg',
      aspectRatio: '135:169', width: 540, height: 676,
      duration: '0:08', durationSeconds: 8.042667
    },
    {
      id: 'broll_06', title: "Live carousel · second option",
      caption: "The second animated fragment helps compare carousel feed options. The size is indicated based on the finished file, and the promotion result was not measured by this example.",
      videoSrc: 'assets/videos/broll_06_living_carousel_s2.mp4',
      posterSrc: 'assets/videos/broll_06_living_carousel_s2.jpg',
      aspectRatio: '135:169', width: 540, height: 676,
      duration: '0:08', durationSeconds: 8.042667
    },
    {
      id: 'broll_07', title: "Denys Viet · home series",
      caption: "Another vertical fragment for transition between sections of the site. It is not client feedback and does not replace review of the workflow shown.",
      videoSrc: 'assets/videos/broll_07_dennis_bedroom_10s.mp4',
      posterSrc: 'assets/videos/broll_07_dennis_bedroom_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_08', title: "Denys Viet · frame transition",
      caption: "The vertical fragment completes the home series of visual interruptions of the project. The clip complements the story navigation, but does not provide proof of time or money savings.",
      videoSrc: 'assets/videos/broll_08_dennis_hallway_10s.mp4',
      posterSrc: 'assets/videos/broll_08_dennis_hallway_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    }
  ].map(item => Object.freeze({
    ...item,
    mediaType: 'broll-showcase',
    evidenceType: 'format-demonstration-not-customer-proof',
    transcriptVerified: false,
    publicationStatus: 'existing-media-approval-not-certified-by-this-dataset'
  })));

  window.COLIBRIOS_REVIEWS_METADATA = Object.freeze({
    schemaVersion: '1.0.0',
    language: 'ru',
    brandName: "Tatiana Colibri & Denys Viet",
    title: "20 training sessions on five roles",
    disclosure,
    quotePolicy: 'Editorial summaries are not customer quotations or video transcripts.',
    identityPolicy: 'Names are persona labels, not authenticated customer identities. Unknown ages and cities are null.',
    resultPolicy: 'Before/after fields describe a scenario and acceptance target, not measured outcomes.',
    durationPolicy: 'Measured container duration is in seconds. Text-only cards have no audio/video duration.',
    pathBase: 'project-root',
    publicationStatus: 'draft-pending-editorial-and-media-approval',
    mandatory5RoundsVerified: false,
    sourceRefs: Object.freeze([
      'goal-objective.md#3',
      'assets/config.js',
      'role_avatars_20261024/role_avatars_manifest.json',
      'role_avatars_20261024/distinct_voices_48k/voice_differentiation_receipt.json',
      'role_avatars_20261024/memo_voice_revision/content/memos.json',
      'notebooklm:9bb2ba3a-e275-4fe7-a03e-6595762ab87d/697783d7-330a-4f6f-8001-87b58787b2f5'
    ])
  });
})();
