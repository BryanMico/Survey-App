"use server";

import SurveyResponse from '../models/SurveyResponse';

const addResponse = async (response) => {
    const { name, email, age, education, answers } = response;

    try {
        const newResponse = new SurveyResponse({
            name,
            email,
            age,
            education,
            answers,
        });

        const savedResponse = await newResponse.save();

        // Convert savedResponse to a plain JavaScript object
        const plainResponse = savedResponse.toObject(); // Convert Mongoose document to plain object

        return plainResponse;
    } catch (error) {
        console.error('Error saving survey response:', error);
        throw error; // Rethrow the error to handle it in calling functions
    }
};

export { addResponse };
