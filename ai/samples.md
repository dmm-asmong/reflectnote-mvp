# ReflectNote AI Sample Inputs And Outputs

## Sample Input 1
```json
{
  "topic": "Photosynthesis",
  "concepts": ["chloroplast", "ATP", "glucose"],
  "explanation": "Plants use sunlight in the chloroplast to make ATP and then store energy in glucose.",
  "questions": ["Why is ATP needed before glucose is made?"],
  "wrongAnswerReasons": ["I mixed up ATP and glucose before."]
}
```

## Sample Output 1
```json
{
  "score": 5,
  "difficulty": "elementary",
  "feedback_summary": "Excellent understanding. Your explanation is clear, accurate, and very easy to follow.",
  "strengths": [
    "Correctly explains that sunlight drives the process",
    "Shows how ATP relates to making glucose"
  ],
  "improvements": [
    "Add one short detail about carbon dioxide or water for completeness"
  ],
  "missing_concepts": [],
  "misconception_flags": [],
  "metacognition_flags": [],
  "rewrite_prompt": "Rewrite this in 2 short sentences and include one detail about the inputs to photosynthesis."
}
```

## Sample Input 2
```json
{
  "topic": "Photosynthesis",
  "concepts": ["chloroplast", "ATP", "glucose"],
  "explanation": "Plants make glucose from sunlight.",
  "questions": [],
  "wrongAnswerReasons": ["I guessed"]
}
```

## Sample Output 2
```json
{
  "score": 2,
  "difficulty": "weak",
  "feedback_summary": "You have the main idea, but key steps are still missing. Let's make the explanation more complete and specific.",
  "strengths": [
    "Recognizes that sunlight is involved"
  ],
  "improvements": [
    "Explain where the process happens",
    "Name how ATP or energy transfer fits into the process"
  ],
  "missing_concepts": ["chloroplast", "ATP"],
  "misconception_flags": [],
  "metacognition_flags": [
    "Your reflection is still too general. Add one specific thing that confused you."
  ],
  "rewrite_prompt": "Rewrite the explanation in 3 short sentences. Include where photosynthesis happens and how ATP helps."
}
```
