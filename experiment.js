// Get workerId from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const workerId = urlParams.get('workerId');

// generate random participant 
let participant_num = Math.floor(Math.random() * 999) + 1;
let participant_id = workerId || `participant${participant_num}`;
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
        condition = 'condition_1.csv'
        break;
    case 1:
        condition = 'condition_2.csv'
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
            <p>In this experiment, you will evaluate logical arguments.</p>
            <p>Each argument consists of two premises and a conclusion. You should assume that the premises are true, and judge if the conclusion logically follows.</p>
            <p>The premises and conclusion will appear one at a time. Click the button to advance to the next statement.</p>
            <p>After reading all statements, you will be asked whether the conclusion logically follows from the premises.</p>
            <p><strong>Valid Example:</strong></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All dogs are mammals.</p>
                <p><strong>Premise 2:</strong> Fido is a dog.</p>
                <p><strong>Conclusion:</strong> Therefore, Fido is a mammal.</p>
            </div>
            <p>In this case, the conclusion logically follows from the premises.</p>
            <p><strong>Invalid Example:</strong></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All mammals are animals.</p>
                <p><strong>Premise 2:</strong> Fido is an animal.</p>
                <p><strong>Conclusion:</strong> Therefore, Fido is a mammal.</p>
            </div>
            <p>In this case, the conclusion does not follow from the premises. 
            <p>The first set of trials will use nonsense words and symbols. Please do your best to focus on the logic of the argument.<p>
            <p><strong>Abstract Example:</strong></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All $ are @.</p>
                <p><strong>Premise 2:</strong> & is $.</p>
                <p><strong>Conclusion:</strong> Therefore, & is @.</p>
            </div>
            <p>This conclusion logically follows from the premises.<p>
            
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
            <h2>Instructions</h2>
            <p>
            Take your time to think through each statement. Once you see each statement, click <strong>Yes</strong> if 
            the conclusion logically follows, and <strong>No</strong> if it does not follow.
            <p><strong>Press 'Start' when you're ready to begin.</strong></p>
        </div>
    `,
    choices: ['Start'],
    data: {
        trial_type: 'instructions'
    }

}

function createTrials(argumentsData) {
    const experimentTrials = [];
    
    argumentsData.forEach((item, index) => {
        const premise1 = item.premise_1;
        const premise2 = item.premise_2;
        const conclusion = item.conclusion;
        p1_rt = 0;
        p2_rt = 0;
        conc_rt = 0;
        
        if (!premise1 || !premise2 || !conclusion) {
            console.warn('Trial missing data:', item);
            return;
        }
        
        let argumentStartTime = null;

        timeline.push({
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `
                <div class="trial-container">
                    <div class="question">Does the conclusion follow from the premises?</div>
                    <div class="statement-area">
                        <div class="statement"><span class="label">Premise 1:</span> <span class="content">___</span></div>
                        <div class="statement"><span class="label">Premise 2:</span> <span class="content">___</span></div>
                        <div class="statement"><span class="label">Conclusion:</span> <span class="content">___</span></div>
                    </div>
                </div>
        `,
        choices: "ALL_KEYS",
        data: {
            task: 'await_premise1',
            trial_number: index
        }
    });
        
        const premise1Trial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div class="trial-container">
                    <div class="question">Does the conclusion follow from the premises?</div>
                    <div class="statement-area">
                        <div class="statement"><span class="label">Premise 1:</span> <span class="content visible">${premise1}</span></div>
                        <div class="statement"><span class="label">Premise 2:</span> <span class="content">___</span></div>
                        <div class="statement"><span class="label">Conclusion:</span> <span class="content">___</span></div>
                    </div>
                </div>
            `,
            choices: ["Next"],
            data: {
                custom_trial_type: 'premise1',
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
            on_start: function() {
                argumentStartTime = Date.now();
            },
            on_finish: function(data) {
                p1_rt = Math.round(data.rt)
            },
        };
        
        const premise2Trial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div class="trial-container">
                    <div class="question">Does the conclusion follow from the premises?</div>
                    <div class="statement-area">
                        <div class="statement"><span class="label">Premise 1:</span> <span class="content">___</span></div>
                        <div class="statement"><span class="label">Premise 2:</span> <span class="content visible">${premise2}</span></div>
                        <div class="statement"><span class="label">Conclusion:</span> <span class="content">___</span></div>
                    </div>
                </div>
            `,
            choices: ['Next'],
            data: {
                custom_trial_type: 'premise2',
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
                p2_rt = Math.round(data.rt)
            },
        };

        const conclusionTrial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div class="trial-container">
                    <div class="question">Does the conclusion follow from the premises?</div>
                    <div class="statement-area">
                        <div class="statement"><span class="label">Premise 1:</span> <span class="content">___</span></div>
                        <div class="statement"><span class="label">Premise 2:</span> <span class="content">___</span></div>
                        <div class="statement"><span class="label">Conclusion:</span> <span class="content visible">${conclusion}</span></div>
                    </div>
                </div>
            `, 
            choices: ['Next'],
            data: {
                custom_trial_type: 'conclusion',
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
                conc_rt = Math.round(data.rt)
            },
        };
        
        const validityTrial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div class="trial-container">
                    <div class="question">Does the conclusion follow from the premises?</div>
                    <div class="statement-area">
                        <div class="statement"><span class="label">Premise 1:</span> <span class="content">___</span></div>
                        <div class="statement"><span class="label">Premise 2:</span> <span class="content">___</span></div>
                        <div class="statement"><span class="label">Conclusion:</span> <span class="content">___</span></div>
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
                const totalTime = Date.now() - argumentStartTime;
                data.participant_response = data.response === 0 ? 'valid' : 'invalid';
                data.p1_rt = p1_rt,
                data.p2_rt = p2_rt,
                data.conc_rt = conc_rt,
                data.response_rt = Math.round(data.rt);
                data.total_argument_time = Math.round(totalTime);
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
                    p1_rt,
                    p2_rt,
                    conc_rt,
                    rt: data.response_rt,
                    total_time: data.total_argument_time
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
        
        experimentTrials.push(premise1Trial, premise2Trial, conclusionTrial, validityTrial, next);
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
        return 'subCode,trial_num,premise1,premise2,conclusion,correct_validity,participant_response,is_correct,form,abstraction,plausibility,p1_rt,p2_rt,conc_rt,response_rt,total_argument_time\n';
    }
    
    try {
        const header = 'subCode,trial_num,premise1,premise2,conclusion,correct_validity,participant_response,is_correct,form,abstraction,plausibility,p1_rt,p2_rt,conc_rt,response_rt,total_argument_time';
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
                Math.round(trial.p1_rt || 0),
                Math.round(trial.p2_rt || 0),
                Math.round(trial.conc_rt || 0),
                Math.round(trial.response_rt || 0),
                Math.round(trial.total_argument_time || 0)
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
        return 'subCode,trial_num,premise1,premise2,conclusion,correct_validity,participant_response,is_correct,form,abstraction,plausibility,p1_rt,p2_rt,conc_rt,response_rt,total_argument_time\nerror,0,error,error,error,error,error,error,0,0,0\n';
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

// NEW: Qualtrics survey integration
const qualtrics_survey = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="text-align: center; max-width: 800px; margin: 0 auto;">
            <h2>Post-Experiment Survey</h2>
            <p>Please complete a brief survey about your experience.</p>
            <p>The survey will open in a new window.</p>
            <p><strong>You will receive a completion code after completing the survey.</strong></p>
        </div>
    `,
    choices: ['Continue'],
    data: {
        trial_type: 'qualtrics_instruction'
    },
    on_finish: function() {
        const qualtricsURL = `https://uwmadison.co1.qualtrics.com/jfe/form/SV_0dnWlrTfrGaRhGu?workerId=${participant_id}`;
        window.open(qualtricsURL, '_blank');
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