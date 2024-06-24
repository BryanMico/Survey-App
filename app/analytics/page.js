"use client";

import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getUserChoicesStats } from '../../api/server';

// Register the required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fetchUserChoicesStats = async () => {
    try {
        const response = await getUserChoicesStats();
        return response;
    } catch (error) {
        console.error('Error fetching user choices stats:', error);
        return [];
    }
};

export default function Analytics() {
    const [chartData, setChartData] = useState(null);
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const loadStats = async () => {
            const stats = await fetchUserChoicesStats();
            setStats(stats);
        };
        loadStats();
    }, []);

    useEffect(() => {
        if (stats.length > 0) {
            const formattedData = formatChartData(stats);
            setChartData(formattedData);
        }
    }, [stats]);

    const toggleQuestionVisibility = (questionId) => {
        const updatedStats = stats.map(stat =>
            stat.questionId === questionId ? { ...stat, visible: !stat.visible } : stat
        );
        setStats(updatedStats);
    };

    const formatChartData = (stats) => {
        if (!stats || stats.length === 0) {
            return null;
        }

        // Extract all unique answer options across all questions
        const allLabels = stats.flatMap(stat => stat.answers.map(answer => answer.answer));
        const uniqueLabels = Array.from(new Set(allLabels));

        // Filter visible questions and their corresponding datasets
        const visibleStats = stats.filter(stat => stat.visible !== false);

        const datasets = visibleStats.map(stat => {
            const data = uniqueLabels.map(label => {
                const answer = stat.answers.find(answer => answer.answer === label);
                return answer ? answer.count : 0;
            });

            return {
                label: stat.question,
                data: data,
                backgroundColor: generateRandomColor(),
                hidden: !stat.visible, // Hide dataset if question is not visible
            };
        });

        // Only show labels that correspond to visible questions
        const visibleLabels = uniqueLabels.filter(label =>
            visibleStats.some(stat => stat.answers.some(answer => answer.answer === label))
        );

        return {
            labels: visibleLabels,
            datasets: datasets,
        };
    };

    const generateRandomColor = () => {
        const randomColor = () => Math.floor(Math.random() * 256);
        return `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.6)`;
    };

    return (
        <div>
            <h1>Survey Analytics</h1>
            {chartData ? (
                <Bar
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
                                    }
                                }
                            }
                        }
                    }}
                />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
