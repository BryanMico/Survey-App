import mongoose from 'mongoose';

const surveyResponseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: String, required: true },
    education: { type: String, required: true },
    answers: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true },
        },
    ],
    submittedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SurveyResponse || mongoose.model('SurveyResponse', surveyResponseSchema);
