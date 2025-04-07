let bars = [];
let barValues = [];
let heights = [];

let barSlider = document.getElementById("barSlider");
let speedSlider = document.getElementById("speedSlider");
let n = barSlider.value;
let delay = 375 - speedSlider.value;

const generateButton = document.getElementById("generateButton");
const sortButton = document.getElementById("sortButton");
const stopButton = document.getElementById("stopButton");
const pauseButton = document.getElementById("pauseButton");

let container = document.getElementById("container");
let height = container.offsetHeight;
let width = container.offsetWidth;
let lineWidth = width / n - 1;

let isGenerated = true;
let isSorted = false;
let isPaused = false;
let isStopped = true;

// Stack implementation
class Stack {
  constructor() {
    this.arr = [];
    this.top = -1;
  }

  push(element) {
    this.top++;
    this.arr.push(element);
  }

  isEmpty() {
    return this.top == -1;
  }

  pop() {
    if (this.isEmpty() === false) {
      this.top = this.top - 1;
      return this.arr.pop();
    }
  }
}

// Get random value between min and max
function getRandomValue(min, max) {
  return Math.random() * (max - min) + min;
}

// Create random heights of the bar and create div element
function generateRandomArray() {
  isGenerated = true;
  isSorted = false;
  isPaused = false;
  isStopped = true;

  n = barSlider.value;
  lineWidth = width / n - 1;
  container.innerHTML = "";

  for (let i = 0; i < n; i++) {
    heights[i] = parseInt(getRandomValue(1, height));
    bars.push(document.createElement("div"));
    bars[i].style.height = `${heights[i]}px`;
    bars[i].style.width = `${lineWidth}px`;
    bars[i].style.backgroundColor = "white";
    bars[i].style.transform = `translate(${i * lineWidth + i}px)`;
    bars[i].className = "bar";
    container.appendChild(bars[i]);

    // If there are more numbers of bars, then it is not feasible to show bar values
    if (n <= 60) {
      barValues.push(document.createElement("div"));
      barValues[i].innerHTML = heights[i];
      barValues[i].style.marginBottom = `${heights[i + 5]}px`;
      barValues[i].style.transform = `translate(${i * lineWidth + i}px)`;
      barValues[i].className = "barValue";
      container.appendChild(barValues[i]);
    }
  }
}
generateRandomArray();

// Swaps 2 bars and swaps the transform property for the animation
function swap(i, minIndex) {
  [heights[i], heights[minIndex]] = [heights[minIndex], heights[i]];

  [bars[i], bars[minIndex]] = [bars[minIndex], bars[i]];
  [bars[i].style.transform, bars[minIndex].style.transform] = [
    bars[minIndex].style.transform,
    bars[i].style.transform,
  ];

  [barValues[i], barValues[minIndex]] = [barValues[minIndex], barValues[i]];
  [barValues[i].style.transform, barValues[minIndex].style.transform] = [
    barValues[minIndex].style.transform,
    barValues[i].style.transform,
  ];
}

// Draws bars with updated heights
function draw(coloredBars, colors) {
  // coloredBars has indices of the bars which will be in different colors
  // colors array has colors for different bars
  for (let i = 0; i < n; i++) {
    bars[i].style.backgroundColor = "white";
    for (let j = 0; j < coloredBars.length; j++) {
      if (i == coloredBars[j]) {
        bars[i].style.backgroundColor = colors[j];
        break;
      }
    }
  }
}

// Delays between animations
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// After sorting is finished, play animation
async function sortedAnimation() {
  for (let i = 0; i < n; i++) {
    bars[i].style.backgroundColor = "lime";
    await sleep(10);
  }
  await sleep(300);

  for (let i = 0; i < n; i++) {
    bars[i].style.backgroundColor = "white";
    await sleep(10);
  }
}

// Sorting implementation
async function bubbleSort() {
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (isStopped) {
        draw([], []);
        return;
      }
      if (!isPaused) {
        if (heights[j] > heights[j + 1]) {
          swap(j, j + 1);
        }
        draw([j, j + 1], ["green", "yellow"]);
      } else {
        j--;
      }
      await sleep(delay);
    }
  }
  console.log("Bubble Sort completed");
  draw([], []);
  isSorted = true;
  isPaused = false;
  isStopped = true;
  sortedAnimation();
}

async function insertionSort() {
  for (let i = 0; i < n; i++) {
    let key = heights[i];
    for (let j = i - 1; j >= 0 && heights[j] > key; j--) {
      if (isStopped) {
        draw([], []);
        return;
      }
      if (!isPaused) {
        swap(j, j + 1);
        draw([j, i + 1], ["green", "red"]);
      } else {
        j++;
      }
      await sleep(delay);
    }
  }
  console.log("Insertion Sort completed");
  draw([], []);
  isSorted = true;
  isPaused = false;
  isStopped = true;
  sortedAnimation();
}

async function selectionSort() {
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (isStopped) {
        draw([], []);
        return;
      }
      if (!isPaused) {
        if (heights[j] < heights[minIndex]) {
          minIndex = j;
        }
        draw([i, j, minIndex], ["blue", "red", "green"]);
      } else {
        j--;
      }
      await sleep(delay);
    }
    swap(i, minIndex);
  }
  console.log("Selection Sort completed");
  draw([], []);
  isSorted = true;
  isPaused = false;
  isStopped = true;
  sortedAnimation();
}

async function mergeSort() {
  for (let curSize = 1; curSize < n; curSize *= 2) {
    for (let start = 0; start < n - 1; start += 2 * curSize) {
      let mid = Math.min(start + curSize - 1, n - 1);
      let end = Math.min(start + 2 * curSize - 1, n - 1);
      let n1 = mid - start + 1;
      let n2 = end - mid;
      let l = [],
        r = [];
      for (let i = 0; i < n1; i++) l.push(heights[start + i]);
      for (let j = 0; j < n2; j++) r.push(heights[mid + 1 + j]);
      let i = 0,
        j = 0,
        k = start;

      let barsIndices = [];
      let barColors = [];
      for (let i1 = start; i1 <= end; i1++) {
        barsIndices.push(i1);
        barColors.push("yellow");
      }

      while (i < n1 || j < n2) {
        if (isStopped) {
          draw([], []);
          return;
        }
        if (!isPaused) {
          if (j == n2 || (i < n1 && l[i] <= r[j])) {
            draw([k, ...barsIndices], ["green", ...barColors]);
            i++;
          } else {
            for (let i1 = mid + 1 + j; i1 > k; i1--) {
              swap(i1, i1 - 1);
            }
            draw([k, ...barsIndices], ["green", ...barColors]);
            j++;
          }
          k++;
        }
        await sleep(delay);
      }
    }
  }
  console.log("Merge Sort completed");
  draw([], []);
  isSorted = true;
  isPaused = false;
  isStopped = true;
  sortedAnimation();
}

async function quickSort() {
  let s = new Stack();
  s.push(0);
  s.push(n - 1);

  while (!s.isEmpty()) {
    let h = s.pop();
    let l = s.pop();

    let i = l - 1;

    let barsIndices = [];
    let barColors = [];
    for (let i1 = l; i1 <= h; i1++) {
      barsIndices.push(i1);
      barColors.push("yellow");
    }

    for (let j = l; j <= h - 1; j++) {
      if (isStopped) {
        draw([], []);
        return;
      }
      if (!isPaused) {
        draw([i, j, ...barsIndices], ["green", "red", ...barColors]);
        if (heights[j] <= heights[h]) {
          i++;
          swap(i, j);
        }
      } else {
        j--;
      }
      await sleep(delay);
    }
    swap(i + 1, h);
    let partition = i + 1;
    if (l < partition - 1) {
      s.push(l);
      s.push(partition - 1);
    }
    if (partition + 1 < h) {
      s.push(partition + 1);
      s.push(h);
    }
  }
  console.log("Quick Sort completed");
  draw([], []);
  isSorted = true;
  isPaused = false;
  isStopped = true;
  sortedAnimation();
}

// When the slider value is changed, generate new bars and update the value of the bar count
barSlider.oninput = () => {
  document.querySelector(".sliderValue").innerHTML = `Bars: ${barSlider.value}`;
  generateRandomArray();
};

speedSlider.oninput = () => {
  delay = 375 - speedSlider.value;
};

generateButton.addEventListener("click", generateRandomArray);
sortButton.addEventListener("click", () => {
  // Get the name of the selected algorithm
  type = document.getElementById("sortType").value;

  // If there is another visualization going, then return from the function
  if (!isStopped) return;
  if (isSorted || !isGenerated) generateRandomArray();

  isGenerated = false;
  isPaused = false;
  isStopped = false;

  if (type === "bubble") bubbleSort();
  if (type === "insertion") insertionSort();
  if (type === "selection") selectionSort();
  if (type === "merge") mergeSort();
  if (type === "quick") quickSort();
});

stopButton.addEventListener("click", () => {
  isStopped = true;
  isPaused = false;
  pauseButton.innerHTML = "Pause";

  if (!isGenerated && !isSorted) generateRandomArray();
});

pauseButton.addEventListener("click", () => {
  // If sorting is in progress, then isStopped will be false
  if (!isStopped) {
    if (isPaused) {
      pauseButton.innerHTML = "Pause";
      isPaused = false;
    } else {
      pauseButton.innerHTML = "Resume";
      isPaused = true;
    }
  }
});
