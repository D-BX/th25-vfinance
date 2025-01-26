import React, { useState } from "react";
import { useChat } from "../hooks/useChat";

const cn = (...classes) => classes.filter(Boolean).join(' ');

const DecisionTree = () => {
    const { chat } = useChat();

    const getResponse = (option) => {
        const responses = {
            Investment: "Let's explore your investment options to grow your wealth.",
            Stocks: "The stock market offers opportunities for both long and short-term growth.",
            "Real Estate": "Real estate can provide both rental income and property appreciation.",
            Budgeting: "Good budgeting is the foundation of financial success.",
            "Saving for Retirement": "Planning for retirement early helps ensure financial security.",
            "Emergency Fund": "An emergency fund provides crucial financial protection.",
            "Debt Reduction": "Managing debt is key to financial freedom.",
            "Tax Planning": "Strategic tax planning can significantly impact your finances.",
            "Maximizing Deductions": "Let's identify all possible tax deductions for you.",
            "Minimizing Tax Liability": "We'll explore ways to reduce your tax burden legally.",
        }
        return responses[option] || "Let's analyze your financial situation."
    }

    const tree = {
        question: "What is your primary financial goal?",
        options: [
            {
                label: "Investment",
                next: {
                    question: "What type of investment are you interested in?",
                    options: [
                        {
                            label: "Stocks",
                            next: {
                                question: "Upload your financial documents",
                                isFileUpload: true
                            }
                        },
                        {
                            label: "Real Estate",
                            next: {
                                question: "Upload your financial documents",
                                isFileUpload: true
                            }
                        },
                    ],
                },
            },
            {
                label: "Budgeting",
                next: {
                    question: "What is your main budgeting goal?",
                    options: [
                        {
                            label: "Saving for Retirement",
                            next: {
                                question: "What's your retirement savings goal?",
                                isInput: true,
                                inputType: "number",
                                placeholder: "Enter amount",
                                next: {
                                    question: "Upload your financial documents",
                                    isFileUpload: true
                                }
                            }
                        },
                        {
                            label: "Emergency Fund",
                            next: {
                                question: "Select your location",
                                isDropdown: true,
                                options: ["Texas", "California", "Florida", "New York", "Colorado"],
                                next: {
                                    question: "What's your monthly expense amount?",
                                    isInput: true,
                                    inputType: "number",
                                    placeholder: "Enter monthly expenses",
                                    next: {
                                        question: "How much can you save monthly?",
                                        isInput: true,
                                        inputType: "number",
                                        placeholder: "Enter monthly savings",
                                        next: {
                                            question: "Upload your financial documents",
                                            isFileUpload: true
                                        }
                                    }
                                }
                            }
                        },
                        {
                            label: "Debt Reduction",
                            next: {
                                question: "Upload your financial documents",
                                isFileUpload: true
                            }
                        },
                    ],
                },
            },
            {
                label: "Tax Planning",
                next: {
                    question: "What is your primary focus for tax planning?",
                    options: [
                        {
                            label: "Maximizing Deductions",
                            next: {
                                question: "Upload your financial documents",
                                isFileUpload: true
                            }
                        },
                        {
                            label: "Minimizing Tax Liability",
                            next: {
                                question: "Upload your financial documents",
                                isFileUpload: true
                            }
                        },
                    ],
                },
            },
        ],
    };

    const [currentNode, setCurrentNode] = useState(tree);
    const [path, setPath] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");

    const handleOptionClick = (option) => {
        setPath([...path, option.label]);
        chat(getResponse(option.label));
        if (option.next) {
            setCurrentNode(option.next);
        } else {
            alert(`Final Decision Path: ${[...path, option.label].join(" > ")}`);
            resetTree();
        }
    };

    const handleInputSubmit = () => {
        if (inputValue) {
            setPath([...path, inputValue]);
            chat(`Great, you've set a target of $${inputValue}.`);
            setCurrentNode(currentNode.next);
            setInputValue("");
        }
    };

    const handleLocationSelect = (e) => {
        const location = e.target.value;
        if (location) {
            setSelectedLocation(location);
            setPath([...path, location]);
            chat(`${location} has specific financial considerations we'll factor in.`);
            setCurrentNode(currentNode.next);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPath([...path, 'Document Uploaded']);
            chat("I'll analyze your financial documents to provide personalized advice.");
            alert(`Final Decision Path: ${[...path, 'Document Uploaded'].join(" > ")}`);
            resetTree();
        }
    };

    const resetTree = () => {
        setCurrentNode(tree);
        setPath([]);
        setInputValue("");
        setSelectedLocation("");
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[600px] p-8">
            <div className="relative w-full max-w-2xl aspect-square bg-gradient-to-br from-blue-600/30 to-white/5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm flex flex-col items-center justify-center p-8">
                <div className="text-2xl font-bold text-white text-center mb-8 p-4 rounded-xl bg-white/10 border border-white/20 shadow-lg animate-pulse">
                    {currentNode.question}
                </div>

                {currentNode.isDropdown ? (
                    <select
                        value={selectedLocation}
                        onChange={handleLocationSelect}
                        className="w-4/5 p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Location</option>
                        {currentNode.options.map((option, index) => (
                            <option key={index} value={option} className="bg-gray-900">
                                {option}
                            </option>
                        ))}
                    </select>
                ) : currentNode.isInput ? (
                    <div className="flex flex-col items-center gap-4 w-4/5">
                        <input
                            type={currentNode.inputType || "text"}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={currentNode.placeholder}
                            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleInputSubmit}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                ) : currentNode.isFileUpload ? (
                    <div className="flex flex-col items-center gap-4">
                        <input type="file" onChange={handleFileUpload} className="hidden" id="fileInput" />
                        <label
                            htmlFor="fileInput"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                        >
                            Choose File
                        </label>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-4 my-8">
                        {currentNode.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(option)}
                                className={cn(
                                    "px-4 py-2 text-sm text-white border border-white/20",
                                    "rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-300",
                                    "hover:bg-blue-600/50 hover:border-white/50 hover:scale-110",
                                    "w-32 text-center"
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}

                <button
                    onClick={resetTree}
                    className="absolute bottom-6 px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Reset Tree
                </button>
            </div>
        </div>
    );
}

export default DecisionTree;
