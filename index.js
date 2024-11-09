const fs = require('fs');

fs.readFile('public/Articles.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  const jsonData = JSON.parse(data);
  console.log(jsonData.articles);
});

function displayData(data) {
  
}

function popularitySort(){

}

function switchTheme(){     

}

function mostPopular(){

}

function readingTime(){
    let avgSpeed = 200 //words per min
}
