"use server";

import SurveyResponse from '../models/SurveyResponse';

const addResponse = async (response) => {
    const { name, email, age, education, answers} = response;

    try {
        // Check if the email already exists
        const existingResponse = await SurveyResponse.findOne({ email });
        if (existingResponse) {
            throw new Error('Email already exists');
        }

  

        const newResponse = new SurveyResponse({
            name,
            email,
            age,
            education,
            answers,
            
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


const getUserChoicesStats = async () => {
    try {
        const responses = await SurveyResponse.find({});
        
        // Dynamically generate questions and options based on responses
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

        const questionStats = questions.map((question, index) => {
            const answerCounts = question.options.map(option => ({
                answer: option,
                count: responses.filter(response => 
                    response.answers.find(ans => ans.question === question.question && ans.answer === option)
                ).length
            }));
            return {
                questionId: index + 1,
                question: question.question,
                answers: answerCounts
            };
        });

        return questionStats;
    } catch (error) {
        console.error('Error fetching user choices stats:', error);
        throw error;
    }
};
export { addResponse, getUserChoicesStats };
