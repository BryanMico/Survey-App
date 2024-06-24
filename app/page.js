"use client";

import React, { useState, useEffect } from 'react';
import { addResponse, checkIpAddress } from '../api/server';

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

export default function Home() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        education: '',
        answers: [],
        ipAddress: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        async function fetchIpAddress() {
            try {
                const res = await fetch('https://api.ipify.org?format=json');
                const data = await res.json();
                setFormData(prevState => ({ ...prevState, ipAddress: data.ip }));
    
                const ipCheck = await checkIpAddress(data.ip);
                if (ipCheck) {
                    setSubmitted(true);
                }
            } catch (err) {
                console.error('Error fetching IP address:', err);
            }
        }
    
        fetchIpAddress();
    }, []);

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
            setError('Age and education fields are required.');
            return;
        }
    
        setLoading(true);
        setError('');
    
        try {
            // Check if IP address has already submitted a survey
            const ipCheck = await checkIpAddress(formData.ipAddress);
            if (ipCheck) {
                setSubmitted(true); // IP address has already submitted
                return;
            }
    
            const res = await addResponse(formData);
    
            if (res && res.name) {
                console.log('Survey response saved:', res);
                setFormData({
                    name: '',
                    email: '',
                    age: '',
                    education: '',
                    answers: [],
                    ipAddress: formData.ipAddress
                });
                setShowModal(true);
            } else {
                console.error('Error saving survey response');
            }
        } catch (error) {
            if (error.message === 'Email already exists') {
                setError('This email has already been used to submit a survey.');
            } else if (error.message === 'IP address already used to submit a survey') {
                setError('You have already submitted a survey from this IP address.');
            } else {
                setError('An error occurred while submitting the survey.');
            }
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-800 via-black to-gray-800 flex flex-col items-center justify-center text-white">
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24 mb-4"></div>
                </div>
            )}
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h1 className="text-3xl font-extrabold mb-6 text-center text-transparent bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text">
                    Social Media Usage and Its Effect on Communication Skills Survey
                </h1>
                {submitted ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">You have already submitted the survey.</h2>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                                    <h2 className="text-2xl font-bold mb-4 text-red-500">Error</h2>
                                    <p className="text-gray-400 mb-4">{error}</p>
                                    <button
                                        className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:bg-red-700"
                                        onClick={() => setError('')}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-400 font-bold mb-2" htmlFor="name">
                                    Name
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-800 text-white"
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
                                <label className="block text-gray-400 font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-800 text-white"
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
                                <div key={index} className="mb-4 p-4 border border-gray-700 rounded-lg bg-gray-800">
                                    {question.fieldName ? (
                                        <fieldset>
                                            <legend className="block text-gray-400 font-bold mb-2">{question.question}</legend>
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
                                                    <label htmlFor={`${question.fieldName}-${optionIndex}`} className="text-white">{option}</label>
                                                </div>
                                            ))}
                                        </fieldset>
                                    ) : (
                                        <fieldset>
                                            <legend className="block text-gray-400 font-bold mb-2">{`${index + 1}. ${question.question}`}</legend>
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
                                                    <label htmlFor={`option-${index}-${optionIndex}`} className="text-white">{option}</label>
                                                </div>
                                            ))}
                                        </fieldset>
                                    )}
                                </div>
                            ))}
                            <div className="flex justify-center">
                            <button
                                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                                    type="submit"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                        <h2 className="text-2xl font-bold mb-4 text-white">Thank You!</h2>
                        <p className="text-gray-400 mb-4">Your survey response has been submitted successfully.</p>
                        <button
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                            onClick={() => setShowModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
