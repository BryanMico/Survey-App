"use client";

import React, { useState } from 'react';
import { addResponse } from '../api/server';

export default function Home() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        education: '',
        answers: [],
    });

    const [showModal, setShowModal] = useState(false); // State for modal

    const questions = [
        {
            question: "What is your age?",
            options: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65 or above"],
            fieldName: "age"
        },
        {
            question: "What is your highest level of educational attainment?",
            options: ["High school or equivalent", "Some college/Associate degree", "Bachelor's degree", "Graduate/Professional degree"],
            fieldName: "education"
        },
        {
            question: "How many hours per day do you typically spend on social media?",
            options: ["Less than 1 hour", "1-2 hours", "2-4 hours", "More than 4 hours"],
        },
        {
            question: "How often do you use social media for communication purposes?",
            options: ["Rarely", "Sometimes", "Frequently", "Almost always"],
        },
        {
            question: "How do you prefer to communicate online?",
            options: ["Text-based (e.g., messaging)", "Video calls", "Voice calls", "All of the above"],
        },
        {
            question: "Do you think social media has affected your communication skills?",
            options: ["Positively", "Negatively", "Not at all"],
        },
        {
            question: "How often do you encounter misunderstandings in online communication?",
            options: ["Rarely", "Sometimes", "Frequently", "Almost always"],
        },
        {
            question: "How often do you engage in discussions or debates on social media?",
            options: ["Rarely", "Sometimes", "Frequently", "Almost always"],
        },
        {
            question: "How do you usually express emotions on social media?",
            options: ["Emojis", "Text", "Images/videos", "Combination of the above"],
        },
        {
            question: "How has social media influenced your ability to concentrate?",
            options: ["Improved", "Decreased", "No impact"],
        },
        {
            question: "How do you perceive the overall impact of social media on society's communication skills?",
            options: ["Positive", "Negative", "Neutral"],
        },
        {
            question: "Do you think social media helps in building meaningful relationships?",
            options: ["Yes, strongly agree", "Yes, somewhat agree", "No, neutral", "No, disagree"],
        },
    ];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAnswerSelection = (questionIndex, answer) => {
        const updatedAnswers = [...formData.answers];
        updatedAnswers[questionIndex] = { question: questions[questionIndex].question, answer };
        setFormData({ ...formData, answers: updatedAnswers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.age || !formData.education) {
            console.error('Age and education fields are required.');
            return;
        }

        try {
            const res = await addResponse(formData);

            if (res._id) {
                console.log('Survey response saved:', res);
                setFormData({
                    name: '',
                    email: '',
                    age: '',
                    education: '',
                    answers: [],
                });
                setShowModal(true); // Show success modal
            } else {
                console.error('Error saving survey response');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">
                    Social Media Usage and Its Effect on Communication Skills Survey
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-black"
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-black"
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    {questions.map((question, index) => (
                        <div key={index} className="mb-4">
                            {question.fieldName ? (
                                <fieldset>
                                    <legend className="block text-gray-700 font-bold mb-2">{question.question}</legend>
                                    {question.options.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center mb-2">
                                            <input
                                                className="mr-2"
                                                type="radio"
                                                id={`${question.fieldName}-${optionIndex}`}
                                                name={question.fieldName}
                                                value={option}
                                                onChange={handleInputChange}
                                                checked={formData[question.fieldName] === option}
                                                required
                                            />
                                            <label htmlFor={`${question.fieldName}-${optionIndex}`} className="text-black">{option}</label>
                                        </div>
                                    ))}
                                </fieldset>
                            ) : (
                                <fieldset>
                                    <legend className="block text-gray-700 font-bold mb-2">{`${index + 1}. ${question.question}`}</legend>
                                    {question.options.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center mb-2">
                                            <input
                                                className="mr-2"
                                                type="radio"
                                                id={`option-${index}-${optionIndex}`}
                                                name={`question-${index}`}
                                                value={option}
                                                onChange={() => handleAnswerSelection(index, option)}
                                                checked={formData.answers[index]?.answer === option}
                                                required
                                            />
                                            <label htmlFor={`option-${index}-${optionIndex}`} className="text-black">{option}</label>
                                        </div>
                                    ))}
                                </fieldset>
                            )}
                        </div>
                    ))}
                    <div className="flex justify-center">
                        <button
                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors duration-300"
                            type="submit"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-center text-black">Submission Successful!</h2>
                        <p className="text-lg text-center text-black">Thank you for participating in our survey.</p>
                        <div className="flex justify-center mt-4">
                            <button
                                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors duration-300"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
