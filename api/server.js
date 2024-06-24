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




export {
    addResponse,
    getUserChoicesStats,
    checkIpAddress,
};
