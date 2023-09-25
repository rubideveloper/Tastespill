import React, { useState, useEffect } from "react";

const App = () => {
  // State variables to manage various aspects of the game
  const [timer, setTimer] = useState(120); // Timer for the game
  const [halloweenWords, setHalloweenWords] = useState([]); // List of Halloween-themed words
  const [currentWord, setCurrentWord] = useState(""); // The word to be typed by the user
  const [isGameStarted, setIsGameStarted] = useState(false); // Flag to track if the game has started
  const [userInput, setUserInput] = useState(""); // User's input
  const [score, setScore] = useState(0); // Player's score
  const [correctWordsInARow, setCorrectWordsInARow] = useState(0); // Consecutive correct words
  const [extraPoints, setExtraPoints] = useState(0); // Extra points for streaks
  const [userName, setUserName] = useState(""); // Player's name

  // Fetch Halloween-themed words from a JSON file when the component mounts
  useEffect(() => {
    fetch("data/halloweenWords.json")
      .then((response) => response.json())
      .then((data) => {
        setHalloweenWords(data.halloweenWords);
      })
      .catch((error) =>
        console.error("Feil ved henting av halloween-ordene", error)
      );
  }, []);

  // Timer logic for the game
  useEffect(() => {
    let interval;
    if (isGameStarted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    if (timer === 0) {
      clearInterval(interval);
    }

    // Clean up the interval when the component unmounts or when conditions change
    return () => {
      clearInterval(interval);
    };
  }, [isGameStarted, timer]);

  // Calculate the score earned for the current word
  const calculateScore = () => {
    let pointsEarned = 0;
    for (let i = 0; i < userInput.length && i < currentWord.length; i++) {
      if (userInput[i] === currentWord[i]) {
        pointsEarned += 1;
      }
    }
    return pointsEarned;
  };

  // Calculate the penalty for incorrect characters in the user's input
  const calculatePenalty = () => {
    let penalty = 0;
    for (let i = 0; i < userInput.length && i < currentWord.length; i++) {
      if (userInput[i] !== currentWord[i]) {
        penalty += 1;
      }
    }
    return penalty;
  };

  // Handle user input when the spacebar is pressed
  const handleKeyDown = (e) => {
    if (e.key === " ") {
      e.preventDefault();

      const pointsEarned = calculateScore();
      const isWordCorrect = userInput === currentWord;
      const bonusPoints = isWordCorrect ? 50 : 0;

      // Calculate and update the player's score
      const penalty = calculatePenalty();
      setScore((prevScore) => prevScore + pointsEarned + bonusPoints - penalty);

      // Handle streaks of correct words
      if (isWordCorrect) {
        setCorrectWordsInARow((prev) => prev + 1);
      } else {
        setCorrectWordsInARow(0);
      }

      // Grant extra points for achieving a streak
      if (correctWordsInARow === 2) {
        setExtraPoints((prev) => prev + 100);
        setCorrectWordsInARow(0);
      }

      // Generate a new random word for the player to type
      const randomWordIndex = Math.floor(Math.random() * halloweenWords.length);
      setCurrentWord(halloweenWords[randomWordIndex]);
      setUserInput("");
    }
  };

  // Start the game when the "Start Spill" button is clicked
  const startGame = () => {
    if (userName.trim() === "") {
      alert("Navn må tastes inn før du starter spillet");
      return;
    }

    // Initialize game variables and start the timer
    setIsGameStarted(true);
    setTimer(120);
    const randomWordIndex = Math.floor(Math.random() * halloweenWords.length);
    setCurrentWord(halloweenWords[randomWordIndex]);
  };

  // JSX for rendering the game UI
  return (
    <div className="App">
      <h1>Tastespill</h1>
      {!isGameStarted ? (
        // Render input for player's name and start button before the game starts
        <div>
          <label>
            Navn:
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />{" "}
            <br />
          </label>
          <button onClick={startGame}>Start Spill</button>
        </div>
      ) : (
        // Render game elements during gameplay
        <div>
          <div className="timer">
            Tid igjen: <span>{timer} sekunder</span>
          </div>
          <div className="word">{currentWord}</div>
          <input
            type="text"
            disabled={timer === 0}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
          {timer === 0 && isGameStarted ? (
            // Display final score when the game ends
            <div>Spillet er ferdig. Du fikk {score + extraPoints} poeng</div>
          ) : (
            // Display the player's score during gameplay
            <div className="score">Poeng: {score + extraPoints}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
