"use server";

import SurveyResponse from '../models/SurveyResponse';

const addResponse = async (response) => {
    const { name, email, age, education, answers, ipAddress } = response;

    try {
        // Check if the email already exists
        const existingResponse = await SurveyResponse.findOne({ email });
        if (existingResponse) {
            throw new Error('Email already exists');
        }

        // Check if the IP address already exists
        const existingIpResponse = await SurveyResponse.findOne({ ipAddress });
        if (existingIpResponse) {
            throw new Error('IP address already used to submit a survey');
        }

        const newResponse = new SurveyResponse({
            name,
            email,
            age,
            education,
            answers,
            ipAddress,
        });

        const savedResponse = await newResponse.save();

        // Convert savedResponse to a plain JavaScript object and remove any Mongoose-specific properties
        const plainResponse = savedResponse.toObject();
        delete plainResponse._id;
        delete plainResponse.__v;

        // Remove _id from answers if it exists
        plainResponse.answers = plainResponse.answers.map(answer => {
            const plainAnswer = { ...answer };
            delete plainAnswer._id;
            return plainAnswer;
        });

        return plainResponse;
    } catch (error) {
        console.error('Error saving survey response:', error);
        throw error; // Rethrow the error to handle it in calling functions
    }
};

const checkIpAddress = async (ipAddress) => {
    try {
        const existingResponse = await SurveyResponse.findOne({ ipAddress });

        if (existingResponse) {
            return true; // IP address exists
        } else {
            return false; // IP address does not exist
        }
    } catch (error) {
        console.error('Error checking IP address:', error);
        throw error; // Rethrow the error to handle it in calling functions
    }
};

const getUserChoicesStats = async () => {
    try {
        const responses = await SurveyResponse.find({});

        // Extract all unique questions and their answers from responses
        const questions = responses.reduce((acc, response) => {
            response.answers.forEach(answer => {
                const existingQuestion = acc.find(q => q.question === answer.question);
                if (!existingQuestion) {
                    acc.push({ question: answer.question, options: [] });
                }
                const question = acc.find(q => q.question === answer.question);
                if (!question.options.includes(answer.answer)) {
                    question.options.push(answer.answer);
                }
            });
            return acc;
        }, []);

        // Calculate answer counts for each question and option
        const questionStats = questions.map((question, index) => {
            const answerCounts = question.options.map(option => ({
                answer: option,
                count: responses.filter(response =>
                    response.answers.find(ans => ans.question === question.question && ans.answer === option)
                ).length
            }));
            return {
                questionId: index + 1, // Assuming each question gets an ID sequentially
                question: question.question,
                answers: answerCounts
            };
        });

        // Calculate overall response count
        const totalResponses = responses.length;

        // Calculate average age of respondents
        const totalAge = responses.reduce((acc, response) => {
            // Ensure response.age is a valid number before adding to acc
            const age = parseInt(response.age);
            return acc + (isNaN(age) ? 0 : age);
        }, 0);
        const averageAge = totalResponses > 0 ? Math.round(totalAge / totalResponses) : 0; // Ensure to handle division by zero

        // Calculate education level distribution
        const educationLevels = {};
        responses.forEach(response => {
            const educationLevel = response.education;
            if (educationLevels[educationLevel]) {
                educationLevels[educationLevel]++;
            } else {
                educationLevels[educationLevel] = 1;
            }
        });

        // Format education level data into an array of objects
        const educationStats = Object.keys(educationLevels).map(level => ({
            level,
            count: educationLevels[level]
        }));

        return {
            questionStats,
            totalResponses,
            averageAge,
            educationStats
        };
    } catch (error) {
        console.error('Error fetching user choices stats:', error);
        throw error;
    }
};

const calculateCorrelation = (data1, data2) => {
    // Implement your correlation calculation logic here
    // Example code to calculate Pearson correlation coefficient
    const mean1 = mean(data1.map(item => item.frequency));
    const mean2 = mean(data2.map(item => item.preferredMode));

    const covarianceValue = covariance(data1.map(item => item.frequency), data2.map(item => item.preferredMode), mean1, mean2);
    const stdDeviation1 = stdDeviation(data1.map(item => item.frequency), mean1);
    const stdDeviation2 = stdDeviation(data2.map(item => item.preferredMode), mean2);

    return covarianceValue / (stdDeviation1 * stdDeviation2);
};

const mean = (array) => {
    return array.reduce((a, b) => a + b) / array.length;
};

const covariance = (array1, array2, mean1, mean2) => {
    return array1.reduce((acc, val, index) => acc + (val - mean1) * (array2[index] - mean2), 0) / array1.length;
};

const stdDeviation = (array, mean) => {
    const variance = array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / array.length;
    return Math.sqrt(variance);
};

const getCorrelationAnalysis = async () => {
    try {
        const responses = await SurveyResponse.find({});

        // Extract relevant data for analysis
        const socialMediaUsage = responses.map(response => ({
            userId: response._id,
            frequency: response.socialMediaUsageFrequency, // Example field for frequency of social media usage
            preferredMode: response.communicationPreferredMode // Example field for preferred communication mode
        }));

        // Perform correlation analysis between social media usage and preferred communication mode
        const correlationCoefficient = calculateCorrelation(socialMediaUsage.map(item => ({
            frequency: item.frequency
        })), socialMediaUsage.map(item => ({
            preferredMode: item.preferredMode
        })));

        return {
            socialMediaUsage,
            correlationCoefficient
        };
    } catch (error) {
        console.error('Error performing correlation analysis:', error);
        throw error;
    }
};

const getMisunderstandingAnalysis = async () => {
    try {
        const responses = await SurveyResponse.find({});

        // Extract relevant data for analysis
        const misunderstandings = responses.map(response => ({
            userId: response._id,
            frequency: response.misunderstandingFrequency, // Example field for frequency of misunderstandings
            causes: response.misunderstandingCauses // Example field for perceived causes of misunderstandings
        }));

        // Perform frequency analysis on causes of misunderstandings
        const misunderstandingFrequency = calculateMisunderstandingFrequency(misunderstandings);

        return {
            misunderstandings,
            misunderstandingFrequency
        };
    } catch (error) {
        console.error('Error performing misunderstanding analysis:', error);
        throw error;
    }
};

const calculateMisunderstandingFrequency = (misunderstandings) => {
    // Implement your frequency analysis logic here
    const frequencyMap = new Map();

    misunderstandings.forEach(response => {
        response.causes.forEach(cause => {
            if (frequencyMap.has(cause)) {
                frequencyMap.set(cause, frequencyMap.get(cause) + 1);
            } else {
                frequencyMap.set(cause, 1);
            }
        });
    });

    // Convert map to array of objects for easier manipulation
    const frequencyArray = Array.from(frequencyMap, ([cause, frequency]) => ({ cause, frequency }));

    // Sort by frequency in descending order
    frequencyArray.sort((a, b) => b.frequency - a.frequency);

    return frequencyArray;
};


export {
    addResponse,
    getUserChoicesStats,
    checkIpAddress,
    getCorrelationAnalysis,
    getMisunderstandingAnalysis,
};
