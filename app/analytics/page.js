"use client";
import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getUserChoicesStats } from '../../api/server';
import Switch from '@mui/material/Switch'; // Assuming usage of Material-UI Switch
import FormControlLabel from '@mui/material/FormControlLabel'; // For styling switch labels

// Register the required components
ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement);

const fetchUserChoicesStats = async () => {
    try {
        const response = await getUserChoicesStats();
        return response;
    } catch (error) {
        console.error('Error fetching user choices stats:', error);
        return {
            questionStats: [],
            totalResponses: 0,
            averageAge: 0,
            educationStats: [],
        };
    }
};

export default function Analytics() {
    const [chartData, setChartData] = useState(null);
    const [stats, setStats] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null); // State to track selected question
    const [analyticsData, setAnalyticsData] = useState(null); // State to store overall analytics data

    useEffect(() => {
        const loadStats = async () => {
            const stats = await fetchUserChoicesStats();
            setStats(stats.questionStats); // Update stats state with question stats
            setAnalyticsData({
                totalResponses: stats.totalResponses,
                averageAge: stats.averageAge,
                educationStats: stats.educationStats,
            });
        };
        loadStats();
    }, []);

    useEffect(() => {
        if (stats.length > 0) {
            // Initial chart data setup with all labels
            const initialChartData = formatChartData(stats);
            setChartData(initialChartData);
        }
    }, [stats]);

    useEffect(() => {
        // Update chart data when selected question changes
        if (selectedQuestion) {
            const filteredChartData = formatChartData(stats, selectedQuestion);
            setChartData(filteredChartData);
        }
    }, [selectedQuestion, stats]);

    const formatChartData = (stats, selectedQuestion = null) => {
        if (!stats || stats.length === 0) {
            return null;
        }

        // Extract all unique answer options across all questions
        const allLabels = stats.flatMap(stat => stat.answers.map(answer => answer.answer));
        const uniqueLabels = Array.from(new Set(allLabels));

        // Filter visible questions and their corresponding datasets
        const visibleStats = stats.filter(stat => stat.visible !== false);

        // Determine labels based on selected question or all questions
        let labelsToDisplay = uniqueLabels;
        if (selectedQuestion) {
            labelsToDisplay = visibleStats.find(stat => stat.question === selectedQuestion)?.answers.map(answer => answer.answer) || [];
        }

        const datasets = visibleStats.map(stat => {
            const data = labelsToDisplay.map(label => {
                const answer = stat.answers.find(answer => answer.answer === label);
                return answer ? answer.count : 0;
            });

            return {
                label: stat.question,
                data: data,
                borderColor: generateRandomColor(), // Line color
                fill: false, // Disable fill for Line chart
                tension: 0.4, // Line curve tension
                hidden: !stat.visible, // Hide dataset if question is not visible
            };
        });

        return {
            labels: labelsToDisplay,
            datasets: datasets,
        };
    };

    const generateRandomColor = () => {
        const randomColor = () => Math.floor(Math.random() * 256);
        return `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.6)`;
    };

    const handleSwitchChange = (question) => {
        setSelectedQuestion(question === selectedQuestion ? null : question);
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ flex: '1', marginRight: '20px' }}>
                <h1>Survey Analytics</h1>
                {chartData ? (
                    <Line
                        data={chartData}
                        options={{
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Number of Responses'
                                    }
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Answer Options'
                                    },
                                    ticks: {
                                        callback: function(value, index, values) {
                                            // Display labels from the dataset
                                            return chartData.labels[index];
                                        },
                                        autoSkip: false, // Prevent auto-skipping of ticks
                                        maxRotation: 90, // Rotate labels for better readability
                                        minRotation: 0, // Minimum rotation angle
                                        padding: 10, // Padding between tick labels and axis
                                    }
                                }
                            }
                        }}
                    />
                ) : (
                    <p>Loading...</p>
                )}
            </div>
            <div style={{ flex: '1' }}>
                <div>
                    {stats.map(stat => (
                        <div key={stat.question} style={{ marginBottom: '10px' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={selectedQuestion === stat.question}
                                        onChange={() => handleSwitchChange(stat.question)}
                                        color="primary"
                                    />
                                }
                                label={stat.question}
                            />
                        </div>
                    ))}
                </div>
                <div>
                    <h3>Overall Analytics</h3>
                    <p>Total Responses: {analyticsData ? analyticsData.totalResponses : 'Loading...'}</p>
                    <p>Average Age: {analyticsData ? analyticsData.averageAge : 'Loading...'}</p>
                    <h4>Education Level Distribution:</h4>
                    {analyticsData ? (
                        <ul>
                            {analyticsData.educationStats.map((educationStat, index) => (
                                <li key={index}>
                                    {educationStat.level}: {educationStat.count}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </div>
        </div>
    );
}
