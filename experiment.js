// Get participant IDs from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const workerId = urlParams.get('workerId');
const sona_id = urlParams.get('sona_id') || '';

// generate random participant
let participant_num = Math.floor(Math.random() * 999) + 1;
let participant_id = workerId || sona_id || `participant${participant_num}`;
let abstract_num = participant_num % 3;
let condition_num = participant_num % 2;

// determines the type of abstract arguments based off the randomly generated id number
switch (abstract_num) {
    case 0:
        abstract_type = 'abstract_letter_symbol.csv'
        break;
    case 1:
        abstract_type = 'abstract_nonce_letter.csv'
        break;
    case 2:
        abstract_type = 'abstract_symbol_nonce.csv'
        break;
}

switch (condition_num) {
    case 0:
        condition = 'condition_1_balanced.csv'
        break;
    case 1:
        condition = 'condition_2_balanced.csv'
        break;
}

// function to generate a random string for the completion code 
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const completion_code = generateRandomString(3) + 'zvz' + generateRandomString(3);

// create filename for saving
const filename = `${participant_id}.csv`;

// Initialize jsPsych
const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: true,
    on_finish: function() {
        jsPsych.data.displayData();
    }
});

// Add workerId to all trials
jsPsych.data.addProperties({
    worker_id: participant_id
});

let timeline = [];
const consent = {
    type: jsPsychHtmlButtonResponse,  
    stimulus: `
        <div class="consent-text">
            <h3>Consent to Participate in Research</h3>
            
            <p>The task you are about to do is sponsored by University of Wisconsin-Madison. It is part of a protocol titled "What are we learning from language?"</p>

            <p>The task you are asked to do involves making simple responses to words and sentences. For example, you may be asked to rate a pair of words on their similarity or to indicate how true you think a given sentence is. More detailed instructions for this specific task will be provided on the next screen.</p>

            <p>This task has no direct benefits. We do not anticipate any psychosocial risks. There is a risk of a confidentiality breach. Participants may become fatigued or frustrated due to the length of the study.</p>

            <p>The responses you submit as part of this task will be stored on a secure server and accessible only to researchers who have been approved by UW-Madison. Processed data with all identifiers removed could be used for future research studies or distributed to another investigator for future research studies without additional informed consent from the subject or the legally authorized representative.</p>

            <p>You are free to decline to participate, to end participation at any time for any reason, or to refuse to answer any individual question without penalty or loss of earned compensation. We will not retain data from partial responses. If you would like to withdraw your data after participating, you may send an email lupyan@wisc.edu or complete this form which will allow you to make a request anonymously.</p>

            <p>If you have any questions or concerns about this task please contact the principal investigator: Prof. Gary Lupyan at lupyan@wisc.edu.</p>

            <p>If you are not satisfied with response of the research team, have more questions, or want to talk with someone about your rights as a research participant, you should contact University of Wisconsin's Education Research and Social & Behavioral Science IRB Office at 608-263-2320.</p>

            <p><strong>By clicking the box below, I consent to participate in this task and affirm that I am at least 18 years old.</strong></p>
        </div>
    `,
    choices: ['I Agree', 'I Do Not Agree'],
    data: {
        trial_type: 'consent'
    },
    on_finish: function(data) {
        if(data.response == 1) {
            jsPsych.endExperiment('Thank you for your time. The experiment has been ended.');
        }
    }
};

const instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <h2>Instructions</h2>
            <p>In this experiment, you will evaluate <strong>59</strong> logical arguments. There are 7 practice problems, and 52 trials.</p>
            <p>Each argument consists of two premises and a conclusion. <strong>Assume that the premises are true</strong>, and judge whether the conclusion logically follows from them.</p>
            <p><strong>Valid Example:</strong> <em>(the conclusion follows)</em></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #d4edda; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All dogs are mammals.</p>
                <p><strong>Premise 2:</strong> Fido is a dog.</p>
                <p><strong>Conclusion:</strong> Therefore, Fido is a mammal.</p>
            </div>
            <p>The conclusion follows because if all dogs are mammals, and Fido is a dog, then Fido must be a mammal.</p>
            <p><strong>Invalid Example:</strong> <em>(the conclusion does not follow)</em></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #fff3cd; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All mammals are animals.</p>
                <p><strong>Premise 2:</strong> Fido is an animal.</p>
                <p><strong>Conclusion:</strong> Therefore, Fido is a mammal.</p>
            </div>
            <p>The conclusion does not follow. Fido could be any kind of animal — the premises do not establish that Fido is specifically a mammal.</p>
            <p><strong>Valid Abstract Example:</strong> <em>(the conclusion follows)</em></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #d4edda; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All $ are @</p>
                <p><strong>Premise 2:</strong> Some &amp; are $</p>
                <p><strong>Conclusion:</strong> Therefore, some &amp; are @</p>
            </div>
            <p>This conclusion logically follows — the structure is identical to the valid example above. If all $ are @, and some & are $, then some & will be @.</p>
            <p><strong>Invalid Abstract Example:</strong> <em>(the conclusion does not follow)</em></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #fff3cd; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All $ are @</p>
                <p><strong>Premise 2:</strong> Some $ are &amp</p>
                <p><strong>Conclusion:</strong> Therefore, some &amp; is @</p>
            </div>
            <p>This conclusion does not logically follow from the premises. The premises do not determine whether any &amp; are @.
        </div>
    `,
    choices: ['Next'],
    data: {
        trial_type: 'instructions'
    }
};

const pageTwo = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <h2>Important: Judge Logic, Not Content</h2>
            <p>Some arguments will have conclusions that <em>seem</em> true or false based on your real-world knowledge. <strong>This should not influence your judgment.</strong></p>
            <p>Your task is to evaluate whether the conclusion follows from the premises, not whether it seems believable or realistic.</p>

            <p><strong>Plausible but INVALID:</strong> </p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #fff3cd; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All living things need water.</p>
                <p><strong>Premise 2:</strong> Roses need water.</p>
                <p><strong>Conclusion:</strong> Therefore, roses are living things.</p>
            </div>
            <p>The conclusion seems true — roses are indeed living things. But it does <strong>not</strong> follow from the premises. 
            The premises only say that living things and roses need water, but the <strong>structure</strong> of the argument does not imply that roses are living things. <strong>Answer: No.</strong></p>

            <p><strong>Implausible but VALID:</strong></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #d4edda; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All vegetables are blue.</p>
                <p><strong>Premise 2:</strong> Bananas are vegetables.</p>
                <p><strong>Conclusion:</strong> Therefore, bananas are blue.</p>
            </div>
            <p>The conclusion seems false — bananas are not actually blue. But <strong>if we pretend the premises are true</strong>, the conclusion must follow. <strong>Answer: Yes.</strong></p>

            <p style="margin-top: 30px;">Focus on the <strong>structure</strong> of the argument, not whether the content matches your real-world knowledge.</p>
            <p><strong>Press 'Start' when you're ready to begin.</strong></p>
        </div>
    `,
    choices: ['Start'],
    data: {
        trial_type: 'instructions'
    }
}

const practice_intro = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <h2>Practice</h2>
            <p>Before the main task begins, you will complete <strong>6 practice problems</strong>.</p>
            <p>You will receive feedback after each one.</p>
            <p><strong>Press 'Begin Practice' when you're ready.</strong></p>
        </div>
    `,
    choices: ['Begin Practice'],
    data: { trial_type: 'practice_intro' }
};

const practice_end = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <h2>Practice Complete</h2>
            <p>You have finished the practice trials. The main experiment will now begin.</p>
            <p>Remember: <strong>assume the premises are true</strong> and judge whether the conclusion logically follows — regardless of whether the content seems realistic.</p>
            <p><strong>Press 'Begin' to start.</strong></p>
        </div>
    `,
    choices: ['Begin'],
    data: { trial_type: 'practice_end' }
};

function createPracticeTrials() {
    const practiceItems = [
        {
            premise1: 'All D are S',
            premise2: 'Some D are W',
            conclusion: 'Some S are W',
            correct_response: 0,
            feedback_correct: 'Correct!',
            feedback_incorrect: 'Not quite. Some S must be W, because all D are S and some D are W. The answer is <strong>Yes</strong>, the conclusion follows.'
        },
        {
            premise1: 'Some & are %',
            premise2: 'All $ are &',
            conclusion: 'Some $ are %',
            correct_response: 1,
            feedback_correct: 'Correct!',
            feedback_incorrect: 'Not quite. It is possible that no $ are %. All $ can be & wihtout being %, even though some & are %. The answer is <strong>No</strong>, the conclusion does not follow.'
        },
                {
            premise1: 'Some stonces are gurks',
            premise2: 'All vumps are stonces',
            conclusion: 'Some vumps are gurks',
            correct_response: 0,
            feedback_correct: 'Correct!',
            feedback_incorrect: 'Not quite. Some vumps must be gurks, because all vumps are stonces, and some stonces are gurks. The answer is <strong>Yes</strong>, the conclusion follows.'
        },
        {
            premise1: 'All birds have wings.',
            premise2: 'Some robins are birds.',
            conclusion: 'Some robins have wings.',
            correct_response: 0,
            feedback_correct: 'Correct!',
            feedback_incorrect: 'Not quite. If all birds have wings, and some robins are birds, then some robins must have wings. The answer is <strong>Yes</strong>.'
        },
        {
            premise1: 'All fish live in water.',
            premise2: 'Some trout live in water.',
            conclusion: 'Some trout are fish.',
            correct_response: 1,
            feedback_correct: 'Correct! In the real world, trout are fish and live in water, but the premises do not imply that all things that live in water are fish. The premises only say that fish live in water. They do not say that any trout are fish. The conclusion does not follow. The answer is <strong>No</strong>.',
            feedback_incorrect: 'Not quite. In the real world, trout are fish and live in water, but the premises do not imply that all things that live in water are fish. The premises only say that fish live in water. They do not say that any trout are fish. The conclusion does not follow. The answer is <strong>No</strong>.'
        },
        {
            premise1: 'All mammals are cold-blooded.',
            premise2: 'Some birds are mammals.',
            conclusion: 'Some birds are cold-blooded.',
            correct_response: 0,
            feedback_correct: 'Correct! Even though this contradicts real-world knowledge, remember: <em>assume the premises are true</em>. If all mammals are cold-blooded and birds are mammals, the conclusion must follow. The answer is <strong>Yes</strong>.',
            feedback_incorrect: 'Not quite. Remember: judge the logic, not the content. Even though mammals are not actually cold-blooded, and birds aren\'t mammals, <em>if we assume the premises are true</em>, the conclusion must follow. The answer is <strong>Yes</strong>.'
        },
        {
            premise1: 'All monkeys are birds.',
            premise2: 'Some birds are griaffes.',
            conclusion: 'Some giraffes are monkeys.',
            correct_response: 1,
            feedback_correct: 'Correct! Logically, it is possible that no giraffes are monkeys. Judge the logic, not the content. The answer is <strong>No</strong>.',
            feedback_incorrect: 'Not quite. Logically, it is possible that no giraffes are monkeys. The answer is <strong>No</strong>.'
        }
    ];

    const practiceTrials = [];

    practiceItems.forEach((item, index) => {
        let practice_response = null;

        const trial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div class="trial-container">
                    <div class="question">Does the conclusion follow from the premises?</div>
                    <div class="statement-area">
                        <div class="statement"><span class="label">Premise 1:</span> <span class="content visible">${item.premise1}</span></div>
                        <div class="statement"><span class="label">Premise 2:</span> <span class="content visible">${item.premise2}</span></div>
                        <div class="statement"><span class="label">Conclusion:</span> <span class="content visible">${item.conclusion}</span></div>
                    </div>
                    <p style="color: #888; font-size: 14px; margin-top: 10px;">Practice problem ${index + 1} of 7</p>
                </div>
            `,
            choices: ['Yes', 'No'],
            data: { custom_trial_type: 'practice' },
            on_finish: function(data) {
                practice_response = data.response;
            }
        };

        const feedback = {
            type: jsPsychHtmlButtonResponse,
            stimulus: function() {
                const is_correct = practice_response === item.correct_response;
                const bg = is_correct ? '#d4edda' : '#f8d7da';
                const header = is_correct ? '&#10003; Correct' : '&#10007; Incorrect';
                const message = is_correct ? item.feedback_correct : item.feedback_incorrect;
                return `
                    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                        <div style="padding: 20px 30px; background-color: ${bg}; border-radius: 8px;">
                            <p style="font-size: 22px; font-weight: bold; margin: 0 0 12px;">${header}</p>
                            <p style="font-size: 18px; margin: 0;">${message}</p>
                        </div>
                    </div>
                `;
            },
            choices: ['Next'],
            data: { custom_trial_type: 'practice_feedback' }
        };

        practiceTrials.push(trial, feedback);
    });

    return practiceTrials;
}

function createTrials(argumentsData) {
    const experimentTrials = [];
    
    argumentsData.forEach((item, index) => {
        const premise1 = item.premise_1;
        const premise2 = item.premise_2;
        const conclusion = item.conclusion;

        if (!premise1 || !premise2 || !conclusion) {
            console.warn('Trial missing data:', item);
            return;
        }

        const validityTrial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div class="trial-container">
                    <div class="question">Does the conclusion follow from the premises?</div>
                    <div class="statement-area">
                        <div class="statement"><span class="label">Premise 1:</span> <span class="content visible">${premise1}</span></div>
                        <div class="statement"><span class="label">Premise 2:</span> <span class="content visible">${premise2}</span></div>
                        <div class="statement"><span class="label">Conclusion:</span> <span class="content visible">${conclusion}</span></div>
                    </div>
                </div>
            `,
            choices: ['Yes', 'No'],
            data: {
                custom_trial_type: 'validity_judgment',
                participant_id: participant_id,
                trial_number: index + 1,
                premise1: premise1,
                premise2: premise2,
                conclusion: conclusion,
                correct_validity: item.validity,
                abstraction: item.abstraction,
                form: item.form,
                plausibility: item.plausibility
            },
            on_finish: function(data) {
                data.participant_response = data.response === 0 ? 'valid' : 'invalid';
                data.response_rt = Math.round(data.rt);
                data.is_correct = data.participant_response === data.correct_validity ? 1 : 0;

                console.log(`Trial ${index + 1} completed:`, {
                    premises: [premise1, premise2],
                    conclusion: conclusion,
                    correct: data.correct_validity,
                    response: data.participant_response,
                    is_correct: data.is_correct,
                    abstraction: data.abstraction,
                    form: data.form,
                    plausibility: item.plausibility,
                    rt: data.response_rt
                });
            }
        };

        const next = {
            type: jsPsychHtmlButtonResponse,
            stimulus: "",
            choices: ['Next'],
            button_html: '<button class="jspsych-btn next-btn">%choice%</button>',
            data: {
                task: 'next_button',
                trial_index: index
            }
        };
        
        experimentTrials.push(validityTrial, next);
    });
    
    return experimentTrials;
}

function getFilteredData() {   
    const allTrials = jsPsych.data.get().values();
    console.log('All trials:', allTrials.length);
    
    const judgmentTrials = allTrials.filter(trial => trial.custom_trial_type === 'validity_judgment');
    console.log(`Validity judgment trials found: ${judgmentTrials.length}`);
    
    if (judgmentTrials.length === 0) {
        console.error("No validity judgment trials found!");
        return 'subCode,trial_num,premise1,premise2,conclusion,correct_validity,participant_response,is_correct,form,abstraction,plausibility,response_rt\n';
    }
    
    try {
        const header = 'subCode,trial_num,premise1,premise2,conclusion,correct_validity,participant_response,is_correct,form,abstraction,plausibility,response_rt';
        const rows = [];
        
        judgmentTrials.forEach((trial, trialIndex) => {
            console.log(`Processing trial ${trialIndex + 1}:`, trial);
            
            const row = [
                trial.participant_id || participant_id,
                trial.trial_number || trialIndex + 1,
                trial.premise1 || '',
                trial.premise2 || '',
                trial.conclusion || '',
                trial.correct_validity || '',
                trial.participant_response || '',
                trial.is_correct !== undefined ? trial.is_correct : '',
                trial.form || '',
                trial.abstraction || '',
                trial.plausibility || '',
                Math.round(trial.response_rt || 0)
            ];
            
            rows.push(row);
            console.log(`Added response row:`, row);
        });
        
        const csvRows = rows.map(row => {
            return row.map(value => {
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
        });
        
        const finalCSV = header + '\n' + csvRows.join('\n');
        console.log("Generated CSV data:", finalCSV);
        
        return finalCSV;
    } catch (error) {
        console.error("Error in getFilteredData:", error);
        return 'subCode,trial_num,premise1,premise2,conclusion,correct_validity,participant_response,is_correct,form,abstraction,plausibility,response_rt\nerror,0,error,error,error,error,error,error,0,0,0\n';
    }
}

const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "l0DBLhAX64PU",
    filename: filename,
    data_string: () => getFilteredData(), 
    on_finish: function(data) {
        if (data.success) {
            console.log('Data saved successfully to DataPipe!');
        } else {
            console.error('Error saving to DataPipe:', data.message);
        }
    }
};

// SONA completion URL — fill in your school domain, experiment_id, and credit_token
const SONA_DOMAIN = 'uwmadison.sona-systems.com';       // e.g. 'uwmadison.sona-systems.com'
const SONA_EXPERIMENT_ID = '2234';          // from the SONA study page
const SONA_CREDIT_TOKEN = '27ca6e5154dc47b5a0070312948e9005';            // from the SONA study page

const qualtrics_survey = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="text-align: center; max-width: 800px; margin: 0 auto;">
            <h2>Post-Experiment Survey</h2>
            <p>Please complete this brief survey. You will need to complete the survey to recieve credit.</p>
            <p>You will be redirected automatically. If the survey does not open, please click "Continue."</p>
        </div>
    `,
    choices: ['Continue'],
    data: {
        trial_type: 'qualtrics_instruction'
    },
    on_finish: function() {
        const qualtricsURL = `https://uwmadison.co1.qualtrics.com/jfe/form/SV_0dnWlrTfrGaRhGu?workerId=${participant_id}&sona_id=${sona_id}`;
        const sonaURL = `https://${SONA_DOMAIN}`;

        // Open Qualtrics in a new tab; redirect current window to SONA for credit
        window.open(qualtricsURL, '_blank');
        window.location.href = sonaURL;
    }
};


async function loadArguments(filename) {
    try {
        const response = await fetch(filename);
        const csvText = await response.text();
        
        const results = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true
        });

        console.log('Loaded arguments:', results.data.length);

        let shuffledData = jsPsych.randomization.shuffle([...results.data]);
        
        return shuffledData;
    } catch (error) {
        console.error('Error loading arguments:', error);
        return [];
    }
}

const styles = `
    <style>
        .trial-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            font-family: Arial, sans-serif;
        }
        
        .question {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 40px;
            color: #333;
        }
        
        .statement-area {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .statement {
            font-size: 20px;
            padding: 15px 25px;
            background-color: #f5f5f5;
            border-radius: 8px;
            min-width: 500px;
            text-align: left;
        }
        
        .label {
            font-weight: bold;
            color: #555;
        }
        
        .content {
            margin-left: 10px;
            color: #888;
        }
        
        .content.visible {
            color: #000;
            font-weight: 500;
        }
        
        .instruction {
            font-size: 16px;
            color: #666;
            font-style: italic;
            margin-top: 20px;
        }
        
        .response-btn {
            font-size: 20px;
            padding: 15px 50px;
            margin: 10px;
            min-width: 120px;
        }
        
        .next-btn {
            font-size: 18px;
            padding: 12px 40px;
            margin-top: 20px;
        }
        
        .begin-btn {
            font-size: 20px;
            padding: 15px 50px;
        }
        
        .instructions {
            max-width: 600px;
            text-align: left;
            font-size: 18px;
            line-height: 1.6;
        }
        
        .instructions h1 {
            text-align: center;
            color: #333;
        }
        
        .instructions ul {
            margin: 20px 0;
        }
        
        .instructions li {
            margin: 10px 0;
        }
        
        .feedback-text {
            font-size: 20px;
            color: #666;
        }
    </style>
`;

// Inject styles into document
document.head.insertAdjacentHTML('beforeend', styles);


async function runExperiment() {
    try {
        console.log('Starting experiment...');
        console.log('Participant ID:', participant_id);
        console.log('Abstract type:', abstract_type);
        console.log('Condition: ', condition);
        console.log('Completion code:', completion_code);

        const abstractData = await loadArguments(abstract_type);
        console.log('Loaded abstract arguments:', abstractData.length);  

        if (abstractData.length === 0) {  
            throw new Error('No arguments loaded from abstract file');  
        }

        const concreteData = await loadArguments(condition);  
        console.log('Loaded concrete arguments:', concreteData.length); 
        
        if (concreteData.length === 0) {  
            throw new Error('No arguments loaded from concrete file');  
        }
        
        const trialData = abstractData.concat(concreteData);

        const allTrials = createTrials(trialData); 
        console.log('Created trials:', allTrials.length / 3);
            
        timeline = [
            consent,
            instructions,
            pageTwo,
            practice_intro,
            ...createPracticeTrials(),
            practice_end,
            ...allTrials,
            save_data,
            qualtrics_survey,
        ];

        console.log('Timeline initialized with', timeline.length, 'items');
        console.log('Starting jsPsych...');

        jsPsych.run(timeline);
    } catch (error) {
        console.error('Error running experiment:', error);
        document.body.innerHTML = `
            <div style="max-width: 800px; margin: 50px auto; padding: 20px; background: #f8f8f8; border-radius: 5px; text-align: center;">
                <h2>Error Starting Experiment</h2>
                <p>There was a problem starting the experiment. Please try refreshing the page.</p>
                <p>If the problem persists, please contact the researcher.</p>
                <p>Technical details: ${error.message}</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', runExperiment);