const axios = require("axios");

// Function to make HTTP GET request
async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    throw error;
  }
}

// Function to make HTTP POST request
async function submitData(url, data) {
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error("Error submitting data:", error.message);
    throw error;
  }
}

// Function to process transactions and submit the result
async function processTransactions() {
  try {
    // Step 1: Get data from the first endpoint
    const taskData = await fetchData(
      "https://interview.adpeai.com/api/v2/get-task"
    );

    // Step 2: Extract transactions from the previous year
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const lastYearTransactions = taskData.transactions.filter(
      (transaction) =>
        new Date(transaction.timeStamp).getFullYear() === lastYear
    );

    // Step 3: Find the top earner of last year
    const topEarner = lastYearTransactions.reduce((acc, transaction) => {
      const employeeID = transaction.employee.id;
      acc[employeeID] = (acc[employeeID] || 0) + transaction.amount;
      return acc;
    }, {});

    const topEarnerID = Object.keys(topEarner).reduce((a, b) =>
      topEarner[a] > topEarner[b] ? a : b
    );

    // Step 4: Get transaction IDs of the top earner with type alpha
    const topEarnerTransactions = lastYearTransactions.filter(
      (transaction) =>
        transaction.employee.id === topEarnerID && transaction.type === "alpha"
    );

    const transactionIDs = topEarnerTransactions.map(
      (transaction) => transaction.transactionID
    );

    // Step 5: Submit the result to the second endpoint
    const result = {
      id: taskData.id,
      result: transactionIDs,
    };

    const submissionResult = await submitData(
      "https://interview.adpeai.com/api/v2/submit-task",
      result
    );

    console.log("Submission Result:", submissionResult);
  } catch (error) {
    console.error("Error processing transactions:", error.message);
  }
}

// Run the processTransactions function
processTransactions();
