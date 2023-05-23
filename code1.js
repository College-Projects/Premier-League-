const fs = require('fs');
const readline = require('readline');
class Graph {
  constructor() {
    this.nodes = {};
  }

  addNode(round) {
    if (!this.nodes[round]) {
      this.nodes[round] = [];
    }
  }

  addEdge(round, match) {
    if (!this.nodes[round]) {
      this.addNode(round);
    }

    this.nodes[round].push(match);
  }

  getMatchesByRound(round) {
    return this.nodes[round] || [];
  }
}


function parseDate(dateString) {
  const parts = dateString.split('/');
  const day = parseInt(parts[0])+1;
  const month = parseInt(parts[1])-1 ; 
  const year = parseInt(parts[2]);
  return new Date(year, month, day);
} 
 


function buildGraph(filename) {
  const graph = new Graph();   

  const fileData = fs.readFileSync(filename, 'utf-8');
  const lines = fileData.split('\n');

  lines.forEach(line => {
    const [round, date, homeTeam, awayTeam, homeGoals, awayGoals, result] = line.split(',');

    const match = {
      round:parseInt(round),
      date:parseDate(date),
      homeTeam,
      awayTeam,
      homeGoals:parseInt(homeGoals),
      awayGoals: parseInt(awayGoals),
      result
    };
    if(homeGoals != '-' ){
    graph.addNode(match.round);  
    graph.addEdge(match.round, match);  
    }
  });

  return graph;
}

function calculateTeamStatisticsByRound(graph, roundNumber) {
  const EachRound = {};
  const visitedMatches = new Set();

  function traverseMatches(round) {
    if (round > roundNumber) {
      return; // Stop the traversal if the current round exceeds the given round number
    }
    const matches = graph.getMatchesByRound(round);

    for (const match of matches) {
      if (!visitedMatches.has(match)) {
        const { round, date, homeTeam, awayTeam, homeGoals, awayGoals, result } = match;

        if (!EachRound[homeTeam]) {
          EachRound[homeTeam] = {
            matches: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            df: 0,
          };
        }
        if (!EachRound[awayTeam]) {
          EachRound[awayTeam] = {
            matches: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            df: 0,
          };
        }

        EachRound[homeTeam].matches++;
        EachRound[homeTeam].goalsFor += homeGoals;
        EachRound[homeTeam].goalsAgainst += awayGoals;
        EachRound[homeTeam].df = EachRound[homeTeam].df + homeGoals - awayGoals;

        if (result === 'H') {
          EachRound[homeTeam].wins++;
          EachRound[homeTeam].points += 3;
        } else if (result === 'A') {
          EachRound[homeTeam].losses++;
        } else {
          EachRound[homeTeam].draws++;
          EachRound[homeTeam].points++;
        }

        EachRound[awayTeam].matches++;
        EachRound[awayTeam].goalsFor += awayGoals;
        EachRound[awayTeam].goalsAgainst += homeGoals;
        EachRound[awayTeam].df = EachRound[awayTeam].df + awayGoals - homeGoals;

        if (result === 'A') {
          EachRound[awayTeam].wins++;
          EachRound[awayTeam].points += 3;
        } else if (result === 'H') {
          EachRound[awayTeam].losses++;
        } else {
          EachRound[awayTeam].draws++;
          EachRound[awayTeam].points++;
        }

        visitedMatches.add(match);
      }
    }

    if (round < roundNumber) {
      traverseMatches(round + 1);
    }
  }

  traverseMatches(1);
   // Sort the result by points
   const sortedResult = Object.entries(EachRound).sort((a, b) => b[1].points - a[1].points);

   // Convert the sorted result back to an object
   const sortedEachRound = sortedResult.reduce((acc, [team, stats]) => {
     acc[team] = stats;
     return acc;
   }, {});
 
   return sortedEachRound;
  
}


function calculateTeamStatisticsByDate(graph, date) {
  const EachRound = {};
  const visitedMatches = new Set();

  function traverseMatches(round) {
    const matches = graph.getMatchesByRound(round);

    for (const match of matches) {
      if (!visitedMatches.has(match)) {
        visitedMatches.add(match);

        const { round, date: matchDate, homeTeam, awayTeam, homeGoals, awayGoals, result } = match;

        
        if (matchDate <= parseDate(date)) {
          if (!EachRound[homeTeam]) {
            EachRound[homeTeam] = {
              matches: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              points: 0,
              df: 0,
            };
          }
          if (!EachRound[awayTeam]) {
            EachRound[awayTeam] = {
              matches: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              points: 0,
              df: 0,
            };
          }

          // Update team statistics for home team
          EachRound[homeTeam].matches++;
          EachRound[homeTeam].goalsFor += homeGoals;
          EachRound[homeTeam].goalsAgainst += awayGoals;
          EachRound[homeTeam].df = EachRound[homeTeam].df + homeGoals - awayGoals;
          if (result === 'H') {
            EachRound[homeTeam].wins++;
            EachRound[homeTeam].points += 3;
          } else if (result === 'A') {
            EachRound[homeTeam].losses++;
          } else {
            EachRound[homeTeam].draws++;
            EachRound[homeTeam].points++;
          }

          // Update team statistics for away team
          EachRound[awayTeam].matches++;
          EachRound[awayTeam].goalsFor += awayGoals;
          EachRound[awayTeam].goalsAgainst += homeGoals;
          EachRound[awayTeam].df = EachRound[awayTeam].df + awayGoals - homeGoals;
          if (result === 'A') {
            EachRound[awayTeam].wins++;
            EachRound[awayTeam].points += 3;
          } else if (result === 'H') {
            EachRound[awayTeam].losses++;
          } else {
            EachRound[awayTeam].draws++;
            EachRound[awayTeam].points++;
          }
        }
      }
    }

    if (graph.getMatchesByRound(round + 1).length > 0) {
      traverseMatches(round + 1);
    }
  }

  traverseMatches(1);
  // Sort the result by points
  const sortedResult = Object.entries(EachRound).sort((a, b) => b[1].points - a[1].points);

  // Convert the sorted result back to an object
  const sortedEachRound = sortedResult.reduce((acc, [team, stats]) => {
    acc[team] = stats;
    return acc;
  }, {});

  return sortedEachRound;

  
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter "round" or "date": ', (answer) => {
  if (answer === 'round') {
    rl.question('Enter round number: ', (round) => {
      const graph = buildGraph('results.csv');
      const cal = calculateTeamStatisticsByRound(graph, parseInt(round));
      console.log(cal);

      rl.close();
    });
  } else if (answer === 'date') {
    rl.question('Enter date (format: DD/MM/YYYY): ', (date) => {
      const graph = buildGraph('results.csv');
      const cal = calculateTeamStatisticsByDate(graph, date);
      console.log(cal);

      rl.close();
    });
  } else {
    console.log('Invalid input');
    rl.close();
  }
});