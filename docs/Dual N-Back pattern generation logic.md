## **🎯 Goal of the Code**

We want to generate two **sequences**:

* 📍 `position[]`: when the **visual stimulus** should match what was shown *N steps ago*

* 🔊 `audio[]`: when the **audio stimulus** should match what was heard *N steps ago*

These matches should:

* Be spread across the game (not all at once)

* Not be **predictable**

* Not happen **too close together**

* Not have **too many in a row**

* Avoid **overlap** between audio and visual too often

---

## **🧠 What Is a Dual N-Back Game?**

In Dual N-Back, you’re shown a **square on a grid** and hear a **letter**.  
 You have to remember what you saw and heard **N steps ago**.

### **👇 Example with `n = 2`:**

| Step | Visual | Audio | Should Match? |
| ----- | ----- | ----- | ----- |
| 1 | 🟨 A |  |  |
| 2 | 🟥 B |  |  |
| 3 | 🟨 C | ✅ Positional match (like step 1\) |  |
| 4 | 🟩 B | ✅ Audio match (like step 2\) |  |

We mark `true` in the `position[]` or `audio[]` arrays at steps like 3 and 4\.

---

## **🛠️ How This Code Builds Those Arrays**

We want an output like this:

{  
  position: \[false, false, true, false, true, false, false, true\],  
  audio:    \[false, true, false, false, false, true, false, false\]  
}

That means:

* At `step 2`, the audio matches what was heard 2 steps earlier

* At `step 3`, the position matches 2 steps earlier

* And so on

---

## **⚙️ Key Constraints Implemented**

Here’s how the code keeps things **challenging but fair**:

| Constraint | Why it's important | Example |
| ----- | ----- | ----- |
| `minGap` between matches | Prevents matches from being too close together | Avoids `step 3`, `4`, `5` all being matches |
| `maxConsecutive` matches | Avoids streaks like `true, true, true` | Keeps attention engaged |
| `avoidOverlap` | Prevents both audio & position matching at the same time (unless desired) | Makes the player handle 2 separate tasks |
| `gaussianBias` | Encourages match spacing across the session, like a curve | Avoids all matches being at the start or end |

---

## **🔄 Random but Controlled: The Core Loop**

### **✳️ Think of this like placing `X` marks in a timeline:**

Time →  
\[ \] \[ \] \[X\] \[ \] \[X\] \[ \] \[ \] \[X\]   ← position matches  
\[ \] \[X\] \[ \] \[ \] \[ \] \[X\] \[ \] \[ \]   ← audio matches

The code:

1. Starts with all `false` values

2. Picks random slots

3. Checks:

   * Is the slot far enough from last one?

   * Would this break the `maxConsecutive` rule?

   * Is this already taken by the other type (if `avoidOverlap` is true)?

   * If `gaussianBias`, does it fit the "bell curve" across time?

4. If all is OK → it marks `true` and moves on

---

## **📊 Gaussian Bias: What’s That?**

This line adds a **natural rhythm**:

const probability \= gaussianWeight(normalized) // favor middle of timeline

This helps make matches feel spread out like this:

Match probability ↑  
      ▲▲▲▲  
       ▲   ▲  
     ▲       ▲  
  ▲            ▲  
\[ \] \[ \] \[X\] \[ \] \[X\] \[ \] \[X\] \[ \] \[ \] \[X\]   ← more likely near center

Rather than this:

\[X\] \[X\] \[X\] \[ \] \[ \] \[ \] \[ \] \[ \] \[ \] \[ \]

---

## **🧪 Visual Summary**

createDualNBackPattern()  
│  
├── placeMatches() → position\[\]  
│      ├─ shuffle  
│      ├─ check spacing (minGap, maxConsecutive)  
│      ├─ bias for spread  
│  
├── placeMatches() → audio\[\]  
│      ├─ same, but also avoids overlap with position  
│  
└── return { position\[\], audio\[\] }

---

## **✅ Final Output Example**

position \= \[false, false, true, false, true, false, false, true\]  
audio    \= \[false, true, false, false, false, true, false, false\]

UI will then use this to generate actual **stimuli** (sounds \+ grid visuals), and the game logic checks if the player correctly remembered the match at `n` steps ago.

