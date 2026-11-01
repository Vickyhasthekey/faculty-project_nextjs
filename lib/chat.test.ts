import { strict as assert } from "node:assert"
import { test } from "node:test"

import { facultyContext, searchQueryForChat, shouldShowFaculty } from "./chat.ts"
import type { FacultyHit } from "./search.ts"

const hit: FacultyHit = {
  Professor: "Stefano Soatto",
  University: "UCLA",
  Department: "Engineering",
  Interest: "Computer vision",
  Interests: ["Computer vision", "Machine learning"],
  Similarity: 0.9,
  "Personal Website": "https://samueli.ucla.edu/people/stefano-soatto/",
}

test("facultyContext includes the personal website", () => {
  const text = facultyContext([hit])
  assert.match(text, /Stefano Soatto/)
  assert.match(text, /https:\/\/samueli\.ucla\.edu\/people\/stefano-soatto\//)
})

test("a new question is searched as written", () => {
  assert.equal(searchQueryForChat("Who works on robotics?", [], []), "Who works on robotics?")
})

test("a follow-up keeps the original topic", () => {
  const query = searchQueryForChat(
    "Which of those are in mathematics?",
    [{ role: "user", content: "Who studies computer vision?" }],
    [hit],
  )
  assert.equal(query, "Who studies computer vision?. Which of those are in mathematics?")
})

test("a greeting does not show professor cards", () => {
  assert.equal(shouldShowFaculty("hello", [], []), false)
  assert.equal(shouldShowFaculty("help me find a professor", [], []), false)
})

test("a research area shows professor cards", () => {
  assert.equal(shouldShowFaculty("Who works on medical imaging?", [], []), true)
  assert.equal(shouldShowFaculty("computer vision", [], []), true)
})

test("a follow-up shows cards only after a research topic", () => {
  assert.equal(
    shouldShowFaculty("Which of those are in mathematics?", [{ role: "user", content: "hello" }], []),
    false,
  )
  assert.equal(
    shouldShowFaculty(
      "Which of those are in mathematics?",
      [{ role: "user", content: "Who studies computer vision?" }],
      [],
    ),
    true,
  )
})

test("naming a previous professor searches that name", () => {
  const query = searchQueryForChat("Tell me more about Stefano Soatto", [], [hit])
  assert.equal(query, "Stefano Soatto")
})
