"use server";

import SurveyResponse from '../models/SurveyResponse';

const addResponse = async (response) => {
    const { name, email, age, education, answers } = response;

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

export { addResponse };
