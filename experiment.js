// generate random participant 
let participant_num = Math.floor(Math.random() * 999) + 1;
let participant_id = `participant${participant_num}`;
let abstract_num = participant_num % 3;

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

// create filename for d saving
const filename = `${participant_id}.csv`;

// Initialize jsPsych
const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: true,
    on_finish: function() {
        jsPsych.data.displayData();
    }
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

// CHANGED: Updated instructions for logic arguments
const instructions = {
    type: jsPsychHtmlButtonResponse,  
    stimulus: `
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <h2>Instructions</h2>
            <p>In this experiment, you will evaluate logical arguments.</p>
            <p>Each argument consists of two premises and a conclusion.</p>
            <p>The premises and conclusion will appear one at a time. Click the button to advance to the next statement.</p>
            <p>After reading all statements, you will be asked whether the conclusion logically follows from the premises.</p>
            <p><strong>Valid Example:</strong></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All dogs are mammals.</p>
                <p><strong>Premise 2:</strong> Fido is a dog.</p>
                <p><strong>Conclusion:</strong> Therefore, Fido is a mammal.</p>
            </div>
            <p>In this case, the conclusion is <strong>valid</strong> because it logically follows from the premises.</p>
            <p><strong>Invalid Example:</strong></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All mammals are animals.</p>
                <p><strong>Premise 2:</strong> Fido is an animal.</p>
                <p><strong>Conclusion:</strong> Therefore, Fido is a mammal.</p>
            </div>
            <p>In this case, the conclusion is <strong>invalid</strong> because it does not follow from the premises. 
            <p>The first set of trials will use nonsense words and symbols. Please do your best to focus on the logic of the argument.<p>
            <p><strong>Abstract Example:</strong></p>
            <div style="text-align: left; max-width: 500px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border-radius: 5px;">
                <p><strong>Premise 1:</strong> All $ are @.</p>
                <p><strong>Premise 2:</strong> & is $.</p>
                <p><strong>Conclusion:</strong> Therefore, & is @.</p>
            </div>
            <p>The conclusion is <strong>valid</strong> because it logically follows from the premises.<p>
            <p><strong>Press 'Start' when you're ready to begin.</strong></p>
        </div>
    `,
    choices: ['Start'],
    data: {
        trial_type: 'instructions'
    }
};

// CHANGED: Completely rewritten createTrials function
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
        
        // Store the start time for the entire argument
        let argumentStartTime = null;
        
        // Show Premise 1
        const premise1Trial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                    <div style="font-size: 24px; margin: 50px 0; padding: 30px; background-color: #f8f9fa; border-radius: 8px;">
                        <p style="font-weight: bold; color: #666; margin-bottom: 15px;">Premise 1:</p>
                        <p style="font-size: 28px; line-height: 1.6;">${premise1}</p>
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
                argument_type: item.argument_type
            },
            on_start: function() {
                argumentStartTime = Date.now();
            }
        };
        
        // Show Premise 2
        const premise2Trial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                    <div style="font-size: 24px; margin: 50px 0; padding: 30px; background-color: #f8f9fa; border-radius: 8px;">
                        <p style="font-weight: bold; color: #666; margin-bottom: 15px;">Premise 2:</p>
                        <p style="font-size: 28px; line-height: 1.6;">${premise2}</p>
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
                argument_type: item.argument_type
            }
        };
        
        // Show conclusion and validity judgment
        const validityTrial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `
                <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                    <div style="font-size: 24px; margin: 50px 0; padding: 30px; background-color: #fff3cd; border-radius: 8px;">
                        <p style="font-weight: bold; color: #856404; margin-bottom: 15px;">Conclusion:</p>
                        <p style="font-size: 28px; line-height: 1.6;">${conclusion}</p>
                    </div>
                </div>
            `,
            choices: ['Valid', 'Invalid'],
            data: {
                custom_trial_type: 'validity_judgment',
                participant_id: participant_id,
                trial_number: index + 1,
                premise1: premise1,
                premise2: premise2,
                conclusion: conclusion,
                correct_validity: item.validity,
                argument_type: item.argument_type
            },
            on_finish: function(data) {
                // Record total time for the entire argument
                const totalTime = Date.now() - argumentStartTime;
                data.participant_response = data.response === 0 ? 'valid' : 'invalid';
                data.response_rt = Math.round(data.rt);
                data.total_argument_time = Math.round(totalTime);
                data.is_correct = data.participant_response === data.correct_validity ? 1 : 0;
                
                console.log(`Trial ${index + 1} completed:`, {
                    premises: [premise1, premise2],
                    conclusion: conclusion,
                    correct: data.correct_validity,
                    response: data.participant_response,
                    is_correct: data.is_correct,
                    rt: data.response_rt,
                    total_time: data.total_argument_time
                });
            }
        };
        
        experimentTrials.push(premise1Trial, premise2Trial, validityTrial);
    });
    
    return experimentTrials;
}

// CHANGED: Completely rewritten getFilteredData function
function getFilteredData() {   
    const allTrials = jsPsych.data.get().values();
    console.log('All trials:', allTrials.length);
    
    const judgmentTrials = allTrials.filter(trial => trial.custom_trial_type === 'validity_judgment');
    console.log(`Validity judgment trials found: ${judgmentTrials.length}`);
    
    // if there's no data, return empty CSV
    if (judgmentTrials.length === 0) {
        console.error("No validity judgment trials found!");
        return 'subCode,trial_num,premise1,premise2,conclusion,correct_validity,argument_type,participant_response,is_correct,response_rt,total_argument_time\n';
    }
    
    try {
        const header = 'subCode,trial_num,premise1,premise2,conclusion,correct_validity,argument_type,participant_response,is_correct,response_rt,total_argument_time';
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
                trial.argument_type || '',
                trial.participant_response || '',
                trial.is_correct !== undefined ? trial.is_correct : '',
                Math.round(trial.response_rt || 0),
                Math.round(trial.total_argument_time || 0)
            ];
            
            rows.push(row);
            console.log(`Added response row:`, row);
        });
        
        // convert to CSV format
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
        return 'subCode,trial_num,premise1,premise2,conclusion,correct_validity,argument_type,participant_response,is_correct,response_rt,total_argument_time\nerror,0,error,error,error,error,error,error,0,0,0\n';
    }
}

const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "AOAhOmsHgMT3",
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

const final_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div style="text-align: center; max-width: 600px; margin: 0 auto;">
            <h2>Thank you!</h2>
            <p>You have completed the experiment.</p>
            <p>Your completion code is: <strong style="font-size: 18px; color: #2563eb;">${completion_code}</strong></p>
        </div>
    `,
    choices: ['Finish'],
    data: {
        trial_type: 'final',
        completion_code: completion_code
    },  
    on_finish: function() {
        window.location.href = `https://uwmadison.sona-systems.com/default.aspx?logout=Y`;
    }
};

// CHANGED: Renamed function and updated to load arguments
async function loadArguments(filename) {
    try {
        const response = await fetch(filename);  // CHANGED: filename
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

// CHANGED: Updated to use loadArguments and createTrials
async function runExperiment() {
    try {
        console.log('Starting experiment...');
        console.log('Participant ID:', participant_id);
        console.log('Abstract type:', abstract_type)
        console.log('Completion code:', completion_code);

        const abstractData = await loadArguments(abstract_type);
        console.log('Loaded abstract arguments:', abstractData.length);  

        if (abstractData.length === 0) {  
            throw new Error('No arguments loaded from abstract file');  
        }

        const abstractTrials = createTrials(abstractData);
        console.log('Created abstract trials:', abstractTrials.length / 3);
        

        const concreteData = await loadArguments('concrete.csv');  
        console.log('Loaded concrete arguments:', concreteData.length); 
        
        if (concreteData.length === 0) {  
            throw new Error('No arguments loaded from concrete file');  
        }
        
        const concreteTrials = createTrials(concreteData); 
        console.log('Created concrete trials:', concreteTrials.length / 3);
            
        timeline = [
            consent,
            instructions,
            ...abstractTrials,
            ...concreteTrials,
            save_data,
            final_screen
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